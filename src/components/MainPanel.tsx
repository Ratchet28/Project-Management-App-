import type { Project, StatusFilter, Task } from '../types'
import BlueprintCorners from './BlueprintCorners'
import PhaseGroup from './PhaseGroup'
import { PlusIcon, SearchIcon } from './Icons'

interface Props {
  project: Project
  search: string
  onSearchChange: (v: string) => void
  onNewTask: () => void
  statusFilter: StatusFilter
  onStatusFilterChange: (f: StatusFilter) => void
  expandedPhases: Record<string, boolean>
  onTogglePhase: (phaseId: string) => void
  drafts: Record<string, string>
  onDraftChange: (phaseId: string, v: string) => void
  onAddTask: (phaseId: string) => void
  onOpenTask: (phaseId: string, taskId: string) => void
  onToggleTaskDone: (phaseId: string, taskId: string) => void
  isOverdue: (task: Task) => boolean
  newPhaseDraft: string
  onNewPhaseDraftChange: (v: string) => void
  onAddPhase: () => void
}

const FILTERS: StatusFilter[] = ['All', 'To Do', 'In Progress', 'Done', 'Overdue']

export default function MainPanel({
  project,
  search,
  onSearchChange,
  onNewTask,
  statusFilter,
  onStatusFilterChange,
  expandedPhases,
  onTogglePhase,
  drafts,
  onDraftChange,
  onAddTask,
  onOpenTask,
  onToggleTaskDone,
  isOverdue,
  newPhaseDraft,
  onNewPhaseDraftChange,
  onAddPhase,
}: Props) {
  const allTasks = project.phases.flatMap((ph) => ph.tasks)
  const statPills = [
    { label: 'Total Tasks', value: allTasks.length, color: 'var(--color-text)' },
    { label: 'In Progress', value: allTasks.filter((t) => t.status === 'In Progress').length, color: 'var(--color-accent-700)' },
    { label: 'Completed', value: allTasks.filter((t) => t.status === 'Done').length, color: 'var(--color-accent)' },
    { label: 'Overdue', value: allTasks.filter((t) => isOverdue(t)).length, color: 'var(--color-accent-900)' },
  ]

  const searchLower = search.toLowerCase()

  return (
    <div className="main">
      <div className="nav" style={{ borderBottom: '1px solid var(--color-divider)', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>{project.name}</h3>
          <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginTop: 2 }}>
            {project.location} · {project.dateRange}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative' }}>
            <SearchIcon
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
              }}
            />
            <input
              className="input"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              style={{ width: 220, paddingLeft: 32 }}
            />
          </div>
          <div onClick={onNewTask} className="btn btn-primary blueprint" style={{ position: 'relative' }}>
            <BlueprintCorners />
            <PlusIcon />
            New Task
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-4) 0' }}>
        {statPills.map((s) => (
          <div key={s.label} className="card blueprint">
            <BlueprintCorners />
            <div className="card-kicker">{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', padding: 'var(--space-4) var(--space-4) var(--space-2)' }}>
        <div className="seg">
          {FILTERS.map((f) => (
            <label key={f} className="seg-opt">
              <input type="radio" name="statusFilter" checked={statusFilter === f} onChange={() => onStatusFilterChange(f)} />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2) var(--space-4) var(--space-6)' }}>
        {project.phases.map((phase) => {
          const filteredTasks = phase.tasks.filter((t) => {
            if (searchLower && !t.title.toLowerCase().includes(searchLower)) return false
            if (statusFilter === 'Overdue') return isOverdue(t)
            if (statusFilter !== 'All' && t.status !== statusFilter) return false
            return true
          })
          const expanded = expandedPhases[phase.id] !== false

          return (
            <PhaseGroup
              key={phase.id}
              phase={phase}
              tasks={filteredTasks}
              expanded={expanded}
              onToggle={() => onTogglePhase(phase.id)}
              draftValue={drafts[phase.id] || ''}
              onDraftChange={(v) => onDraftChange(phase.id, v)}
              onDraftSubmit={() => onAddTask(phase.id)}
              onOpenTask={(taskId) => onOpenTask(phase.id, taskId)}
              onToggleTaskDone={(taskId) => onToggleTaskDone(phase.id, taskId)}
              isOverdue={isOverdue}
            />
          )
        })}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 'var(--space-5)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          <PlusIcon style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }} />
          <input
            placeholder="Add task category..."
            value={newPhaseDraft}
            onChange={(e) => onNewPhaseDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddPhase()
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              outline: 'none',
              padding: '4px 0',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
