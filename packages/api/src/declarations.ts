import type { Job } from 'node-schedule'

export type JobEntry = {
  id: number
  cron: string
  job: Job
  run: () => Promise<void>
}

export type Jobs = JobEntry[] & {
  schedule: (
    id: number,
    name: string,
    cron: string,
    callback: () => Promise<void>
  ) => void
}

// What this app adds to Feathers: the job registry from jobs/index.ts, the
// environment checks from feathers-envhelpers, the fields the authorize hook
// allows, which filterAllowedFields reads, and the emails service's render flag.
declare module '@feathersjs/feathers' {
  // Merged declarations must repeat Feathers' type parameters.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Application<Services, Settings> {
    jobs: Jobs
    isDevelopment(): boolean
    isProduction(): boolean
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HookContext<A, S> {
    allowedFields?: string[]
  }

  interface Params {
    // Asks the emails service to render a template instead of sending it.
    render?: boolean
  }
}
