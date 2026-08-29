# Meeting Room Booking App 📅

Веб-додаток для управління бронюванням переговорних кімнат з підтримкою користувацьких ролей, управління користувачами та перевіркою конфліктів часу.

## 🎯 Основні можливості

### Реєстрація та авторизація

- ✅ Реєстрація нових користувачів
- ✅ Вхід в систему з JWT токенами
- ✅ Безпечне зберігання паролів (bcrypt)
- ✅ Автоматична передача токена в запитах

### Управління кімнатами

- ✅ Створення нових переговорних кімнат
- ✅ Редагування інформації про кімнату
- ✅ Видалення кімнат
- ✅ Перегляд списку всіх кімнат користувача

### Бронювання

- ✅ Створення нових бронювань
- ✅ Редагування часу та опису бронювання
- ✅ Скасування бронювань
- ✅ **Автоматична перевірка конфліктів часу** - система не дозволяє подвійні бронювання

### Управління користувачами

- ✅ Додавання користувачів до кімнат за email
- ✅ Управління ролями (USER, ADMIN)
- ✅ Видалення користувачів з кімнати
- ✅ Повнота прав доступу на основі ролей

## 🏗️ Архітектура

### Stack технологій

#### Frontend

- **Next.js 16.3.3** - React framework з App Router
- **TypeScript** - Строга типізація
- **Tailwind CSS** - Утилітарний CSS фреймворк
- **React Query** - Управління асинхронним станом
- **Axios** - HTTP клієнт

#### Backend

- **Express.js** - Web framework
- **TypeScript** - Строга типізація
- **Prisma** - ORM для бази даних
- **PostgreSQL** - Реляційна база даних
- **JWT** - JSON Web Token аутентифікація
- **bcrypt** - Хешування паролів

## 📂 Структура проекту

```
meeting-room-booking/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Pages та routes
│   │   │   ├── login/         # Сторінка входу
│   │   │   ├── register/      # Сторінка реєстрації
│   │   │   ├── rooms/         # Список кімнат
│   │   │   └── rooms/[id]/    # Деталі кімнати
│   │   ├── components/        # React компоненти
│   │   │   └── AuthGuard.tsx  # Захист приватних сторінок
│   │   ├── services/          # API сервіси
│   │   │   ├── authService.ts
│   │   │   ├── roomService.ts
│   │   │   ├── bookingService.ts
│   │   │   └── memberService.ts
│   │   ├── lib/               # Утиліти
│   │   │   ├── api.ts         # Axios instance
│   │   │   └── auth.ts        # Token management
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── server.ts          # Entry point
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── roomController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── roomMemberController.ts
│   │   ├── services/          # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── roomService.ts
│   │   │   ├── bookingService.ts
│   │   │   └── roomMemberService.ts
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   │   └── authMiddleware.ts
│   │   └── lib/
│   │       └── prisma.ts      # Prisma client
│   │
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── package.json
│
├── REQUIREMENTS_CHECKLIST.md  # Детальна перевірка вимог
└── README.md                  # Цей файл
```

## 🚀 Запуск проекту

### Передумови

- Node.js 18+
- PostgreSQL 12+
- npm або yarn

### 1. Клонування репозиторію

```bash
git clone https://github.com/ArtemNyow/meeting-room-booking.git
cd meeting-room-booking
```

### 2. Налаштування сервера

```bash
cd server

# Установка залежностей
npm install

# Налаштування .env файлу
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=5000
EOF

# Створення й міграція бази даних
npx prisma migrate dev --name init

# Збірка
npm run build

# Запуск
npm start
```

### 3. Налаштування клієнта

```bash
cd ../client

# Установка залежностей
npm install

# Налаштування .env.local файлу
cat > .env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
EOF

# Запуск development сервера
npm run dev
```

### 4. Доступ до додатку

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 📖 API Документація

### Аутентифікація

#### Реєстрація

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Вхід

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Відповідь:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### Кімнати

#### Список всіх кімнат

```
GET /api/rooms
Authorization: Bearer {token}
```

#### Створити кімнату

```
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Conference Room A",
  "description": "Large room with AV setup"
}
```

#### Оновити кімнату

```
PATCH /api/rooms/{roomId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated name",
  "description": "Updated description"
}
```

#### Видалити кімнату

```
DELETE /api/rooms/{roomId}
Authorization: Bearer {token}
```

### Бронювання

#### Створити бронювання

```
POST /api/rooms/{roomId}/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "startTime": "2026-08-29T15:00:00Z",
  "endTime": "2026-08-29T16:00:00Z",
  "description": "Team meeting"
}
```

#### Отримати бронювання кімнати

```
GET /api/rooms/{roomId}/bookings
Authorization: Bearer {token}
```

#### Оновити бронювання

```
PATCH /api/bookings/{bookingId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "startTime": "2026-08-29T16:00:00Z",
  "endTime": "2026-08-29T17:00:00Z"
}
```

#### Скасувати бронювання

```
DELETE /api/bookings/{bookingId}
Authorization: Bearer {token}
```

### Управління членами

#### Додати користувача до кімнати

```
POST /api/rooms/{roomId}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "USER"
}
```

#### Оновити роль користувача

```
PATCH /api/rooms/{roomId}/members/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Видалити користувача з кімнати

```
DELETE /api/rooms/{roomId}/members/{userId}
Authorization: Bearer {token}
```

## 🔐 Ролі та права доступу

### Admin

- Створення нових кімнат
- Редагування власних кімнат
- Видалення власних кімнат
- Створення бронювань
- Редагування всіх бронювань у своїх кімнатах
- Скасування всіх бронювань у своїх кімнатах
- Додавання користувачів до кімнати
- Видалення користувачів з кімнати
- Зміна ролей користувачів

### User

- Перегляд кімнат, до яких має доступ
- Перегляд бронювань
- Створення бронювань
- Редагування власних бронювань
- Скасування власних бронювань

## 🧪 Тестування

Все функціональність протестовано через API. Див. [REQUIREMENTS_CHECKLIST.md](REQUIREMENTS_CHECKLIST.md) для детальної перевірки.

### Запуск тестів API

```bash
# Зареєструвати користувача
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Створити кімнату
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"Test Room"}'

# Створити бронювання
curl -X POST http://localhost:5000/api/rooms/1/bookings \
  -H "Authorization: Bearer {token}" \
  -d '{"startTime":"2026-08-29T15:00:00Z","endTime":"2026-08-29T16:00:00Z"}'
```

## 🎨 Інтерфейс

- **Темна схема кольорів** - Slate-950 фон для комфорту очей
- **Контрастні акценти** - Cyan та Violet для вибирання елементів
- **Адаптивний дизайн** - Responsive на всіх пристроях
- **Мінімалістичний UI** - Простий та інтуїтивний

## 📋 Вимоги завдання

Див. [REQUIREMENTS_CHECKLIST.md](REQUIREMENTS_CHECKLIST.md) для детальної перевірки всіх функціональних вимог та їх реалізації.

## 👤 Автор

Vlad

## 📄 Ліцензія

MIT
