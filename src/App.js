import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import {
  initialProjects,
  initialServiceJobs,
  initialWarranty,
  ALL_PROJECT_CHECKLIST_FIELDS,
  PROJECT_CHECKLIST_FIELDS_ROW1,
  PROJECT_CHECKLIST_FIELDS_ROW2,
  CHECKLIST_LABELS,
  SERVICE_CHECKLIST_FIELDS,
  SERVICE_CHECKLIST_LABELS,
  DESIGNERS,
  CREW_MEMBERS,
  INSTALLERS,
} from './data/initialData';

// ─── Utility ────────────────────────────────────────────────────────────────

function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function fmtCurrency(v) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v || 0);
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function progressOf(checklist, fields) {
  const done = fields.filter(f => checklist[f] === '1' || (checklist[f] && checklist[f] !== '0' && checklist[f] !== 'X')).length;
  const applicable = fields.filter(f => checklist[f] !== 'X').length;
  return applicable === 0 ? 0 : Math.round((done / applicable) * 100);
}

// ─── Shared UI Components ────────────────────────────────────────────────────

function ChecklistBadge({ value, onChange, fieldKey }) {
  const cycle = { '0': '1', '1': 'X', 'X': '0' };
  const styles = {
    '1': 'bg-emerald-700 text-emerald-100',
    '0': 'bg-slate-700 text-slate-400',
    'X': 'bg-slate-600 text-slate-300',
  };
  const labels = { '1': '✓', '0': '–', 'X': 'N/A' };
  const isDate = value && !['0', '1', 'X'].includes(value);
  const badgeClass = isDate ? 'bg-blue-800 text-blue-100 text-xs px-1' : styles[value] || styles['0'];

  return (
    <button
      type="button"
      onClick={onChange ? () => onChange(cycle[value] || '0') : undefined}
      className={`checklist-badge ${badgeClass} cursor-${onChange ? 'pointer' : 'default'} hover:opacity-80 transition-opacity`}
      title={fieldKey}
    >
      {isDate ? value : (labels[value] || '–')}
    </button>
  );
}

