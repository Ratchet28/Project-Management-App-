import { useState } from 'react'
import './App.css'
import { INITIAL_PROJECTS, PROJECT_TEMPLATES, makeTask, uid } from './data'
import type { Project, StatusFilter, Task, TaskPriority, TaskStatus } from './types'
import Sidebar from './components/Sidebar'
import MainPanel from './components/MainPanel'
import NewProjectDialog from './components/NewProjectDialog'
import TaskDrawer from './components/TaskDrawer'

function isOverdue(task: Task): boolean {
  if (task.status === 'Done' || !task.due) return false
  return new Date(task.due) < new Date()
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [selectedProjectId, setSelectedProjectId] = useState('p1')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({})
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectLocation, setNewProjectLocation] = useState('')
  const [newProjectDateRange, setNewProjectDateRange] = useState('')
  const [newProjectTemplateId, setNewProjectTemplateId] = useState('blank')

  const currentProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0]

  function selectProject(id: string) {
    setSelectedProjectId(id)
    setActiveTaskId(null)
    setSearch('')
    setStatusFilter('All')
  }

  function togglePhase(id: string) {
    setExpandedPhases((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }))
  }

  function toggleTaskDone(phaseId: string, taskId: string) {
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        phases: p.phases.map((ph) =>
          ph.id !== phaseId
            ? ph
            : { ...ph, tasks: ph.tasks.map((t) => (t.id !== taskId ? t : { ...t, status: t.status === 'Done' ? 'To Do' : 'Done' })) },
        ),
      })),
    )
  }

  function updateTask(phaseId: string, taskId: string, patch: Partial<Task>) {
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        phases: p.phases.map((ph) => (ph.id !== phaseId ? ph : { ...ph, tasks: ph.tasks.map((t) => (t.id !== taskId ? t : { ...t, ...patch })) })),
      })),
    )
  }

  function addTask(phaseId: string, title: string) {
    if (!title.trim()) return
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        phases: p.phases.map((ph) => (ph.id !== phaseId ? ph : { ...ph, tasks: [...ph.tasks, makeTask(title.trim())] })),
      })),
    )
    setDrafts((prev) => ({ ...prev, [phaseId]: '' }))
  }

  function createProject() {
    const name = newProjectName.trim()
    if (!name) return
    const id = uid()
    const template = PROJECT_TEMPLATES.find((t) => t.id === newProjectTemplateId) ?? PROJECT_TEMPLATES[0]
    const project: Project = {
      id,
      name,
      location: newProjectLocation.trim() || 'Location TBD',
      dateRange: newProjectDateRange.trim() || 'Dates TBD',
      phases: template.phases(),
    }
    setProjects((prev) => [...prev, project])
    setSelectedProjectId(id)
    setNewProjectOpen(false)
    setNewProjectName('')
    setNewProjectLocation('')
    setNewProjectDateRange('')
    setNewProjectTemplateId('blank')
  }

  function openNewTask() {
    const firstPhase = currentProject.phases[0]
    if (!firstPhase) return
    setDrafts((prev) => ({ ...prev, [firstPhase.id]: prev[firstPhase.id] ?? '' }))
    setExpandedPhases((prev) => ({ ...prev, [firstPhase.id]: true }))
  }

  const activePhase = activePhaseId ? currentProject.phases.find((ph) => ph.id === activePhaseId) : undefined
  const activeTask = activePhase?.tasks.find((t) => t.id === activeTaskId) ?? null

  return (
    <div className="app-root">
      <Sidebar projects={projects} selectedProjectId={currentProject.id} onSelect={selectProject} onNewProject={() => setNewProjectOpen(true)} />

      <MainPanel
        project={currentProject}
        search={search}
        onSearchChange={setSearch}
        onNewTask={openNewTask}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        expandedPhases={expandedPhases}
        onTogglePhase={togglePhase}
        drafts={drafts}
        onDraftChange={(phaseId, v) => setDrafts((prev) => ({ ...prev, [phaseId]: v }))}
        onAddTask={(phaseId) => addTask(phaseId, drafts[phaseId] || '')}
        onOpenTask={(phaseId, taskId) => {
          setActivePhaseId(phaseId)
          setActiveTaskId(taskId)
        }}
        onToggleTaskDone={toggleTaskDone}
        isOverdue={isOverdue}
      />

      <NewProjectDialog
        open={newProjectOpen}
        name={newProjectName}
        location={newProjectLocation}
        dateRange={newProjectDateRange}
        templateId={newProjectTemplateId}
        onNameChange={setNewProjectName}
        onLocationChange={setNewProjectLocation}
        onDateRangeChange={setNewProjectDateRange}
        onTemplateChange={setNewProjectTemplateId}
        onCancel={() => setNewProjectOpen(false)}
        onCreate={createProject}
      />

      <TaskDrawer
        task={activeTask}
        phaseName={activePhase?.name ?? ''}
        onClose={() => setActiveTaskId(null)}
        onTitleChange={(v) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { title: v })}
        onDescriptionChange={(v) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { description: v })}
        onStatusChange={(v: TaskStatus) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { status: v })}
        onPriorityChange={(v: TaskPriority) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { priority: v })}
        onAssigneeChange={(v) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { assignee: v })}
        onDueChange={(v) => activePhase && activeTask && updateTask(activePhase.id, activeTask.id, { due: v })}
        onToggleDone={() => activePhase && activeTask && toggleTaskDone(activePhase.id, activeTask.id)}
      />
    </div>
  )
}
