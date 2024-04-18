import GeoJSON from 'geojson'
import _ from 'lodash'

export const parseGeoJSON = (obj) =>
  GeoJSON.parse(obj, {
    Point: ['latitude', 'longitude']
  })

const parseRelations = (obj, relations) => {
  const rel = _.isArray(relations) ? relations : [relations]
  const result = obj
  rel.forEach((r) => {
    if (obj[r]) {
      result[r] = parseGeoJSON(obj[r])
    }
  })
  return result
}

const toJSON = (o) => o.toJSON()

const apply =
  (func, ...args) =>
  (obj) =>
    _.isArray(obj) ? obj.map((o) => func(o, ...args)) : func(obj, ...args)

const toGeoJSON = (relations) => (ctx) => {
  ctx.result = parseGeoJSON(
    _.flow(apply(toJSON), apply(parseRelations, relations))(ctx.result)
  )
  return ctx
}

export default toGeoJSON
