import 'fastify'
import Database from 'better-sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    sqlite_users: Database
    sqlite_ratings: Database
  }
}
