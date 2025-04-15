import Fastify from 'fastify'
import { registerRestRoutes } from './api/rest/rest'
import sqlite3 from 'better-sqlite3'

const app = Fastify()

async function main() {
  // 1. Подключаемся к SQLite
  const users_db = sqlite3('./users_database.db')
  const ratings_db = sqlite3('./ratings_database.db')

  // 2. Создаем таблицу, если не существует
  users_db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `)
  ratings_db.exec(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id BIGINT NOT NULL,
      value INTEGER DEFAULT 1000,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  // 3. Передаем базу в Fastify (так ты сможешь её использовать в роутерах)
  app.decorate('sqlite_users', users_db)
  app.decorate('sqlite_users', ratings_db)
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
