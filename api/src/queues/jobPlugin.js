

const jobPlugin = app => {
  app.jobs = {}
  app.jobs.register = job => {
    app.jobs.registeredJobs.push(job)
  }
}

export default jobPlugin
