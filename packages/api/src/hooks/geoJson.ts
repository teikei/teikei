import type { HookContext } from '@feathersjs/feathers'
import GeoJSON from 'geojson'

type Entry = Record<string, unknown>

export const parseGeoJSON = (obj: object) =>
  GeoJSON.parse(obj, {
    Point: ['latitude', 'longitude']
  })

const parseRelations = (obj: Entry, relations: string | string[]) => {
  const rel = Array.isArray(relations) ? relations : [relations]
  const result = { ...obj }
  rel.forEach((r) => {
    if (obj[r]) {
      result[r] = parseGeoJSON(obj[r])
    }
  })
  return result
}

const apply =
  <A extends unknown[]>(func: (obj: Entry, ...args: A) => Entry, ...args: A) =>
  (obj: Entry | Entry[]) =>
    Array.isArray(obj) ? obj.map((o) => func(o, ...args)) : func(obj, ...args)

const toGeoJSON =
  (relations: string | string[] = []) =>
  (ctx: HookContext) => {
    ctx.result = parseGeoJSON(apply(parseRelations, relations)(ctx.result))
    return ctx
  }

export default toGeoJSON
