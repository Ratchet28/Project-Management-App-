import type { Phase, Project, Task, TaskPriority, TaskStatus } from './types'

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function makeTask(
  title: string,
  opts: Partial<Pick<Task, 'status' | 'priority' | 'assignee' | 'due' | 'description'>> = {},
): Task {
  return {
    id: uid(),
    title,
    status: opts.status ?? 'To Do',
    priority: opts.priority ?? 'Medium',
    assignee: opts.assignee ?? 'Unassigned',
    due: opts.due ?? '',
    description: opts.description ?? '',
  }
}

function task(
  title: string,
  status: TaskStatus,
  priority: TaskPriority,
  assignee: string,
  due: string,
): Task {
  return makeTask(title, { status, priority, assignee, due })
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Riverside Apartments',
    location: '410 Riverside Dr',
    dateRange: 'Mar – Nov 2026',
    phases: [
      {
        id: 'ph1',
        name: 'Site Prep & Foundation',
        tasks: [
          task('Excavate footings', 'Done', 'High', 'D. Ruiz', '2026-04-02'),
          task('Pour foundation walls', 'Done', 'High', 'D. Ruiz', '2026-04-10'),
          task('Waterproof foundation', 'In Progress', 'Medium', 'S. Cole', '2026-07-20'),
          task('Backfill and grade site', 'To Do', 'Medium', 'S. Cole', '2026-07-28'),
        ],
      },
      {
        id: 'ph2',
        name: 'Framing',
        tasks: [
          task('Frame first floor walls', 'In Progress', 'High', 'T. Nguyen', '2026-07-18'),
          task('Install floor joists, level 2', 'To Do', 'High', 'T. Nguyen', '2026-07-25'),
          task('Sheath exterior walls', 'To Do', 'Medium', 'R. Patel', '2026-08-05'),
        ],
      },
      {
        id: 'ph3',
        name: 'MEP Rough-In',
        tasks: [
          task('Rough-in electrical panels', 'To Do', 'Medium', 'K. Wallace', '2026-08-15'),
          task('Rough-in plumbing stacks', 'To Do', 'Medium', 'A. Brooks', '2026-08-18'),
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Maple Street Office Retrofit',
    location: '92 Maple St',
    dateRange: 'Jan – Sep 2026',
    phases: [
      {
        id: 'ph4',
        name: 'Demolition',
        tasks: [
          task('Remove interior partitions', 'Done', 'Medium', 'M. Ortiz', '2026-02-14'),
          task('Strip ceiling tiles & grid', 'Done', 'Low', 'M. Ortiz', '2026-02-20'),
        ],
      },
      {
        id: 'ph5',
        name: 'Interior Buildout',
        tasks: [
          task('Frame new office partitions', 'In Progress', 'High', 'C. Diaz', '2026-07-12'),
          task('Install drop ceiling grid', 'To Do', 'Medium', 'C. Diaz', '2026-07-30'),
          task('Install glass partition walls', 'To Do', 'Medium', 'L. Fischer', '2026-08-08'),
          task('Paint common areas', 'To Do', 'Low', 'L. Fischer', '2026-08-20'),
        ],
      },
      {
        id: 'ph6',
        name: 'Final Inspection',
        tasks: [
          task('Fire marshal walkthrough', 'To Do', 'High', 'J. Marsh', '2026-09-02'),
          task('Punch list closeout', 'To Do', 'High', 'J. Marsh', '2026-09-10'),
        ],
      },
    ],
  },
  {
    id: 'p3',
    name: 'Harbor View Bridge Repair',
    location: 'Harbor Rd Overpass',
    dateRange: 'May – Dec 2026',
    phases: [
      {
        id: 'ph7',
        name: 'Structural Assessment',
        tasks: [
          task('Inspect deck girders', 'Done', 'High', 'P. Alvarez', '2026-05-20'),
          task('Load rating analysis', 'Done', 'High', 'P. Alvarez', '2026-06-05'),
        ],
      },
      {
        id: 'ph8',
        name: 'Repair Work',
        tasks: [
          task('Repair spalled concrete piers', 'In Progress', 'High', 'G. Huang', '2026-07-15'),
          task('Replace expansion joints', 'In Progress', 'High', 'G. Huang', '2026-07-22'),
          task('Apply protective coating', 'To Do', 'Medium', 'N. Okafor', '2026-08-01'),
        ],
      },
      {
        id: 'ph9',
        name: 'Traffic & Closeout',
        tasks: [
          task('Repaint lane markings', 'To Do', 'Low', 'N. Okafor', '2026-08-10'),
          task('Reopen lanes to traffic', 'To Do', 'High', 'J. Marsh', '2026-08-15'),
        ],
      },
    ],
  },
]

export interface ProjectTemplate {
  id: string
  name: string
  summary: string
  phases: () => Phase[]
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    summary: 'Start with a single Planning phase.',
    phases: () => [{ id: uid(), name: 'Planning', tasks: [] }],
  },
  {
    id: 'residential',
    name: 'Residential Build',
    summary: 'Site prep, framing, MEP, finishes, inspection.',
    phases: () => [
      { id: uid(), name: 'Site Prep & Foundation', tasks: [makeTask('Excavate footings'), makeTask('Pour foundation walls'), makeTask('Waterproof foundation')] },
      { id: uid(), name: 'Framing', tasks: [makeTask('Frame exterior walls'), makeTask('Install roof trusses')] },
      { id: uid(), name: 'MEP Rough-In', tasks: [makeTask('Rough-in electrical'), makeTask('Rough-in plumbing'), makeTask('Rough-in HVAC')] },
      { id: uid(), name: 'Finishes', tasks: [makeTask('Drywall & paint'), makeTask('Install flooring'), makeTask('Install fixtures')] },
      { id: uid(), name: 'Final Inspection', tasks: [makeTask('Building inspection'), makeTask('Punch list closeout')] },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial Retrofit',
    summary: 'Demo, buildout, MEP, closeout.',
    phases: () => [
      { id: uid(), name: 'Demolition', tasks: [makeTask('Remove interior partitions'), makeTask('Strip ceiling grid')] },
      { id: uid(), name: 'Interior Buildout', tasks: [makeTask('Frame new partitions'), makeTask('Install ceiling grid'), makeTask('Paint & finishes')] },
      { id: uid(), name: 'MEP & Life Safety', tasks: [makeTask('Update electrical panels'), makeTask('Install fire suppression')] },
      { id: uid(), name: 'Final Inspection', tasks: [makeTask('Fire marshal walkthrough'), makeTask('Punch list closeout')] },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Repair',
    summary: 'Assessment, repair, traffic & closeout.',
    phases: () => [
      { id: uid(), name: 'Structural Assessment', tasks: [makeTask('Inspect structure'), makeTask('Load rating analysis')] },
      { id: uid(), name: 'Repair Work', tasks: [makeTask('Repair damaged sections'), makeTask('Replace joints/hardware'), makeTask('Apply protective coating')] },
      { id: uid(), name: 'Traffic & Closeout', tasks: [makeTask('Restore markings/signage'), makeTask('Reopen to public')] },
    ],
  },
]

export const STATUS_TAG_CLASS: Record<TaskStatus, string> = {
  'To Do': 'tag-neutral',
  'In Progress': 'tag-accent-2',
  Done: 'tag-accent',
}

export const PRIORITY_TAG_CLASS: Record<TaskPriority, string> = {
  Low: 'tag-neutral',
  Medium: 'tag-accent-2',
  High: 'tag-outline',
}