function ProgressBar({ pct, color = 'bg-blue-500' }) {
  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 rounded-full progress-bar`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = status === 'Hold'
    ? 'bg-amber-900 text-amber-300 border border-amber-700'
    : 'bg-blue-900 text-blue-300 border border-blue-700';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>;
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search…'}
        className="pl-9 pr-4 py-2 w-full text-sm"
      />
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', options, textarea, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="text-sm">
          <option value="">— Select —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-sm resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-sm"
          required={required}
        />
      )}
    </div>
  );
}

// ─── Project Form ────────────────────────────────────────────────────────────

function ProjectForm({ initial, onSave, onCancel }) {
  const emptyChecklist = () => {
    const c = {};
    ALL_PROJECT_CHECKLIST_FIELDS.forEach(f => { c[f] = '0'; });
    return c;
  };

  const [form, setForm] = useState(initial || {
    client: '', jobNumber: '', designer: '', installer: '', contractValue: '',
    soldDate: '', targetDate: '', location: '', status: 'Active',
    notes: '', checklist: emptyChecklist(),
  });

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));
  const setChecklist = (k) => (v) => setForm(p => ({ ...p, checklist: { ...p.checklist, [k]: v } }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.client.trim()) return alert('Client name is required.');
    onSave({ ...form, contractValue: parseFloat(form.contractValue) || 0 });
  }

  const checklistSection = (fields, label) => (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {fields.map(f => (
          <div key={f} className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500">{CHECKLIST_LABELS[f]}</span>
            <ChecklistBadge value={form.checklist[f]} onChange={setChecklist(f)} fieldKey={f} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldInput label="Client Name" value={form.client} onChange={set('client')} required />
        <FieldInput label="Job Number" value={form.jobNumber} onChange={set('jobNumber')} />
        <FieldInput label="Designer" value={form.designer} onChange={set('designer')} options={DESIGNERS} />
        <FieldInput label="Installer" value={form.installer} onChange={set('installer')} options={INSTALLERS} />
        <FieldInput label="Contract Value ($)" value={form.contractValue} onChange={set('contractValue')} type="number" />
        <FieldInput label="Sold Date" value={form.soldDate} onChange={set('soldDate')} type="date" />
        <FieldInput label="Target Date" value={form.targetDate} onChange={set('targetDate')} />
        <FieldInput label="Location" value={form.location} onChange={set('location')} />
        <FieldInput label="Status" value={form.status} onChange={set('status')} options={['Active', 'Hold']} />
      </div>
      <FieldInput label="Notes" value={form.notes} onChange={set('notes')} textarea />
      <div className="border-t border-slate-600 pt-4 flex flex-col gap-4">
        {checklistSection(PROJECT_CHECKLIST_FIELDS_ROW1, 'Checklist – Row 1')}
        {checklistSection(PROJECT_CHECKLIST_FIELDS_ROW2, 'Checklist – Row 2')}
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm font-medium transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">Save Project</button>
      </div>
    </form>
  );
}

// ─── Projects Tab ────────────────────────────────────────────────────────────

function ProjectsTab() {
  const [projects, setProjects] = useLocalStorage('spm_projects', initialProjects);
  const [search, setSearch] = useState('');
  const [filterDesigner, setFilterDesigner] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterDesigner && p.designer !== filterDesigner) return false;
    if (q && !p.client.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q) && !p.jobNumber.includes(q)) return false;
    return true;
  });

  const totalValue = filtered.reduce((s, p) => s + (p.contractValue || 0), 0);

  function saveProject(data) {
    if (modalMode === 'add') {
      setProjects(p => [...p, { ...data, id: uid() }]);
    } else {
      setProjects(p => p.map(x => x.id === data.id ? data : x));
    }
    setModalMode(null);
    setEditTarget(null);
  }

  function deleteProject(id) {
    setProjects(p => p.filter(x => x.id !== id));
    setDeleteConfirm(null);
    setExpandedId(null);
  }

  function updateChecklist(projectId, field, value) {
    setProjects(p => p.map(x => x.id === projectId
      ? { ...x, checklist: { ...x.checklist, [field]: value } }
      : x
    ));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search client, location, job#…" />
        </div>
        <select value={filterDesigner} onChange={e => setFilterDesigner(e.target.value)} className="text-sm py-2">
          <option value="">All Designers</option>
          {DESIGNERS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm py-2">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Hold">Hold</option>
        </select>
        <button
          onClick={() => { setEditTarget(null); setModalMode('add'); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Project
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Showing</p>
          <p className="text-2xl font-bold text-white">{filtered.length} <span className="text-sm font-normal text-slate-400">projects</span></p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Contract Value</p>
          <p className="text-2xl font-bold text-emerald-400">{fmtCurrency(totalValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide">On Hold</p>
          <p className="text-2xl font-bold text-amber-400">{projects.filter(p => p.status === 'Hold').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Job#</th>
                <th className="text-left px-4 py-3">Designer</th>
                <th className="text-left px-4 py-3">Installer</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Sold</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3 min-w-32">Progress</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-slate-500">No projects found.</td></tr>
              )}
              {filtered.map(p => {
                const pct = progressOf(p.checklist, ALL_PROJECT_CHECKLIST_FIELDS);
                const isExpanded = expandedId === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className="row-hover border-t border-slate-700 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <td className="px-4 py-3 font-medium text-white">{p.client}</td>
                      <td className="px-4 py-3 text-slate-300">{p.jobNumber}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded font-mono">{p.designer}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.installer ? <span className="bg-purple-900 text-purple-200 text-xs px-2 py-0.5 rounded font-mono">{p.installer}</span> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-300 font-medium">{fmtCurrency(p.contractValue)}</td>
                      <td className="px-4 py-3 text-slate-300">{fmtDate(p.soldDate)}</td>
                      <td className="px-4 py-3 text-slate-300">{p.targetDate || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{p.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar pct={pct} color={pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'} />
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-slate-700 bg-slate-900">
                        <td colSpan={10} className="px-6 py-4">
                          <ProjectExpandedRow
                            project={p}
                            onEdit={() => { setEditTarget(p); setModalMode('edit'); }}
                            onDelete={() => setDeleteConfirm(p.id)}
                            onChecklistChange={(field, value) => updateChecklist(p.id, field, value)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <Modal
          title={modalMode === 'add' ? 'New Project' : `Edit: ${editTarget?.client}`}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          wide
        >
          <ProjectForm
            initial={editTarget}
            onSave={saveProject}
            onCancel={() => { setModalMode(null); setEditTarget(null); }}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p className="text-slate-300 mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm transition-colors">Cancel</button>
            <button onClick={() => deleteProject(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProjectExpandedRow({ project: p, onEdit, onDelete, onChecklistChange }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{p.client}</h3>
          {p.notes && <p className="text-sm text-slate-400 mt-1 italic">"{p.notes}"</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors">Edit</button>
          <button onClick={onDelete} className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors">Delete</button>
        </div>
      </div>
      <ChecklistGroup label="Row 1" fields={PROJECT_CHECKLIST_FIELDS_ROW1} checklist={p.checklist} onChange={onChecklistChange} />
      <ChecklistGroup label="Row 2" fields={PROJECT_CHECKLIST_FIELDS_ROW2} checklist={p.checklist} onChange={onChecklistChange} />
    </div>
  );
}

function ChecklistGroup({ label, fields, checklist, onChange }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {fields.map(f => (
          <div key={f} className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500 whitespace-nowrap">{CHECKLIST_LABELS[f]}</span>
            <ChecklistBadge value={checklist[f]} onChange={(v) => onChange(f, v)} fieldKey={f} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Service Jobs Tab ────────────────────────────────────────────────────────

function ServiceForm({ initial, onSave, onCancel }) {
  const emptyChecklist = () => {
    const c = {};
    SERVICE_CHECKLIST_FIELDS.forEach(f => { c[f] = '0'; });
    return c;
  };
  const [form, setForm] = useState(initial || {
    client: '', jobNumber: '', value: '', soldDate: '',
    location: '', productOrdered: false, workDescription: '',
    checklist: emptyChecklist(),
  });
  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));
  const setChecklist = (k) => (v) => setForm(p => ({ ...p, checklist: { ...p.checklist, [k]: v } }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.client.trim()) return alert('Client name is required.');
    onSave({ ...form, value: parseFloat(form.value) || 0 });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldInput label="Client Name" value={form.client} onChange={set('client')} required />
        <FieldInput label="Job Number" value={form.jobNumber} onChange={set('jobNumber')} />
        <FieldInput label="Value ($)" value={form.value} onChange={set('value')} type="number" />
        <FieldInput label="Sold Date" value={form.soldDate} onChange={set('soldDate')} type="date" />
        <FieldInput label="Location" value={form.location} onChange={set('location')} />
        <div className="flex items-center gap-3 pt-5">
          <input
            type="checkbox"
            id="productOrdered"
            checked={form.productOrdered}
            onChange={e => set('productOrdered')(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="productOrdered" className="text-sm text-slate-300">Product Ordered</label>
        </div>
      </div>
      <FieldInput label="Work Description" value={form.workDescription} onChange={set('workDescription')} textarea />
      <div className="border-t border-slate-600 pt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Checklist</p>
        <div className="flex flex-wrap gap-4">
          {SERVICE_CHECKLIST_FIELDS.map(f => (
            <div key={f} className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{SERVICE_CHECKLIST_LABELS[f]}</span>
              <ChecklistBadge value={form.checklist[f]} onChange={setChecklist(f)} fieldKey={f} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm font-medium transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">Save Service Job</button>
      </div>
    </form>
  );
}

function ServiceTab() {
  const [jobs, setJobs] = useLocalStorage('spm_service', initialServiceJobs);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    if (!q) return true;
    return j.client.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.jobNumber.toLowerCase().includes(q);
  });

  function saveJob(data) {
    if (modalMode === 'add') {
      setJobs(p => [...p, { ...data, id: uid() }]);
    } else {
      setJobs(p => p.map(x => x.id === data.id ? data : x));
    }
    setModalMode(null);
    setEditTarget(null);
  }

  function updateChecklist(jobId, field, value) {
    setJobs(p => p.map(x => x.id === jobId
      ? { ...x, checklist: { ...x.checklist, [field]: value } }
      : x
    ));
  }

  function deleteJob(id) {
    setJobs(p => p.filter(x => x.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search client, location, job#…" />
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalMode('add'); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Service Job
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Job#</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Sold</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3 min-w-32">Progress</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">No service jobs found.</td></tr>
              )}
              {filtered.map(j => {
                const pct = progressOf(j.checklist, SERVICE_CHECKLIST_FIELDS);
                const isExpanded = expandedId === j.id;
                return (
                  <React.Fragment key={j.id}>
                    <tr
                      className="row-hover border-t border-slate-700 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : j.id)}
                    >
                      <td className="px-4 py-3 font-medium text-white">{j.client}</td>
                      <td className="px-4 py-3 text-slate-300">{j.jobNumber}</td>
                      <td className="px-4 py-3 text-right text-emerald-300">{fmtCurrency(j.value)}</td>
                      <td className="px-4 py-3 text-slate-300">{fmtDate(j.soldDate)}</td>
                      <td className="px-4 py-3 text-slate-300">{j.location}</td>
                      <td className="px-4 py-3">
                        {j.productOrdered
                          ? <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">Ordered</span>
                          : <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Pending</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar pct={pct} color={pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'} />
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-slate-700 bg-slate-900">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-white">{j.client}</p>
                                {j.workDescription && <p className="text-sm text-slate-400 mt-1">{j.workDescription}</p>}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { setEditTarget(j); setModalMode('edit'); }} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors">Edit</button>
                                <button onClick={() => setDeleteConfirm(j.id)} className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors">Delete</button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {SERVICE_CHECKLIST_FIELDS.map(f => (
                                <div key={f} className="flex flex-col items-center gap-1">
                                  <span className="text-xs text-slate-500">{SERVICE_CHECKLIST_LABELS[f]}</span>
                                  <ChecklistBadge value={j.checklist[f]} onChange={(v) => updateChecklist(j.id, f, v)} fieldKey={f} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <Modal
          title={modalMode === 'add' ? 'New Service Job' : `Edit: ${editTarget?.client}`}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
        >
          <ServiceForm initial={editTarget} onSave={saveJob} onCancel={() => { setModalMode(null); setEditTarget(null); }} />
        </Modal>
      )}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p className="text-slate-300 mb-6">Delete this service job?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm">Cancel</button>
            <button onClick={() => deleteJob(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Warranty Tab ────────────────────────────────────────────────────────────

function WarrantyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    crew: '', client: '', jobNumber: '', location: '', issue: '', scheduled: '',
  });
  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.client.trim()) return alert('Client name is required.');
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldInput label="Crew Member" value={form.crew} onChange={set('crew')} options={CREW_MEMBERS} required />
        <FieldInput label="Client Name" value={form.client} onChange={set('client')} required />
        <FieldInput label="Job Number" value={form.jobNumber} onChange={set('jobNumber')} />
        <FieldInput label="Location" value={form.location} onChange={set('location')} />
        <FieldInput label="Scheduled Date" value={form.scheduled} onChange={set('scheduled')} type="date" />
      </div>
      <FieldInput label="Issue Description" value={form.issue} onChange={set('issue')} textarea />
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm font-medium">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">Save Warranty</button>
      </div>
    </form>
  );
}

function WarrantyTab() {
  const [items, setItems] = useLocalStorage('spm_warranty', initialWarranty);
  const [search, setSearch] = useState('');
  const [filterCrew, setFilterCrew] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = items.filter(w => {
    if (filterCrew && w.crew !== filterCrew) return false;
    const q = search.toLowerCase();
    if (q && !w.client.toLowerCase().includes(q) && !w.location.toLowerCase().includes(q) && !w.issue.toLowerCase().includes(q)) return false;
    return true;
  });

  const grouped = CREW_MEMBERS.reduce((acc, crew) => {
    const rows = filtered.filter(w => w.crew === crew);
    if (rows.length) acc[crew] = rows;
    return acc;
  }, {});

  function saveItem(data) {
    if (modalMode === 'add') {
      setItems(p => [...p, { ...data, id: uid() }]);
    } else {
      setItems(p => p.map(x => x.id === data.id ? data : x));
    }
    setModalMode(null);
    setEditTarget(null);
  }

  function deleteItem(id) {
    setItems(p => p.filter(x => x.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search client, location, issue…" />
        </div>
        <select value={filterCrew} onChange={e => setFilterCrew(e.target.value)} className="text-sm py-2">
          <option value="">All Crew</option>
          {CREW_MEMBERS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => { setEditTarget(null); setModalMode('add'); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Warranty
        </button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-slate-500">No warranty items found.</div>
      )}

      {Object.entries(grouped).map(([crew, rows]) => (
        <div key={crew} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-blue-200 flex items-center justify-center text-sm font-bold">{crew[0]}</div>
            <h3 className="font-semibold text-white">{crew}</h3>
            <span className="text-xs text-slate-400 ml-1">({rows.length} item{rows.length !== 1 ? 's' : ''})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                  <th className="text-left px-4 py-2">Client</th>
                  <th className="text-left px-4 py-2">Job#</th>
                  <th className="text-left px-4 py-2">Location</th>
                  <th className="text-left px-4 py-2">Issue</th>
                  <th className="text-left px-4 py-2">Scheduled</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(w => (
                  <tr key={w.id} className="row-hover border-t border-slate-700">
                    <td className="px-4 py-3 font-medium text-white">{w.client}</td>
                    <td className="px-4 py-3 text-slate-300">{w.jobNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{w.location}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={w.issue}>{w.issue}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {w.scheduled
                        ? <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">{fmtDate(w.scheduled)}</span>
                        : <span className="text-xs text-slate-500">Unscheduled</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditTarget(w); setModalMode('edit'); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => setDeleteConfirm(w.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {modalMode && (
        <Modal
          title={modalMode === 'add' ? 'New Warranty Item' : `Edit: ${editTarget?.client}`}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
        >
          <WarrantyForm initial={editTarget} onSave={saveItem} onCancel={() => { setModalMode(null); setEditTarget(null); }} />
        </Modal>
      )}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p className="text-slate-300 mb-6">Delete this warranty item?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm">Cancel</button>
            <button onClick={() => deleteItem(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Pricing Tool Tab ────────────────────────────────────────────────────────

function PricingTab() {
  const [usRetail, setUsRetail] = useState('');
  const [exchangeRate, setExchangeRate] = useState('1.62');

  const us = parseFloat(usRetail) || 0;
  const fx = parseFloat(exchangeRate) || 1.62;

  // Apply discounts and surcharges in sequence
  const afterStandardDiscount = us * (1 - 0.45);           // 45% standard discount
  const afterExchangeDiscount = afterStandardDiscount * (1 - 0.125); // 12.5% exchange discount
  const afterSurcharge = afterExchangeDiscount * (1 + 0.15); // 15% surcharge
  const afterIncrease = afterSurcharge * (1 + 0.05);         // 5% increase (post May 2024)
  const caRetail = afterIncrease * fx;                        // convert to CAD

  const steps = [
    { label: 'US Retail Cost', value: us, note: 'Starting price (USD)' },
    { label: 'After 45% Standard Discount', value: afterStandardDiscount, note: '× 0.55' },
    { label: 'After 12.5% Exchange Discount', value: afterExchangeDiscount, note: '× 0.875' },
    { label: 'After 15% Surcharge', value: afterSurcharge, note: '× 1.15' },
    { label: 'After 5% Increase (post May 2024)', value: afterIncrease, note: '× 1.05' },
    { label: `Canadian Retail (@ ${fx} rate)`, value: caRetail, note: `× ${fx} CAD/USD`, highlight: true },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pricing Calculator</h2>
        <p className="text-sm text-slate-400 mb-6">Enter the US retail cost to calculate the Canadian retail price after all adjustments.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">US Retail Cost (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={usRetail}
                onChange={e => setUsRetail(e.target.value)}
                placeholder="0.00"
                className="text-sm pl-7 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Exchange Rate (CAD/USD)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={exchangeRate}
              onChange={e => setExchangeRate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 rounded-lg ${step.highlight ? 'bg-blue-900 border border-blue-600' : 'bg-slate-900'}`}
            >
              <div>
                <p className={`text-sm font-medium ${step.highlight ? 'text-blue-200' : 'text-slate-300'}`}>{step.label}</p>
                <p className="text-xs text-slate-500">{step.note}</p>
              </div>
              <p className={`text-sm font-bold tabular-nums ${step.highlight ? 'text-emerald-300 text-lg' : 'text-white'}`}>
                {step.highlight ? fmtCurrency(step.value) : `$${step.value.toFixed(2)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="font-semibold text-white mb-3">Formula Reference</h3>
        <div className="text-sm text-slate-400 space-y-1">
          <p>1. Apply 45% standard discount → multiply by <span className="text-slate-200 font-mono">0.55</span></p>
          <p>2. Apply 12.5% exchange rate discount → multiply by <span className="text-slate-200 font-mono">0.875</span></p>
          <p>3. Add 15% surcharge → multiply by <span className="text-slate-200 font-mono">1.15</span></p>
          <p>4. Add 5% increase (post May 2024) → multiply by <span className="text-slate-200 font-mono">1.05</span></p>
          <p>5. Convert to CAD → multiply by exchange rate (default <span className="text-slate-200 font-mono">1.62</span>)</p>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'projects', label: 'Sunroom Projects' },
  { id: 'service', label: 'Service Jobs' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'pricing', label: 'Pricing Tool' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">Sunroom PM</h1>
                <p className="text-xs text-slate-400 leading-tight">Project Management</p>
              </div>
            </div>
            <nav className="flex gap-1 ml-4 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'warranty' && <WarrantyTab />}
        {activeTab === 'pricing' && <PricingTab />}
      </main>
    </div>
  );
}
