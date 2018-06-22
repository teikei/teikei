const includeHeaders = () => (req, res, next) => {
  req.feathers.headers = req.headers
  next()
}

export default app => {
  app.use(includeHeaders())
}
