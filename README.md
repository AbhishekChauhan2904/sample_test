
## Folder Structure

```
ai-task-platform/
├── backend/
│   ├── config
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── queue/       
│   ├── routes/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── styles/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 1. Backend Setup

```bash
cd backend
npm install
```bash
npm run dev


## 2. Frontend Setup

``bash
cd frontend
npm install
```bash
npm start
```

## 3. Using the App

1. Register a new account at `/register`.
2. Log in at `/login`.
3. Click **New Task**, provide a title, input text, and pick an operation
   (Uppercase, Lowercase, Reverse String, Word Count).
4. Click **Run Task** — you'll be redirected to the task detail page.
5. The task starts as `PENDING`, flips to `RUNNING`, then resolves to
   `SUCCESS` or `FAILED` within ~1 second. The page polls automatically
   every 2 seconds so you'll see the status, logs, and result update live.
6. The Dashboard lists all your tasks with filtering by status and
   pagination.

## API Reference

| Method | Route                    | Auth | Description                       |
|--------|--------------------------|------|------------------------------------|
| POST   | /api/auth/register       | No   | Register a new user               |
| POST   | /api/auth/login          | No   | Login, returns JWT                 |
| GET    | /api/auth/me             | Yes  | Get current user profile           |
| POST   | /api/tasks               | Yes  | Create + queue a new task          |
| GET    | /api/tasks               | Yes  | List tasks (paginated, filterable) |
| GET    | /api/tasks/:id           | Yes  | Get a single task                  |
| DELETE | /api/tasks/:id           | Yes  | Delete a task                      |
| POST   | /api/tasks/:id/rerun     | Yes  | Re-queue a failed task             |

All authenticated routes require an `Authorization: Bearer <token>` header.

## Security Features Implemented

- Passwords hashed with **bcrypt**
- **JWT** authentication with expiry
- Mongoose input validation on both `User` and `Task` models

