import { PROJECT_TEMPLATES } from '../data'

interface Props {
  open: boolean
  name: string
  location: string
  dateRange: string
  templateId: string
  onNameChange: (v: string) => void
  onLocationChange: (v: string) => void
  onDateRangeChange: (v: string) => void
  onTemplateChange: (id: string) => void
  onCancel: () => void
  onCreate: () => void
}

export default function NewProjectDialog({
  open,
  name,
  location,
  dateRange,
  templateId,
  onNameChange,
  onLocationChange,
  onDateRangeChange,
  onTemplateChange,
  onCancel,
  onCreate,
}: Props) {
  if (!open) return null

  return (
    <div onClick={onCancel} className="dialog-backdrop" style={{ animation: 'fadeIn 0.15s ease', zIndex: 30 }}>
      <div onClick={(e) => e.stopPropagation()} className="dialog" style={{ width: 420 }}>
        <div className="dialog-title">New Project</div>
        <div className="field">
          <label>Project name</label>
          <input className="input" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Cedar Point Warehouse" />
        </div>
        <div className="field">
          <label>Location</label>
          <input className="input" value={location} onChange={(e) => onLocationChange(e.target.value)} placeholder="e.g. 118 Cedar Ave" />
        </div>
        <div className="field">
          <label>Timeline</label>
          <input className="input" value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)} placeholder="e.g. Jan – Jun 2027" />
        </div>
        <div className="field">
          <label>Starter template</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {PROJECT_TEMPLATES.map((tmpl) => {
              const checked = templateId === tmpl.id
              return (
                <label
                  key={tmpl.id}
                  className="radio"
                  style={checked ? { borderColor: 'var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 6%, transparent)' } : undefined}
                >
                  <input type="radio" name="projectTemplate" checked={checked} onChange={() => onTemplateChange(tmpl.id)} />
                  <div className="dot" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tmpl.name}</div>
                    <div style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{tmpl.summary}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
        <div className="dialog-actions">
          <div onClick={onCancel} className="btn btn-secondary">Cancel</div>
          <div onClick={onCreate} className="btn btn-primary">Create Project</div>
        </div>
      </div>
    </div>
  )
}
