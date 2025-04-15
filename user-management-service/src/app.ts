import Fastify from 'fastify'
import { registerRestRoutes } from './api/rest/rest'
import sqlite3 from 'better-sqlite3'

const app = Fastify()

async function main() {
  // 1. Подключаемся к SQLite
  const db = sqlite3('./database.db')

  // 2. Создаем таблицу, если не существует
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `)

  // 3. Передаем базу в Fastify (так ты сможешь её использовать в роутерах)
  app.decorate('sqlite', db)
  await registerRestRoutes(app)

  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log("Server listening at " + address)
  })
  // console.dir(app, { depth: null })

}

main()
