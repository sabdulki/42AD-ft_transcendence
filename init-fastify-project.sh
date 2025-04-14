#!/usr/bin/env bash

# Проверка: только bash
if [ -z "$BASH_VERSION" ]; then
  echo "❌ Пожалуйста, запусти скрипт через bash: bash init-fastify-project.sh"
  exit 1
fi

# Проверка на CRLF
if file "$0" | grep -q CRLF; then
  echo "❌ Файл использует Windows (CRLF) переводы строк."
  echo "   Пожалуйста, конвертируй в Unix (LF). Например, выполни:"
  echo "   sed -i 's/\r\$//' $0"
  exit 1
fi

read -p "Введите имя проекта: " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Имя проекта не может быть пустым!"
  exit 1
fi

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME" || exit

echo "📦 Инициализация проекта '$PROJECT_NAME'..."
npm init -y

echo "📥 Установка зависимостей..."
npm install fastify sqlite3
npm install -D typescript ts-node @types/node @types/sqlite3

echo "🛠️ Настройка TypeScript..."
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --lib ES2021 --module commonjs --target ES2021

echo "📁 Создание структуры папок..."
mkdir -p src/api/rest/handlers
mkdir -p src/domain
mkdir -p src/infrastructure
mkdir -p src/pkg/handler
mkdir -p src/pkg/storage
mkdir -p src/infrastructure/storage

# src/pkg/handler/handler.ts
cat <<EOL > src/pkg/handler/handler.ts
import { RouteHandlerMethod } from 'fastify'

export interface IHandler {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  route: string
  handler: RouteHandlerMethod
}
EOL

# src/pkg/storage/storage.ts
cat <<EOL > src/pkg/storage/storage.ts
export interface IStorage {
  testRequestToDB(): Promise<string>
}
EOL

# src/infrastructure/storage/storage.ts
cat <<EOL > src/infrastructure/storage/storage.ts
import { IStorage } from '../../pkg/storage/storage'

export class Storage implements IStorage {
  async testRequestToDB(): Promise<string> {
    // Пример тестового обращения к базе данных SQLite
    return 'connected to database'
  }
}
EOL

# src/api/rest/handlers/ping.ts
cat <<EOL > src/api/rest/handlers/ping.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { Storage } from '../../../infrastructure/storage/storage'

export async function pingHandler(request: FastifyRequest, reply: FastifyReply) {
  const storage = new Storage()
  const result = await storage.testRequestToDB()
  return { pong: result }
}
EOL

# src/api/rest/rest.ts
cat <<EOL > src/api/rest/rest.ts
import { FastifyInstance } from 'fastify'
import { IHandler } from '../../pkg/handler/handler'
import { pingHandler } from './handlers/ping'

const routes: IHandler[] = [
  {
    method: 'GET',
    route: '/ping',
    handler: pingHandler
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
EOL

# src/app.ts
cat <<EOL > src/app.ts
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
EOL

# Добавление скрипта запуска
npx npm-add-script -k "dev" -v "ts-node src/app.ts"

echo "✅ Проект '$PROJECT_NAME' успешно создан!"
echo "👉 Перейди в директорию и запусти: cd $PROJECT_NAME && npm run dev"
