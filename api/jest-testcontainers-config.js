module.exports = {
  postgres: {
    image: 'postgres',
    tag: '13.1-alpine',
    ports: [5432],
    env: {
      POSTGRES_USER: 'teikeiroot',
      POSTGRES_PASSWORD: 'teikeiroot',
    },
    wait: {
      type: 'text',
      text: 'server started',
    },
  },
}