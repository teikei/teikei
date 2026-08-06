import path from 'node:path'

const quote = (file) => JSON.stringify(file)

const hasExtension = (file, extensions) =>
  extensions.some((extension) => file.endsWith(extension))

const repoRoot = process.cwd()
const embedPath = `${path.join(repoRoot, 'packages/embed')}${path.sep}`
const toAbsolute = (file) => path.resolve(repoRoot, file)
const isEmbedFile = (file) => toAbsolute(file).startsWith(embedPath)

export default (files) => {
  const commands = []
  const absoluteFiles = files.map(toAbsolute)
  const embedFiles = absoluteFiles.filter(isEmbedFile)
  const otherFiles = absoluteFiles.filter((file) => !isEmbedFile(file))

  const rootLintFiles = otherFiles.filter((file) =>
    hasExtension(file, ['.js', '.jsx', '.ts', '.tsx'])
  )
  const embedLintFiles = embedFiles.filter((file) =>
    hasExtension(file, ['.js', '.ts', '.svelte'])
  )

  if (rootLintFiles.length > 0) {
    commands.push(`eslint --cache --fix ${rootLintFiles.map(quote).join(' ')}`)
  }

  if (embedLintFiles.length > 0) {
    commands.push(
      `cd packages/embed && eslint --cache --fix ${embedLintFiles.map(quote).join(' ')}`
    )
  }

  commands.push(
    `prettier --write --ignore-unknown ${absoluteFiles.map(quote).join(' ')}`
  )

  return commands
}
