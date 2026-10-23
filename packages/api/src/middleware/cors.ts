export const parseCorsOrigins = (origins: string) =>
  origins
    .split(',')
    .map((s) => s.trim())
    .map((o) => (/\/.*\//.test(o) ? new RegExp(o.slice(1, o.length - 1)) : o))
