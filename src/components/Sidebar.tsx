import type { Project } from '../types'
import BlueprintCorners from './BlueprintCorners'
import { LogoIcon, PlusIcon } from './Icons'

interface Props {
  projects: Project[]
  selectedProjectId: string
  onSelect: (id: string) => void
  onNewProject: () => void
}

function isOverdue(due: string, status: string): boolean {
  if (status === 'Done' || !due) return false
  return new Date(due) < new Date()
}

export default function Sidebar({ projects, selectedProjectId, onSelect, onNewProject }: Props) {
  return (
    <div className="sidebar">
      <div className="nav" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <LogoIcon />
        <div className="nav-brand">BuildTrack</div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-4) var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Projects
        </div>
        <div onClick={onNewProject} className="btn btn-icon btn-ghost" style={{ width: 24, height: 24 }}>
          <PlusIcon />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-3) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {projects.map((p) => {
          const allTasks = p.phases.flatMap((ph) => ph.tasks)
          const done = allTasks.filter((t) => t.status === 'Done').length
          const pct = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0
          const overdue = allTasks.filter((t) => isOverdue(t.due, t.status)).length
          const active = p.id === selectedProjectId
          const atRisk = overdue > 0

          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="card blueprint project-card"
              style={active ? { cursor: 'pointer', background: 'var(--color-accent-100)', borderColor: 'var(--color-accent)' } : { cursor: 'pointer' }}
            >
              <BlueprintCorners />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div className="card-title" style={{ fontSize: 16 }}>{p.name}</div>
                <div className={`tag ${atRisk ? 'tag-outline' : 'tag-accent'}`}>{atRisk ? 'At Risk' : 'On Track'}</div>
              </div>
              <div className="card-meta">{p.location}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--color-neutral-200)' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent)' }} />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{pct}%</div>
              </div>
            </div>
          )
        })}

        <div
          onClick={onNewProject}
          className="card blueprint new-project-card"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}
        >
          <BlueprintCorners />
          <PlusIcon />
          <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>New Project</div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            background: 'var(--color-accent-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-accent-800)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          JM
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Jordan Marsh</div>
          <div style={{ fontSize: 11.5, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>Project Manager</div>
        </div>
      </div>
    </div>
  )
}
