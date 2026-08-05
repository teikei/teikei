import path from 'path'
import { GenericContainer } from 'testcontainers'

export default async function setup() {
  const buildContext = path.resolve(import.meta.dirname)
  const image = await GenericContainer.fromDockerfile(buildContext).build()
  const container = await image.withExposedPorts(5432).start()

  process.env.TEST_DB_HOST = container.getHost()
  process.env.TEST_DB_PORT = String(container.getMappedPort(5432))

  return async () => {
    await container.stop()
  }
}
