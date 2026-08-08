-- Employee Leave Management System - Supabase PostgreSQL Database Schema
-- Public Schema Definition

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    company_email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) DEFAULT 'General Leave',
    leave_reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration NUMERIC(5,2) DEFAULT 1,
    document_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    manager_remarks TEXT,
    notification_read INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leave Types Table
CREATE TABLE IF NOT EXISTS public.leave_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    max_days_per_year INTEGER NOT NULL DEFAULT 20,
    description TEXT,
    requires_proof BOOLEAN DEFAULT false,
    color_code VARCHAR(20) DEFAULT '#3B82F6'
);

-- 4. Company Holidays Table
CREATE TABLE IF NOT EXISTS public.company_holidays (
    id SERIAL PRIMARY KEY,
    holiday_name VARCHAR(150) NOT NULL,
    holiday_date DATE NOT NULL,
    day_of_week VARCHAR(50),
    type VARCHAR(50) DEFAULT 'National',
    description TEXT
);

-- 5. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    manager_name VARCHAR(255),
    total_employees INTEGER DEFAULT 0,
    description TEXT
);

-- 6. Company Policies Table
CREATE TABLE IF NOT EXISTS public.company_policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for optimal querying performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_company_email ON public.users(company_email);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_holidays_date ON public.company_holidays(holiday_date);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER trigger_update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table & Sequence Privileges (Fixes 'permission denied for table users')
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;

-- Allow public full access for application queries
DROP POLICY IF EXISTS "Allow public full access to users" ON public.users;
CREATE POLICY "Allow public full access to users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to leave_requests" ON public.leave_requests;
CREATE POLICY "Allow public full access to leave_requests" ON public.leave_requests FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to leave_types" ON public.leave_types;
CREATE POLICY "Allow public full access to leave_types" ON public.leave_types FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to company_holidays" ON public.company_holidays;
CREATE POLICY "Allow public full access to company_holidays" ON public.company_holidays FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to departments" ON public.departments;
CREATE POLICY "Allow public full access to departments" ON public.departments FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to company_policies" ON public.company_policies;
CREATE POLICY "Allow public full access to company_policies" ON public.company_policies FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed Predefined Manager Account
INSERT INTO public.users (full_name, username, company_email, role)
VALUES ('ZOLLID Manager', 'manager', 'manager@zollid.in', 'manager')
ON CONFLICT (username) DO NOTHING;

-- Seed Leave Types
INSERT INTO public.leave_types (id, code, name, max_days_per_year, description, requires_proof, color_code)
VALUES
(1, 'Annual', 'Annual Leave', 20, 'Paid time off for vacation or personal rest', false, '#3B82F6'),
(2, 'Sick', 'Sick Leave', 12, 'Medical treatment, illness, or doctor appointments', true, '#EF4444'),
(3, 'Casual', 'Casual Leave', 10, 'Short-notice personal tasks or family matters', false, '#F59E0B'),
(4, 'Emergency', 'Emergency Leave', 5, 'Unforeseen urgent events or family emergencies', true, '#8B5CF6'),
(5, 'Maternity', 'Maternity / Paternity Leave', 180, 'Parental leave for childbirth or adoption support', true, '#EC4899'),
(6, 'Unpaid', 'Loss of Pay (LOP)', 30, 'Unpaid extended leave approved beyond standard quota', false, '#6B7280')
ON CONFLICT (code) DO NOTHING;

-- Seed Company Holidays
INSERT INTO public.company_holidays (id, holiday_name, holiday_date, day_of_week, type, description)
VALUES
(1, 'New Year''s Day', '2026-01-01', 'Thursday', 'National', 'Global New Year Celebration'),
(2, 'Republic Day', '2026-01-26', 'Monday', 'National', 'National Republic Day Holiday'),
(3, 'Good Friday', '2026-04-03', 'Friday', 'Festival', 'Good Friday Observance'),
(4, 'May Day / Labour Day', '2026-05-01', 'Friday', 'Company Holiday', 'International Workers Day'),
(5, 'Independence Day', '2026-08-15', 'Saturday', 'National', 'National Independence Day'),
(6, 'Gandhi Jayanti', '2026-10-02', 'Friday', 'National', 'Mahatma Gandhi Birth Anniversary'),
(7, 'Diwali / Deepavali', '2026-11-08', 'Sunday', 'Festival', 'Festival of Lights'),
(8, 'Christmas Day', '2026-12-25', 'Friday', 'Festival', 'Christmas Celebration')
ON CONFLICT (id) DO NOTHING;

-- Seed Departments
INSERT INTO public.departments (id, code, name, manager_name, total_employees, description)
VALUES
(1, 'ENG', 'Software Engineering', 'ZOLLID Manager', 18, 'Core product engineering and technology infrastructure'),
(2, 'HR', 'Human Resources', 'GCU Manager', 6, 'Talent acquisition, employee welfare, and leave management'),
(3, 'PD', 'Product & Design', 'ZOLLID Manager', 8, 'User experience, product strategy, and visual design'),
(4, 'SM', 'Sales & Marketing', 'GCU Manager', 12, 'Business development, client relationships, and marketing'),
(5, 'FO', 'Finance & Operations', 'ZOLLID Manager', 5, 'Payroll, financial planning, and enterprise ops')
ON CONFLICT (code) DO NOTHING;

-- Seed Company Policies
INSERT INTO public.company_policies (id, title, category, content, effective_date)
VALUES
(1, 'Annual Leave Quota & Application Window', 'Leave Quota', 'Employees receive 20 days of paid annual leave per calendar year. Leave applications exceeding 3 consecutive days must be submitted at least 5 business days in advance.', '2026-01-01'),
(2, 'Sick Leave & Medical Certificate Requirements', 'Sick Leave', 'Medical certificates issued by a certified healthcare professional are mandatory for sick leave applications extending beyond 2 consecutive days.', '2026-01-01'),
(3, 'Year-End Carry Forward Policy', 'Carry Forward', 'Up to 5 unused annual leave days can be carried forward into the next calendar year. Carried forward leave must be utilized by Q1.', '2026-01-01'),
(4, 'Notice Period for Emergency Leave', 'Emergency Leave', 'In emergency situations, leave must be reported to line manager or submitted via the portal within 24 hours of absence start date.', '2026-01-01')
ON CONFLICT (id) DO NOTHING;
