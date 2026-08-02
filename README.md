# ZOLLID Employee Leave Management System

A production-ready, full-stack Employee Leave Management System built with React, TypeScript, Express.js, JWT Authentication, and Supabase. The application provides secure role-based access for employees and managers, enabling leave management, approval workflows, document uploads, notifications, and analytics through a modern enterprise SaaS interface.

---

## Live Demo

🔗 https://your-vercel-app.vercel.app

---

## Features

### Authentication & Security
- Employee Registration & Login
- Predefined Manager Account
- JWT Authentication
- Role-Based Access Control (RBAC)
- Secure In-App Password Reset
- Protected Manager Routes
- bcrypt Password Hashing

### Employee Portal
- Interactive Dashboard
- Apply for Leave
- Leave History
- Leave Status Tracking
- Document Uploads
- Calendar View
- Real-Time Notifications
- Withdraw Pending Requests

### Manager Portal
- Dashboard & Analytics
- Employee Directory
- Leave Request Management
- Approve / Reject Leave Requests
- Manager Remarks
- Team Leave Calendar
- Document Preview

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Hot Toast
- Lucide React
- date-fns

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- Multer

### Database & Storage
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

---

## Project Architecture

```text
React + TypeScript
        │
        ▼
Express REST API
        │
        ▼
JWT Authentication
        │
        ▼
Supabase Auth
        │
        ▼
public.users
        │
        ▼
public.leave_requests
        │
        ▼
Supabase Storage
```

---

## Project Structure

```text
employee-leave-management-system/
├── api/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
├── supabase/
├── server.ts
├── vercel.json
└── package.json
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/zollid-leave-management-system.git
cd zollid-leave-management-system
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Screenshots

> Add screenshots of:
- Login Page
- Employee Dashboard
- Apply Leave
- Leave History
- Manager Dashboard
- Employee Directory
- Team Calendar

---

## License

This project is licensed under the MIT License.
