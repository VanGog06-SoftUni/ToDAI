# ToDAI - Task Management Application

A personal task management application built with React, Express, TypeScript, and PostgreSQL.

## Tech Stack

**Frontend:**

- React 18 + TypeScript
- Shadcn/ui components
- TailwindCSS
- Optimistic UI updates

**Backend:**

- Node.js + Express
- TypeScript
- PostgreSQL
- CORS enabled

**Development:**

- Docker Compose for local PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- Git

### Setup Instructions

1. **Clone the repository**

   ```bash
   cd ToDAI
   ```

2. **Start PostgreSQL with Docker**

   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   Backend will run on http://localhost:3001

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:3000

### Project Structure

```
ToDAI/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── database/        # DB connection & init
│   │   ├── middleware/      # Error handling
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # App entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # API client & utilities
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

**tasks table:**

- `id` - Serial primary key
- `title` - Task title (required)
- `description` - Task description
- `due_date` - Due date
- `priority` - LOW | MEDIUM | HIGH
- `completed` - Boolean status
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Development

- Backend runs on port 3001
- Frontend runs on port 3000
- PostgreSQL runs on port 5432

## License

MIT
