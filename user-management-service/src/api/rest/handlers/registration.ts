import { FastifyRequest, FastifyReply } from 'fastify'
import { Storage } from '../../../infrastructure/storage/storage'
import bcrypt from 'bcryptjs'
// import '../../../typos/fastify' // 👈 Добавь это временно


interface RegisterBody {
  name: string
  email: string
  password: string
}
// <{ Body: RegisterBody }>

export async function registrationHandler(request: FastifyRequest, reply: FastifyReply) 
{
  const { name, email, password } = request.body as RegisterBody

  // Простейшая валидация (можно использовать схемы JSON Schema или zod позже)
  if (!name || !email || !password) {
    return reply.code(400).send({ error: 'Missing name, email or password' })
  }

  // Хешируем пароль
  const hashedPassword = bcrypt.hashSync(password, 10)

  // Получаем доступ к базе данных через fastify.sqlite
  // const db = request.server.sqlite
  const db = (request.server as any).sqlite


  try {
    // Сохраняем нового пользователя в таблицу
    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
    const result = stmt.run(name, email, hashedPassword)
    const user_id = result.lastInsertRowid
    const ratingInsert = db.prepare('INSERT INTO ratings (user_id) VALUES (?)')
    ratingInsert.run(user_id)
    // call function wich will create new row in table users_ratings, connected to user_id
    return reply.code(201).send({ message: 'User registered successfully' })
  } catch (err: any) {
    return reply.code(400).send({ error: 'User already exists or invalid data', detail: err.message })
  }
}
