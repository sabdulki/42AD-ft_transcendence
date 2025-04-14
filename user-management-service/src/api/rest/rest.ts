import { FastifyInstance } from 'fastify'
import { IHandler } from '../../pkg/handler/handler'
import { pingHandler } from './handlers/ping'
import { registrationHandler } from './handlers/registration'

const routes: IHandler[] = [
  {
    method: 'GET',
    route: '/ping',
    handler: pingHandler
  },
  {
    method: 'POST',
    route: '/auth/api/rest/registration',
    handler: registrationHandler
  }
]

export async function registerRestRoutes(app: FastifyInstance) {
  for (const route of routes) {
    app.route({
      method: route.method,
      url: route.route,
      handler: route.handler
    })
  }
}
