import cors from 'cors'

export const parseCorsOrigins = origins =>
  origins
    .split(',')
    .map(s => s.trim())
    .map(o => (/\/.*\//.test(o) ? new RegExp(o.slice(1, o.length - 1)) : o))

export default app => {
  const corsOptions = {
    origin: parseCorsOrigins(app.get('corsOrigins')),
    optionsSuccessStatus: 200
  }
  app.use(cors(corsOptions))
}
