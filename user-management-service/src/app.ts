import Fastify from 'fastify'
import { registerRestRoutes } from './api/rest/rest'

const app = Fastify()

async function main() {
  await registerRestRoutes(app)

  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log("Server listening at " + address)
  })
}

main()
