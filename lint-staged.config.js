import path from 'node:path'

const quote = (file) => JSON.stringify(file)

const hasExtension = (file, extensions) =>
  extensions.some((extension) => file.endsWith(extension))

const repoRoot = process.cwd()
const mapNextPath = `${path.join(repoRoot, 'packages/map-next')}${path.sep}`
const toAbsolute = (file) => path.resolve(repoRoot, file)
const isMapNextFile = (file) => toAbsolute(file).startsWith(mapNextPath)

export default (files) => {
  const commands = []
  const absoluteFiles = files.map(toAbsolute)
  const mapNextFiles = absoluteFiles.filter(isMapNextFile)
  const otherFiles = absoluteFiles.filter((file) => !isMapNextFile(file))

  const rootLintFiles = otherFiles.filter((file) =>
    hasExtension(file, ['.js', '.jsx', '.ts', '.tsx'])
  )
  const mapNextLintFiles = mapNextFiles.filter((file) =>
    hasExtension(file, ['.js', '.ts', '.svelte'])
  )

  if (rootLintFiles.length > 0) {
    commands.push(`eslint --cache --fix ${rootLintFiles.map(quote).join(' ')}`)
  }

  if (mapNextLintFiles.length > 0) {
    commands.push(
      `cd packages/map-next && eslint --cache --fix ${mapNextLintFiles.map(quote).join(' ')}`
    )
  }

  commands.push(
    `prettier --write --ignore-unknown ${absoluteFiles.map(quote).join(' ')}`
  )

  return commands
}
