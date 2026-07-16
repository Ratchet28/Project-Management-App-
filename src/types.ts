export type TaskStatus = 'To Do' | 'In Progress' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  due: string
  description: string
}

export interface Phase {
  id: string
  name: string
  tasks: Task[]
}

export interface Project {
  id: string
  name: string
  location: string
  dateRange: string
  phases: Phase[]
}

export type StatusFilter = 'All' | TaskStatus | 'Overdue'
