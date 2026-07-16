import type { Phase, Task } from '../types'
import { PRIORITY_TAG_CLASS, STATUS_TAG_CLASS } from '../data'
import { CheckIcon, ChevronIcon, PlusIcon } from './Icons'

interface Props {
  phase: Phase
  tasks: Task[]
  expanded: boolean
  onToggle: () => void
  draftValue: string
  onDraftChange: (v: string) => void
  onDraftSubmit: () => void
  onOpenTask: (taskId: string) => void
  onToggleTaskDone: (taskId: string) => void
  isOverdue: (task: Task) => boolean
}

export default function PhaseGroup({
  phase,
  tasks,
  expanded,
  onToggle,
  draftValue,
  onDraftChange,
  onDraftSubmit,
  onOpenTask,
  onToggleTaskDone,
  isOverdue,
}: Props) {
  const done = phase.tasks.filter((t) => t.status === 'Done').length
  const pct = phase.tasks.length ? Math.round((done / phase.tasks.length) * 100) : 0

  return (
    <div style={{ marginTop: 'var(--space-5)' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 'var(--space-2) 0' }}>
        <ChevronIcon
          style={{
            width: 15,
            height: 15,
            color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            transform: `rotate(${expanded ? '90deg' : '0deg'})`,
            transition: 'transform 0.15s',
          }}
        />
        <h5 style={{ margin: 0 }}>{phase.name}</h5>
        <div style={{ fontSize: 12.5, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          {done}/{phase.tasks.length}
        </div>
        <div style={{ flex: 1, height: 3, background: 'var(--color-neutral-200)', maxWidth: 160 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent-400)' }} />
        </div>
      </div>

      {expanded && (
        <>
          <div className="table">
            {tasks.map((t) => {
              const overdue = isOverdue(t)
              const isDone = t.status === 'Done'
              const initials = t.assignee
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              const dueLabel = t.due ? (overdue ? `Overdue · ${t.due.slice(5)}` : t.due.slice(5)) : '—'

              return (
                <div
                  key={t.id}
                  onClick={() => onOpenTask(t.id)}
                  className="task-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleTaskDone(t.id)
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      border: `1.5px solid ${isDone ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
                      background: isDone ? 'var(--color-accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flex: '0 0 auto',
                    }}
                  >
                    {isDone && <CheckIcon style={{ width: 12, height: 12 }} />}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                      fontWeight: 500,
                      ...(isDone
                        ? { color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', textDecoration: 'line-through' }
                        : {}),
                    }}
                  >
                    {t.title}
                  </div>
                  <div className={`tag ${PRIORITY_TAG_CLASS[t.priority]}`} style={{ width: 64, flex: '0 0 auto', justifyContent: 'center' }}>
                    {t.priority}
                  </div>
                  <div
                    style={{
                      width: 110,
                      flex: '0 0 auto',
                      fontSize: 12.5,
                      color: overdue ? 'var(--color-accent-800)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)',
                      fontWeight: overdue ? 600 : 400,
                    }}
                  >
                    {dueLabel}
                  </div>
                  <div className={`tag ${STATUS_TAG_CLASS[t.status]}`} style={{ width: 90, flex: '0 0 auto', justifyContent: 'center' }}>
                    {t.status}
                  </div>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      background: 'var(--color-accent-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'var(--color-accent-800)',
                      fontFamily: 'var(--font-heading)',
                      flex: '0 0 auto',
                    }}
                  >
                    {initials}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-2) var(--space-2)' }}>
            <PlusIcon style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }} />
            <input
              placeholder={`Add task to ${phase.name}...`}
              value={draftValue}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onDraftSubmit()
              }}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 13.5,
                outline: 'none',
                padding: '4px 0',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
