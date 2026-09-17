# Fastify TypeScript User CRUD API

A clean, modular REST API built with **Fastify**, **TypeScript**, and Node.js implementing User CRUD operations.

---

## 📁 Project Architecture & Directory Structure

```text
Learn js/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── src/
    ├── types/
    │   └── user.ts              # TypeScript interfaces & DTO types
    ├── schemas/
    │   └── user.schema.ts       # JSON Schema validations for request/response
    ├── repositories/
    │   └── user.repository.ts   # Data access layer (In-memory store)
    ├── services/
    │   └── user.service.ts      # Business logic & validation layer
    ├── controllers/
    │   └── user.controller.ts   # Route controllers (request & response handlers)
    ├── routes/
    │   └── user.routes.ts       # Fastify route definitions & plugin registration
    ├── app.ts                   # Fastify app setup, plugins & global error handler
    └── server.ts                # Application entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Run the development server with live reload (`tsx watch`):
```bash
npm run dev
```
The server will start at: `http://localhost:3000`

### 3. Build & Production Mode
Compile TypeScript code to JavaScript (`dist/`) and run:
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/users`

| Method | Endpoint | Description | Request Body Example |
|---|---|---|---|
| `GET` | `/health` | Server Health Check | N/A |
| `GET` | `/api/users` | Get all users | N/A |
| `GET` | `/api/users/:id` | Get single user by ID | N/A |
| `POST` | `/api/users` | Create new user | `{"name": "Sneha", "email": "sneha@example.com", "role": "user"}` |
| `PUT` | `/api/users/:id` | Update user details | `{"name": "Sneha Deshmukh"}` |
| `DELETE` | `/api/users/:id` | Delete user by ID | N/A |

---

## 🧪 Testing with cURL / Postman

### 1. Get All Users
```bash
curl -X GET http://localhost:3000/api/users
```

### 2. Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Sneha Patil", "email": "sneha@example.com", "role": "admin"}'
```

### 3. Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/<USER_ID>
```

### 4. Update User
```bash
curl -X PUT http://localhost:3000/api/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"name": "Sneha Joshi"}'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/<USER_ID>
```
