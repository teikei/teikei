import Queue from 'bull'

export const REFRESH_SEARCH_INDEX_QUEUE = {
  queueName: 'refresh_search_index',
  jobName: 'Refresh Search Index',
}

export default (app) => {
  const queue = new Queue(REFRESH_SEARCH_INDEX_QUEUE.queueName, {
    redis: app.get('redis').url,
  })

  queue.process(async (job) => {
    app.info('refreshing search index')
    await app.service('searchindex').create({})
    job.progress(100)
  })

  queue.add({ name: REFRESH_SEARCH_INDEX_QUEUE.jobName })
  // TODO refreshing every 5 minutes. maybe refresh immediately on change?
  queue.add(
    { name: REFRESH_SEARCH_INDEX_QUEUE.jobName },
    { repeat: { cron: '0/5 * * * *' } }
  )
}
