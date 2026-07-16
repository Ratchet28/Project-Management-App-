import type { Task, TaskPriority, TaskStatus } from '../types'
import { CloseIcon } from './Icons'

interface Props {
  task: Task | null
  phaseName: string
  onClose: () => void
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onStatusChange: (v: TaskStatus) => void
  onPriorityChange: (v: TaskPriority) => void
  onAssigneeChange: (v: string) => void
  onDueChange: (v: string) => void
  onToggleDone: () => void
}

export default function TaskDrawer({
  task,
  phaseName,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDueChange,
  onToggleDone,
}: Props) {
  if (!task) return null

  const completeLabel = task.status === 'Done' ? 'Mark as To Do' : 'Mark as Complete'
  const completeBtnClass = task.status === 'Done' ? 'btn-secondary' : 'btn-primary'

  return (
    <div onClick={onClose} className="dialog-backdrop" style={{ justifyContent: 'flex-end', alignItems: 'stretch', padding: 0, animation: 'fadeIn 0.15s ease', zIndex: 20 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="dialog"
        style={{ width: 420, height: '100%', borderRadius: 0, animation: 'slideIn 0.18s ease', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-kicker">{phaseName}</div>
          <div onClick={onClose} className="btn btn-icon btn-ghost">
            <CloseIcon />
          </div>
        </div>

        <input
          value={task.title}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            fontSize: 20,
            fontWeight: 600,
            fontFamily: 'var(--font-heading)',
            border: 'none',
            outline: 'none',
            padding: 0,
            background: 'transparent',
            color: 'var(--color-text)',
          }}
        />

        <div className="field">
          <label>Description</label>
          <textarea className="input" value={task.description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Add a description..." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Status</label>
            <select className="input" value={task.status} onChange={(e) => onStatusChange(e.target.value as TaskStatus)} style={{ width: 150 }}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Priority</label>
            <select className="input" value={task.priority} onChange={(e) => onPriorityChange(e.target.value as TaskPriority)} style={{ width: 150 }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Assignee</label>
            <input className="input" value={task.assignee} onChange={(e) => onAssigneeChange(e.target.value)} style={{ width: 150 }} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Due date</label>
            <input className="input" type="date" value={task.due} onChange={(e) => onDueChange(e.target.value)} style={{ width: 150 }} />
          </div>
        </div>

        <div onClick={onToggleDone} className={`btn ${completeBtnClass} btn-block`}>
          {completeLabel}
        </div>
      </div>
    </div>
  )
}
