import GeoJSON from 'geojson'
import _ from 'lodash'

const parse = obj =>
  GeoJSON.parse(obj, {
    Point: ['latitude', 'longitude']
  })

const parseRelations = (obj, relations) => {
  const rel = _.isArray(relations) ? relations : [relations]
  const result = obj
  rel.forEach(r => {
    if (obj[r]) {
      result[r] = parse(obj[r])
    }
  })
  return result
}

const toJSON = o => o.toJSON()

const transform = (func, ...args) => obj =>
  _.isArray(obj) ? obj.map(o => func(o, ...args)) : func(obj, ...args)

const toGeoJSON = relations => ctx => {
  ctx.result = parse(
    _.flow(
      transform(toJSON),
      transform(parseRelations, relations)
    )(ctx.result)
  )
  return ctx
}

export default toGeoJSON
