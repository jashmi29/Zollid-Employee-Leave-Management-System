# ZOLLID Employee Leave Management System

A production-ready, full-stack enterprise **Employee Leave Management System** built with **React 19**, **TypeScript**, **Node.js/Express**, **JWT Authentication**, and **Supabase PostgreSQL & Auth**. Features role-based access control (RBAC), document uploads via Supabase Storage, interactive calendar views, a secure in-app password reset feature, and dark/light theme switching.

---

## 📌 Project Overview

- **Repository Name**: `zollid-leave-management-system` (or `employee-leave-management-system`)
- **Description**: An enterprise SaaS application designed for employees to apply for leave, upload medical/supporting documents, track request status, and reset passwords securely. Managers can review organizational requests, view documents, approve/reject applications with feedback, track team availability on a calendar, and monitor leave analytics.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Enforces strict separation between **Employee** and **Manager** portals.
- **JWT Session Authorization**: Secured server routes with Bearer token verification.
- **Predefined Manager Account**: Primary manager (`manager@zollid.in`) seeded with fixed permissions; public registration creates employee accounts only.
- **In-App Forgot Password**: Secure password reset flow without email verification—verifies employee `Username` and `Company Email` against database records and updates credentials via server-side Supabase Admin API (`auth.admin.updateUserById`). Manager accounts are protected from password reset via this interface.

### 👤 Employee Portal
- **Interactive Dashboard**: Personal leave stats (Approved Days, Pending Requests, Remaining Leave Balance), quick action buttons, and recent activity log.
- **Apply for Leave**: Form with leave type selection (Casual, Sick, Earned, Unpaid), start & end date validation, duration calculation, and supporting document uploads (PDF, JPG, PNG up to 10MB) stored in Supabase Storage.
- **Leave History**: Filterable table displaying request status badges, manager remarks, inline file previews, and withdrawal/cancellation for pending applications.
- **Calendar View**: Visual overview of approved personal leaves and company holidays.
- **Real-Time Notifications**: Unread status notification badge alerting employees when leave requests are approved or rejected.

### 🛡️ Manager Portal
- **Executive Analytics**: Real-time metrics on total workforce, pending reviews queue, approved leaves, and rejected requests.
- **Leave Request Management**: Review incoming leave applications with filter/search options, view attached documents, and approve or reject with custom manager feedback remarks.
- **Employee Directory**: Searchable directory listing all staff members, contact information, joined dates, and individual leave usage statistics.
- **Team Calendar**: Centralized calendar showing active and upcoming leave across all departments to prevent scheduling conflicts.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Axios, Lucide Icons, React Hot Toast, Date-fns.
- **Backend**: Express.js, Node.js, TypeScript (tsx / esbuild bundling), JWT (`jsonwebtoken`), `bcryptjs`, Multer.
- **Database & Storage**: Supabase PostgreSQL (`public.users`, `public.leave_requests`), Supabase Auth, Supabase Storage (`leave-documents` bucket).

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Manager (ZOLLID)** | `manager` / `manager@zollid.in` | `Manager@Zollid2026!` | Full Admin Portal, Employee Directory, Approval Workflow |
| **Manager (Legacy)** | `manager_gcu` / `manager@gcu.in` | `Manager@123` | Secondary Admin Portal Access |
| **Employee (Demo)** | `alex.rivera` / `alex.rivera@zollid.in` | `Employee@123` | Personal Dashboard, Apply Leave, Leave History, Password Reset |

*Note: New employee accounts can be registered at `/register`.*

---

## 📂 Project Directory Structure

```text
employee-leave-management-system/
├── api/                  # Vercel Serverless Function entry point (api/index.ts)
├── server/
│   ├── config/          # Supabase client, DB logic, & auto-seeding
│   ├── controllers/     # Auth, Leave, & Employee controllers
│   ├── middleware/      # JWT auth, RBAC authorization, & Multer uploader
│   └── routes/          # Express API endpoints (/api/auth, /api/leaves, /api/employees)
├── src/
│   ├── components/      # UI components (Navbar, Sidebar, Modals, ResetPasswordModal)
│   ├── context/         # AuthContext & ThemeContext state managers
│   ├── hooks/           # Custom hooks (useAuth, useTheme, useNotifications)
│   ├── pages/
│   │   ├── employee/    # Employee Dashboard, ApplyLeave, LeaveHistory, Calendar
│   │   ├── manager/     # Manager Dashboard, Employees, LeaveRequests, Team Calendar
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── services/        # Axios API clients
│   └── types.ts         # TypeScript definitions
├── supabase/
│   ├── schema.sql       # PostgreSQL DDL schema & RLS policies
│   └── migrations/      # Migration scripts
├── server.ts            # Express server entry point with Vite middleware
├── vercel.json          # Vercel deployment & API rewrite configuration
└── package.json
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET="zollid-leave-management-secret-key-2026"

# Supabase Credentials
SUPABASE_URL="https://whbdvinxoikxuyynoatl.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Optional Manager Override
ZOLLID_MANAGER_PASSWORD="Manager@Zollid2026!"
```

---

## 📦 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/zollid-leave-management-system.git
   cd zollid-leave-management-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🚀 Deployment Instructions for Vercel

### Step 1: Database & Storage Setup (Supabase)
1. Log in to [Supabase](https://supabase.com) and create a project.
2. Go to **SQL Editor** -> New Query.
3. Paste and run the SQL schema in `supabase/schema.sql`.
4. Create a public storage bucket named `leave-documents` in **Storage**.

### Step 2: Push Project to GitHub
1. Create a new repository on GitHub named `zollid-leave-management-system`.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Production-ready Leave Management System"
   git branch -M main
   git remote add origin https://github.com/your-username/zollid-leave-management-system.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your GitHub repository (`zollid-leave-management-system`).
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `JWT_SECRET`: `your-random-secret-key`
   - `SUPABASE_URL`: `https://whbdvinxoikxuyynoatl.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
5. Click **Deploy**. Vercel will build the frontend assets and host the application!

---

## 📄 License
This project is licensed under the MIT License.
