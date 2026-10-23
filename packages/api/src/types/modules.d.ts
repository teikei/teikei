// Packages without type declarations. Each covers only what src uses.
// @types/email-templates describes v10, so email-templates is declared here.

declare module 'email-templates' {
  export default class Email {
    constructor(options: object)
    templateExists(view: string): Promise<boolean>
    render(view: string, locals?: object): Promise<string>
    send(options: object): Promise<unknown>
  }
}

declare module 'feathers-envhelpers' {
  import type { Application } from '@feathersjs/feathers'

  const envHelpers: () => (app: Application) => void
  export default envHelpers
}

declare module 'geojson' {
  // Properties are the parsed record's own fields.
  export type Feature<P = Record<string, unknown>> = {
    type: 'Feature'
    geometry: object
    properties: P
  }
  export type FeatureCollection = {
    type: 'FeatureCollection'
    features: Feature[]
  }

  const GeoJSON: {
    parse(
      data: object,
      params: { Point: [string, string] }
    ): Feature | FeatureCollection
  }
  export default GeoJSON
}

declare module 'inky' {
  const inky: (options: { src: string; dest: string }) => unknown
  export default inky
}

declare module 'pg-escape' {
  const pgEscape: { literal(value: string): string }
  export default pgEscape
}
