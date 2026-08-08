import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './supabase.js';

export interface UserRecord {
  id: number;
  auth_user_id?: string;
  username: string;
  fullName?: string;
  full_name?: string;
  companyEmail?: string;
  company_email?: string;
  password?: string;
  role: 'employee' | 'manager';
  created_at?: string;
}

export interface LeaveRequestRecord {
  id: number;
  employee_id: number;
  leave_type?: string;
  leave_reason: string;
  reason?: string;
  start_date: string;
  end_date: string;
  approved_start_date?: string | null;
  approved_end_date?: string | null;
  duration?: number;
  document_url: string | null;
  status: 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected';
  remarks: string | null;
  manager_remarks?: string | null;
  notification_read: number;
  created_at?: string;
  updated_at?: string;
  employee_username?: string;
  employee_name?: string;
  employee_email?: string;
}

export interface LeaveTypeRecord {
  id: number;
  code: string;
  name: string;
  max_days_per_year: number;
  description: string;
  requires_proof: boolean;
  color_code: string;
}

export interface LeaveBalanceRecord {
  id?: number;
  employee_id: number;
  leave_type: string;
  total_allowance: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface CompanyHolidayRecord {
  id: number;
  holiday_name: string;
  holiday_date: string;
  day_of_week: string;
  type: 'National' | 'Festival' | 'Company Holiday' | 'Restricted';
  description: string;
}

export interface DepartmentRecord {
  id: number;
  code: string;
  name: string;
  manager_name: string;
  total_employees: number;
  description: string;
}

export interface CompanyPolicyRecord {
  id: number;
  title: string;
  category: string;
  content: string;
  effective_date: string;
}

function stringToNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export function extractCleanUserFields(user: any) {
  const companyEmail = user.company_email || user.user_metadata?.company_email || user.email || '';

  let rawUsername = user.username || user.user_metadata?.username;
  let username = rawUsername;

  if (!username || username.includes('@')) {
    if (username && username.includes('@')) {
      username = username.split('@')[0];
    } else if (companyEmail && companyEmail.includes('@')) {
      username = companyEmail.split('@')[0];
    } else {
      username = 'user';
    }
  }

  let rawFullName = user.full_name || user.user_metadata?.full_name;
  let fullName = rawFullName;

  if (!fullName || fullName.includes('@')) {
    fullName = username.charAt(0).toUpperCase() + username.slice(1);
  }

  return { username, fullName, companyEmail };
}

// Ensure public.users table has the record
export async function syncUserToPublicTable(userRecord: UserRecord): Promise<UserRecord> {
  const supabase = getSupabaseClient();
  const { data: existing, error: findErr } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${userRecord.username},company_email.eq.${userRecord.companyEmail}`)
    .maybeSingle();

  if (!findErr && existing) {
    return {
      id: existing.id,
      auth_user_id: existing.auth_user_id,
      username: existing.username,
      fullName: existing.full_name,
      companyEmail: existing.company_email,
      role: existing.role,
      created_at: existing.created_at
    };
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('users')
    .insert([{
      auth_user_id: userRecord.auth_user_id,
      full_name: userRecord.fullName || userRecord.username,
      username: userRecord.username,
      company_email: userRecord.companyEmail,
      role: userRecord.role
    }])
    .select('*')
    .single();

  if (insertErr) {
    const errorDetails = JSON.stringify(insertErr, null, 2);
    console.error('[DATABASE ERROR] Failed to insert into public.users:', errorDetails);
    throw new Error(`Database error inserting into public.users: ${insertErr.message || errorDetails}`);
  }

  return {
    id: inserted.id,
    auth_user_id: inserted.auth_user_id,
    username: inserted.username,
    fullName: inserted.full_name,
    companyEmail: inserted.company_email,
    role: inserted.role,
    created_at: inserted.created_at
  };
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const trimmed = username.trim().toLowerCase();
  const supabase = getSupabaseClient();

  // 1. Try public.users table first
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', trimmed)
      .maybeSingle();

    if (!error && dbUser) {
      let password = (dbUser as any).password;
      if (!password) {
        try {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const authUser = (listData?.users || []).find((u: any) => {
            if (dbUser.auth_user_id && u.id === dbUser.auth_user_id) return true;
            const uName = (u.user_metadata?.username || '').toLowerCase();
            const uEmail = (u.email || u.user_metadata?.company_email || '').toLowerCase();
            return uName === trimmed || uEmail === trimmed;
          });
          if (authUser) {
            password = authUser.user_metadata?.password_hash || authUser.user_metadata?.password;
          }
        } catch (authErr) {
          console.warn('Note fetching auth metadata for password:', authErr);
        }
      }

      if (!password && (dbUser.role === 'manager' || dbUser.company_email === 'manager@zollid.in' || dbUser.username === 'manager')) {
        const managerPassword = process.env.ZOLLID_MANAGER_PASSWORD || 'Manager@Zollid2026!';
        password = bcrypt.hashSync(managerPassword, 10);
      } else if (!password && (dbUser.company_email === 'manager@gcu.in' || dbUser.username === 'manager_gcu')) {
        password = bcrypt.hashSync('Manager@123', 10);
      }

      return {
        id: dbUser.id,
        auth_user_id: dbUser.auth_user_id,
        username: dbUser.username,
        fullName: dbUser.full_name,
        companyEmail: dbUser.company_email,
        password,
        role: dbUser.role,
        created_at: dbUser.created_at
      };
    }
  } catch (err) {
    console.warn('Note on public.users findUserByUsername:', err);
  }

  // 2. Query Supabase Auth users
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Database error looking up username '${trimmed}' in Supabase: ${listError.message}`);
  }

  const user = (listData.users || []).find((u: any) => {
    const uName = (u.user_metadata?.username || '').toLowerCase();
    const cleanUName = uName.includes('@') ? uName.split('@')[0] : uName;
    return uName === trimmed || cleanUName === trimmed;
  });

  if (!user) return null;

  const numericId = user.user_metadata?.numeric_id || stringToNumericId(user.id);
  const { username: cleanUsername, fullName: cleanFullName, companyEmail } = extractCleanUserFields(user);
  const isManagerAccount = user.user_metadata?.role === 'manager' || companyEmail === 'manager@zollid.in' || companyEmail === 'manager@gcu.in';

  let password = user.user_metadata?.password_hash || user.user_metadata?.password;
  if (!password && isManagerAccount) {
    if (companyEmail === 'manager@gcu.in') {
      password = bcrypt.hashSync('Manager@123', 10);
    } else {
      const managerPassword = process.env.ZOLLID_MANAGER_PASSWORD || 'Manager@Zollid2026!';
      password = bcrypt.hashSync(managerPassword, 10);
    }
  }

  const userRec: UserRecord = {
    id: numericId,
    auth_user_id: user.id,
    username: cleanUsername,
    fullName: cleanFullName,
    companyEmail,
    password,
    role: isManagerAccount ? 'manager' : 'employee',
    created_at: user.created_at
  };

  // Sync to public.users table if available
  return await syncUserToPublicTable(userRec);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const trimmed = email.trim().toLowerCase();
  const supabase = getSupabaseClient();

  // 1. Try public.users table
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .ilike('company_email', trimmed)
      .maybeSingle();

    if (!error && dbUser) {
      let password = (dbUser as any).password;
      if (!password) {
        try {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const authUser = (listData?.users || []).find((u: any) => {
            if (dbUser.auth_user_id && u.id === dbUser.auth_user_id) return true;
            const uName = (u.user_metadata?.username || '').toLowerCase();
            const uEmail = (u.email || u.user_metadata?.company_email || '').toLowerCase();
            return uName === trimmed || uEmail === trimmed;
          });
          if (authUser) {
            password = authUser.user_metadata?.password_hash || authUser.user_metadata?.password;
          }
        } catch (authErr) {
          console.warn('Note fetching auth metadata for password:', authErr);
        }
      }

      if (!password && (dbUser.role === 'manager' || dbUser.company_email === 'manager@zollid.in' || dbUser.username === 'manager')) {
        const managerPassword = process.env.ZOLLID_MANAGER_PASSWORD || 'Manager@Zollid2026!';
        password = bcrypt.hashSync(managerPassword, 10);
      } else if (!password && (dbUser.company_email === 'manager@gcu.in' || dbUser.username === 'manager_gcu')) {
        password = bcrypt.hashSync('Manager@123', 10);
      }

      return {
        id: dbUser.id,
        auth_user_id: dbUser.auth_user_id,
        username: dbUser.username,
        fullName: dbUser.full_name,
        companyEmail: dbUser.company_email,
        password,
        role: dbUser.role,
        created_at: dbUser.created_at
      };
    }
  } catch (err) {
    console.warn('Note on public.users findUserByEmail:', err);
  }

  // 2. Query Supabase Auth users
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Database error looking up email '${trimmed}' in Supabase: ${listError.message}`);
  }

  const user = (listData.users || []).find((u: any) => {
    const uEmail = (u.email || u.user_metadata?.company_email || '').toLowerCase();
    return uEmail === trimmed;
  });

  if (!user) return null;

  const numericId = user.user_metadata?.numeric_id || stringToNumericId(user.id);
  const { username: cleanUsername, fullName: cleanFullName, companyEmail } = extractCleanUserFields(user);
  const isManagerAccount = user.user_metadata?.role === 'manager' || companyEmail === 'manager@zollid.in' || companyEmail === 'manager@gcu.in';

  let password = user.user_metadata?.password_hash || user.user_metadata?.password;
  if (!password && isManagerAccount) {
    if (companyEmail === 'manager@gcu.in') {
      password = bcrypt.hashSync('Manager@123', 10);
    } else {
      const managerPassword = process.env.ZOLLID_MANAGER_PASSWORD || 'Manager@Zollid2026!';
      password = bcrypt.hashSync(managerPassword, 10);
    }
  }

  const userRec: UserRecord = {
    id: numericId,
    auth_user_id: user.id,
    username: cleanUsername,
    fullName: cleanFullName,
    companyEmail,
    password,
    role: isManagerAccount ? 'manager' : 'employee',
    created_at: user.created_at
  };

  return await syncUserToPublicTable(userRec);
}

export async function findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
  const trimmed = identifier.trim().toLowerCase();
  const byEmail = await findUserByEmail(trimmed);
  if (byEmail) return byEmail;
  return await findUserByUsername(trimmed);
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const supabase = getSupabaseClient();

  // 1. Try public.users table
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && dbUser) {
      return {
        id: dbUser.id,
        auth_user_id: dbUser.auth_user_id,
        username: dbUser.username,
        fullName: dbUser.full_name,
        companyEmail: dbUser.company_email,
        role: dbUser.role,
        created_at: dbUser.created_at
      };
    }
  } catch (err) {
    console.warn('Note on public.users findUserById:', err);
  }

  // 2. Query Supabase Auth users
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Database error looking up user ID ${id}: ${listError.message}`);
  }

  const user = (listData.users || []).find((u: any) => {
    const numId = u.user_metadata?.numeric_id || stringToNumericId(u.id);
    return numId === id;
  });

  if (!user) return null;

  const { username: cleanUsername, fullName: cleanFullName, companyEmail } = extractCleanUserFields(user);
  const isManagerAccount = user.user_metadata?.role === 'manager' || companyEmail === 'manager@zollid.in' || companyEmail === 'manager@gcu.in';

  return {
    id: user.user_metadata?.numeric_id || stringToNumericId(user.id),
    username: cleanUsername,
    fullName: cleanFullName,
    companyEmail,
    role: isManagerAccount ? 'manager' : 'employee',
    created_at: user.created_at
  };
}

export async function createUser(
  username: string,
  fullName: string,
  companyEmail: string,
  hashedPassword: string,
  role: 'employee' | 'manager' = 'employee'
): Promise<UserRecord> {
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = companyEmail.trim().toLowerCase();
  const trimmedFullName = fullName.trim();
  const supabase = getSupabaseClient();

  const isManagerAccount = role === 'manager' || trimmedEmail === 'manager@zollid.in' || trimmedEmail === 'manager@gcu.in';
  const effectiveRole: 'employee' | 'manager' = isManagerAccount ? 'manager' : role;

  const existingUsername = await findUserByUsername(trimmedUsername);
  if (existingUsername) {
    throw new Error(`Username '${trimmedUsername}' is already taken. Please choose another username.`);
  }

  const existingEmail = await findUserByEmail(trimmedEmail);
  if (existingEmail) {
    throw new Error(`An account with company email '${trimmedEmail}' already exists.`);
  }

  const dummyPassword = 'Password@123';
  const numericId = stringToNumericId(`${trimmedEmail}_${Date.now()}`);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: trimmedEmail,
    password: dummyPassword,
    user_metadata: {
      username: trimmedUsername,
      full_name: trimmedFullName,
      company_email: trimmedEmail,
      role: effectiveRole,
      password_hash: hashedPassword,
      numeric_id: numericId
    },
    email_confirm: true
  });

  if (createError || !created.user) {
    throw new Error(`Failed to create user in Supabase Auth: ${createError?.message || 'Unknown database error'}`);
  }

  // Insert into public.users table
  let finalUser: UserRecord = {
    id: numericId,
    auth_user_id: created.user.id,
    username: trimmedUsername,
    fullName: trimmedFullName,
    companyEmail: trimmedEmail,
    role: effectiveRole,
    created_at: created.user.created_at
  };

  const { data: insertedUser, error: dbErr } = await supabase
    .from('users')
    .insert([{
      auth_user_id: created.user.id,
      full_name: trimmedFullName,
      username: trimmedUsername,
      company_email: trimmedEmail,
      role: effectiveRole
    }])
    .select('*')
    .single();

  if (dbErr) {
    const errorDetails = JSON.stringify(dbErr, null, 2);
    console.error('[DATABASE ERROR] Failed inserting user into public.users table:', errorDetails);
    throw new Error(`Database error inserting user into public.users: ${dbErr.message || errorDetails}`);
  }

  if (insertedUser) {
    finalUser.id = insertedUser.id;
    console.log(`[DATABASE SUCCESS] Inserted user ID ${insertedUser.id} into public.users table.`);
  }

  return finalUser;
}

export async function createLeaveRequest(data: {
  employee_id: number;
  leave_reason: string;
  start_date: string;
  end_date: string;
  leave_type?: string;
  document_url?: string | null;
}): Promise<LeaveRequestRecord> {
  const supabase = getSupabaseClient();

  const startDateObj = new Date(data.start_date);
  const endDateObj = new Date(data.end_date);
  const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
  const calcDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const now = new Date().toISOString();

  // Get user details for clean fields and ensure user exists in public.users
  const user = await findUserById(data.employee_id);
  let dbEmployeeId = data.employee_id;

  if (user) {
    const syncedUser = await syncUserToPublicTable(user);
    dbEmployeeId = syncedUser.id;
  }

  // Insert into public.leave_requests table
  const { data: inserted, error: leaveErr } = await supabase
    .from('leave_requests')
    .insert([{
      employee_id: dbEmployeeId,
      leave_type: data.leave_type || 'General Leave',
      leave_reason: data.leave_reason,
      start_date: data.start_date,
      end_date: data.end_date,
      duration: calcDuration,
      document_url: data.document_url || null,
      status: 'Pending',
      notification_read: 1,
      created_at: now,
      updated_at: now
    }])
    .select('*')
    .single();

  if (leaveErr) {
    const errorDetails = JSON.stringify(leaveErr, null, 2);
    console.error('[DATABASE ERROR] Failed inserting request into public.leave_requests:', errorDetails);
    throw new Error(`Database error inserting request into public.leave_requests: ${leaveErr.message || errorDetails}`);
  }

  console.log(`[DATABASE SUCCESS] Inserted leave request ID ${inserted.id} into public.leave_requests table.`);
  return {
    id: inserted.id,
    employee_id: inserted.employee_id,
    leave_type: inserted.leave_type || 'General Leave',
    leave_reason: inserted.leave_reason,
    reason: inserted.leave_reason,
    start_date: inserted.start_date,
    end_date: inserted.end_date,
    duration: inserted.duration || calcDuration,
    document_url: inserted.document_url,
    status: inserted.status,
    remarks: inserted.manager_remarks || inserted.remarks || null,
    manager_remarks: inserted.manager_remarks || inserted.remarks || null,
    notification_read: inserted.notification_read,
    created_at: inserted.created_at,
    updated_at: inserted.updated_at,
    employee_username: user?.username || 'employee',
    employee_name: user?.fullName || user?.username,
    employee_email: user?.companyEmail
  };

  // 2. Fallback to Supabase Auth user_metadata
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Database error fetching users: ${listError.message}`);
  }

  const authUser = (listData.users || []).find((u: any) => {
    const numId = u.user_metadata?.numeric_id || stringToNumericId(u.id);
    return numId === data.employee_id;
  });

  if (!authUser) {
    throw new Error(`Employee ID ${data.employee_id} not found in Supabase database.`);
  }

  const currentLeaves: LeaveRequestRecord[] = authUser.user_metadata?.leaves || [];
  const leaveId = Date.now() + Math.floor(Math.random() * 1000);
  const { username, fullName, companyEmail } = extractCleanUserFields(authUser);

  const newLeave: LeaveRequestRecord = {
    id: leaveId,
    employee_id: data.employee_id,
    leave_type: data.leave_type || 'General Leave',
    leave_reason: data.leave_reason,
    reason: data.leave_reason,
    start_date: data.start_date,
    end_date: data.end_date,
    duration: calcDuration,
    document_url: data.document_url || null,
    status: 'Pending',
    remarks: null,
    manager_remarks: null,
    notification_read: 1,
    created_at: now,
    updated_at: now,
    employee_username: username,
    employee_name: fullName,
    employee_email: companyEmail
  };

  const updatedLeaves = [newLeave, ...currentLeaves];

  await supabase.auth.admin.updateUserById(authUser.id, {
    user_metadata: {
      ...authUser.user_metadata,
      leaves: updatedLeaves
    }
  });

  return newLeave;
}

export async function getLeavesByEmployeeId(employee_id: number): Promise<LeaveRequestRecord[]> {
  const supabase = getSupabaseClient();

  // 1. Try public.leave_requests table
  try {
    const { data: dbLeaves, error } = await supabase
      .from('leave_requests')
      .select('*, users(username, full_name, company_email)')
      .eq('employee_id', employee_id)
      .order('created_at', { ascending: false });

    if (!error && dbLeaves && dbLeaves.length > 0) {
      return dbLeaves.map(l => ({
        id: l.id,
        employee_id: l.employee_id,
        leave_type: l.leave_type || 'General Leave',
        leave_reason: l.leave_reason,
        reason: l.leave_reason,
        start_date: l.start_date,
        end_date: l.end_date,
        approved_start_date: l.approved_start_date || null,
        approved_end_date: l.approved_end_date || null,
        duration: l.duration || 1,
        document_url: l.document_url,
        status: l.status,
        remarks: l.manager_remarks || l.remarks || null,
        manager_remarks: l.manager_remarks || l.remarks || null,
        notification_read: l.notification_read,
        created_at: l.created_at,
        updated_at: l.updated_at,
        employee_username: (l.users as any)?.username || 'employee',
        employee_name: (l.users as any)?.full_name,
        employee_email: (l.users as any)?.company_email
      }));
    }
  } catch (err) {
    console.warn('Note on public.leave_requests getLeavesByEmployeeId:', err);
  }

  // 2. Query Supabase Auth user_metadata
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to fetch leaves for employee ${employee_id}: ${listError.message}`);
  }

  const user = (listData.users || []).find((u: any) => {
    const numId = u.user_metadata?.numeric_id || stringToNumericId(u.id);
    return numId === employee_id;
  });

  if (!user) return [];

  const { username, fullName, companyEmail } = extractCleanUserFields(user);
  const leaves: LeaveRequestRecord[] = user.user_metadata?.leaves || [];
  return leaves.map(l => ({
    ...l,
    leave_reason: l.leave_reason || l.reason || '',
    reason: l.leave_reason || l.reason || '',
    employee_username: username,
    employee_name: fullName,
    employee_email: companyEmail
  }));
}

export async function getAllLeaves(filters?: { status?: string; search?: string }): Promise<LeaveRequestRecord[]> {
  const supabase = getSupabaseClient();

  // 1. Try public.leave_requests table
  try {
    let query = supabase
      .from('leave_requests')
      .select('*, users(username, full_name, company_email)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    const { data: dbLeaves, error } = await query;

    if (!error && dbLeaves && dbLeaves.length > 0) {
      let result = dbLeaves.map(l => ({
        id: l.id,
        employee_id: l.employee_id,
        leave_type: l.leave_type || 'General Leave',
        leave_reason: l.leave_reason,
        reason: l.leave_reason,
        start_date: l.start_date,
        end_date: l.end_date,
        approved_start_date: l.approved_start_date || null,
        approved_end_date: l.approved_end_date || null,
        duration: l.duration || 1,
        document_url: l.document_url,
        status: l.status,
        remarks: l.manager_remarks || l.remarks || null,
        manager_remarks: l.manager_remarks || l.remarks || null,
        notification_read: l.notification_read,
        created_at: l.created_at,
        updated_at: l.updated_at,
        employee_username: (l.users as any)?.username || 'employee',
        employee_name: (l.users as any)?.full_name,
        employee_email: (l.users as any)?.company_email
      }));

      if (filters?.search) {
        const s = filters.search.toLowerCase().trim();
        result = result.filter(
          l =>
            (l.leave_reason || '').toLowerCase().includes(s) ||
            (l.employee_username || '').toLowerCase().includes(s) ||
            (l.employee_name || '').toLowerCase().includes(s) ||
            (l.employee_email || '').toLowerCase().includes(s)
        );
      }

      return result;
    }
  } catch (err) {
    console.warn('Note on public.leave_requests getAllLeaves:', err);
  }

  // 2. Query Supabase Auth users
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to fetch leave requests from Supabase: ${listError.message}`);
  }

  let allLeaves: LeaveRequestRecord[] = [];

  (listData.users || []).forEach((u: any) => {
    const { username, fullName, companyEmail } = extractCleanUserFields(u);
    const userLeaves: LeaveRequestRecord[] = u.user_metadata?.leaves || [];
    userLeaves.forEach(l => {
      allLeaves.push({
        ...l,
        leave_reason: l.leave_reason || l.reason || '',
        reason: l.leave_reason || l.reason || '',
        employee_username: username,
        employee_name: fullName,
        employee_email: companyEmail
      });
    });
  });

  if (filters?.status && filters.status !== 'All') {
    allLeaves = allLeaves.filter(l => l.status === filters.status);
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase().trim();
    allLeaves = allLeaves.filter(
      l =>
        (l.leave_reason || '').toLowerCase().includes(s) ||
        (l.employee_username || '').toLowerCase().includes(s) ||
        (l.employee_name || '').toLowerCase().includes(s) ||
        (l.employee_email || '').toLowerCase().includes(s)
    );
  }

  allLeaves.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return allLeaves;
}

export async function getLeaveById(id: number): Promise<LeaveRequestRecord | null> {
  const leaves = await getAllLeaves();
  return leaves.find(l => l.id === id) || null;
}

export async function updateLeaveStatus(
  id: number,
  status: 'Approved' | 'Partially Approved' | 'Rejected' | 'Pending',
  remarks?: string | null,
  approved_start_date?: string | null,
  approved_end_date?: string | null
): Promise<LeaveRequestRecord | null> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const updateFields: any = {
    status,
    manager_remarks: remarks ? remarks.trim() : null,
    notification_read: 0,
    updated_at: now
  };
  if (approved_start_date) updateFields.approved_start_date = approved_start_date;
  if (approved_end_date) updateFields.approved_end_date = approved_end_date;

  // 1. Try public.leave_requests
  try {
    let { data, error } = await supabase
      .from('leave_requests')
      .update(updateFields)
      .eq('id', id)
      .select('*, users(username, full_name, company_email)')
      .maybeSingle();

    if (error && error.code === '42703') {
      delete updateFields.approved_start_date;
      delete updateFields.approved_end_date;
      const retryRes = await supabase
        .from('leave_requests')
        .update(updateFields)
        .eq('id', id)
        .select('*, users(username, full_name, company_email)')
        .maybeSingle();
      data = retryRes.data;
    }

    if (data) {
      return {
        id: data.id,
        employee_id: data.employee_id,
        leave_type: data.leave_type || 'General Leave',
        leave_reason: data.leave_reason,
        reason: data.leave_reason,
        start_date: data.start_date,
        end_date: data.end_date,
        approved_start_date: approved_start_date || data.approved_start_date || null,
        approved_end_date: approved_end_date || data.approved_end_date || null,
        duration: data.duration || 1,
        document_url: data.document_url,
        status: data.status,
        remarks: data.manager_remarks,
        manager_remarks: data.manager_remarks,
        notification_read: data.notification_read,
        created_at: data.created_at,
        updated_at: data.updated_at,
        employee_username: (data.users as any)?.username || 'employee',
        employee_name: (data.users as any)?.full_name,
        employee_email: (data.users as any)?.company_email
      };
    }
  } catch (err) {
    console.warn('Note on public.leave_requests updateLeaveStatus:', err);
  }

  // 2. Query Supabase Auth users and update user_metadata
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to update leave status in Supabase: ${listError.message}`);
  }

  for (const user of listData.users || []) {
    const userLeaves: LeaveRequestRecord[] = user.user_metadata?.leaves || [];
    const leaveIndex = userLeaves.findIndex(l => l.id === id);

    if (leaveIndex !== -1) {
      const updatedLeave: LeaveRequestRecord = {
        ...userLeaves[leaveIndex],
        status,
        approved_start_date: approved_start_date || userLeaves[leaveIndex].approved_start_date || null,
        approved_end_date: approved_end_date || userLeaves[leaveIndex].approved_end_date || null,
        remarks: remarks ? remarks.trim() : null,
        manager_remarks: remarks ? remarks.trim() : null,
        notification_read: 0,
        updated_at: now
      };

      userLeaves[leaveIndex] = updatedLeave;

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          leaves: userLeaves
        }
      });

      return updatedLeave;
    }
  }

  return null;
}

export async function getUnreadNotifications(employee_id: number): Promise<LeaveRequestRecord[]> {
  const leaves = await getLeavesByEmployeeId(employee_id);
  return leaves.filter(
    l => l.notification_read === 0 && (l.status === 'Approved' || l.status === 'Partially Approved' || l.status === 'Rejected')
  );
}

export async function markNotificationsRead(employee_id: number): Promise<boolean> {
  const supabase = getSupabaseClient();

  // 1. Try public.leave_requests
  try {
    await supabase
      .from('leave_requests')
      .update({ notification_read: 1 })
      .eq('employee_id', employee_id);
  } catch (err) {
    console.warn('Note on public.leave_requests markNotificationsRead:', err);
  }

  // 2. Update Supabase Auth user_metadata
  const { data: listData } = await supabase.auth.admin.listUsers();
  if (listData) {
    const user = (listData.users || []).find((u: any) => {
      const numId = u.user_metadata?.numeric_id || stringToNumericId(u.id);
      return numId === employee_id;
    });

    if (user && Array.isArray(user.user_metadata?.leaves)) {
      const updatedLeaves = user.user_metadata.leaves.map((l: LeaveRequestRecord) => ({
        ...l,
        notification_read: 1
      }));

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          leaves: updatedLeaves
        }
      });
    }
  }

  return true;
}

export async function deleteLeaveRequest(id: number): Promise<boolean> {
  const supabase = getSupabaseClient();

  // 1. Try public.leave_requests
  try {
    await supabase.from('leave_requests').delete().eq('id', id);
  } catch (err) {
    console.warn('Note on public.leave_requests deleteLeaveRequest:', err);
  }

  // 2. Update Supabase Auth user_metadata
  const { data: listData } = await supabase.auth.admin.listUsers();
  if (listData) {
    for (const user of listData.users || []) {
      const userLeaves: LeaveRequestRecord[] = user.user_metadata?.leaves || [];
      const filtered = userLeaves.filter(l => l.id !== id);
      if (filtered.length !== userLeaves.length) {
        await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            leaves: filtered
          }
        });
        return true;
      }
    }
  }

  return true;
}

export async function getAllEmployeesWithStats(search?: string) {
  const supabase = getSupabaseClient();

  // 1. Try public.users and public.leave_requests
  try {
    let userQuery = supabase.from('users').select('*').eq('role', 'employee');
    const { data: dbUsers, error } = await userQuery;

    if (!error && dbUsers && dbUsers.length > 0) {
      let filteredUsers = dbUsers;
      if (search) {
        const s = search.toLowerCase().trim();
        filteredUsers = dbUsers.filter(
          u =>
            (u.company_email || '').toLowerCase().includes(s) ||
            (u.username || '').toLowerCase().includes(s) ||
            (u.full_name || '').toLowerCase().includes(s)
        );
      }

      const allLeaves = await getAllLeaves();

      return filteredUsers.map(e => {
        const leaves = allLeaves.filter(l => l.employee_id === e.id);
        return {
          id: e.id,
          username: e.username,
          fullName: e.full_name,
          companyEmail: e.company_email,
          role: 'employee' as const,
          created_at: e.created_at,
          total_leaves: leaves.length,
          pending_leaves: leaves.filter(l => l.status === 'Pending').length,
          approved_leaves: leaves.filter(l => l.status === 'Approved').length,
          rejected_leaves: leaves.filter(l => l.status === 'Rejected').length,
          leaves
        };
      });
    }
  } catch (err) {
    console.warn('Note on public.users getAllEmployeesWithStats:', err);
  }

  // 2. Query Supabase Auth users
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to fetch employees from Supabase: ${listError.message}`);
  }

  let employees = (listData.users || []).filter((u: any) => {
    const uEmail = (u.email || u.user_metadata?.company_email || '').toLowerCase();
    const uRole = u.user_metadata?.role;
    return uRole !== 'manager' && uEmail !== 'manager@zollid.in' && uEmail !== 'manager@gcu.in';
  });

  if (search) {
    const s = search.toLowerCase().trim();
    employees = employees.filter(
      (u: any) =>
        (u.email || u.user_metadata?.company_email || '').toLowerCase().includes(s) ||
        (u.user_metadata?.username || '').toLowerCase().includes(s) ||
        (u.user_metadata?.full_name || '').toLowerCase().includes(s)
    );
  }

  return employees.map((e: any) => {
    const { username, fullName, companyEmail } = extractCleanUserFields(e);
    const rawLeaves: LeaveRequestRecord[] = e.user_metadata?.leaves || [];
    const leaves = rawLeaves.map(l => ({
      ...l,
      employee_username: username,
      employee_name: fullName,
      employee_email: companyEmail
    }));
    const numId = e.user_metadata?.numeric_id || stringToNumericId(e.id);

    return {
      id: numId,
      username,
      fullName,
      companyEmail,
      role: 'employee' as const,
      created_at: e.created_at,
      total_leaves: leaves.length,
      pending_leaves: leaves.filter(l => l.status === 'Pending').length,
      approved_leaves: leaves.filter(l => l.status === 'Approved').length,
      rejected_leaves: leaves.filter(l => l.status === 'Rejected').length,
      leaves
    };
  });
}

export async function initDatabase() {
  const zollidManagerEmail = 'manager@zollid.in';
  const legacyManagerEmail = 'manager@gcu.in';
  const supabase = getSupabaseClient();

  try {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const users = listData?.users || [];

    // 1. ZOLLID Manager Account
    const zollidPassword = process.env.ZOLLID_MANAGER_PASSWORD || 'Manager@Zollid2026!';
    const zollidHash = bcrypt.hashSync(zollidPassword, 10);
    let zollidAuthUser = users.find((u: any) =>
      u.email === zollidManagerEmail ||
      u.user_metadata?.company_email === zollidManagerEmail ||
      u.user_metadata?.username === 'manager'
    );

    if (!zollidAuthUser) {
      const numericId = stringToNumericId('manager_zollid');
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: zollidManagerEmail,
        password: zollidPassword,
        user_metadata: {
          username: 'manager',
          full_name: 'ZOLLID Manager',
          company_email: zollidManagerEmail,
          role: 'manager',
          password_hash: zollidHash,
          numeric_id: numericId
        },
        email_confirm: true
      });
      if (created?.user) zollidAuthUser = created.user;
      if (createErr) console.warn('Note creating ZOLLID manager Auth:', createErr.message);
    } else {
      await supabase.auth.admin.updateUserById(zollidAuthUser.id, {
        password: zollidPassword,
        user_metadata: {
          ...zollidAuthUser.user_metadata,
          username: 'manager',
          full_name: 'ZOLLID Manager',
          company_email: zollidManagerEmail,
          role: 'manager',
          password_hash: zollidHash
        }
      });
    }

    const { data: zollidDbUser } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.manager,company_email.eq.${zollidManagerEmail}`)
      .maybeSingle();

    if (!zollidDbUser) {
      await supabase.from('users').insert([{
        auth_user_id: zollidAuthUser?.id || null,
        full_name: 'ZOLLID Manager',
        username: 'manager',
        company_email: zollidManagerEmail,
        role: 'manager'
      }]);
    } else if (zollidAuthUser?.id && !zollidDbUser.auth_user_id) {
      await supabase.from('users').update({ auth_user_id: zollidAuthUser.id }).eq('id', zollidDbUser.id);
    }

    // 2. Legacy GCU Manager Account
    const legacyPassword = 'Manager@123';
    const legacyHash = bcrypt.hashSync(legacyPassword, 10);
    let legacyAuthUser = users.find((u: any) =>
      u.email === legacyManagerEmail ||
      u.user_metadata?.company_email === legacyManagerEmail ||
      u.user_metadata?.username === 'manager_gcu'
    );

    if (!legacyAuthUser) {
      const numericId = stringToNumericId('manager_gcu');
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: legacyManagerEmail,
        password: legacyPassword,
        user_metadata: {
          username: 'manager_gcu',
          full_name: 'GCU Manager',
          company_email: legacyManagerEmail,
          role: 'manager',
          password_hash: legacyHash,
          numeric_id: numericId
        },
        email_confirm: true
      });
      if (created?.user) legacyAuthUser = created.user;
      if (createErr) console.warn('Note creating legacy manager Auth:', createErr.message);
    } else {
      await supabase.auth.admin.updateUserById(legacyAuthUser.id, {
        password: legacyPassword,
        user_metadata: {
          ...legacyAuthUser.user_metadata,
          username: 'manager_gcu',
          full_name: 'GCU Manager',
          company_email: legacyManagerEmail,
          role: 'manager',
          password_hash: legacyHash
        }
      });
    }

    const { data: legacyDbUser } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.manager_gcu,company_email.eq.${legacyManagerEmail}`)
      .maybeSingle();

    if (!legacyDbUser) {
      await supabase.from('users').insert([{
        auth_user_id: legacyAuthUser?.id || null,
        full_name: 'GCU Manager',
        username: 'manager_gcu',
        company_email: legacyManagerEmail,
        role: 'manager'
      }]);
    } else if (legacyAuthUser?.id && !legacyDbUser.auth_user_id) {
      await supabase.from('users').update({ auth_user_id: legacyAuthUser.id }).eq('id', legacyDbUser.id);
    }

    console.log('Successfully initialized manager accounts in Supabase Auth & public.users table.');
  } catch (err: any) {
    console.warn('Database initialization note:', err.message || err);
  }
}

export async function verifyEmployeeAccount(
  usernameInput: string,
  companyEmailInput: string
): Promise<{ success: boolean; message: string }> {
  const trimmedUsername = usernameInput.trim().toLowerCase();
  const trimmedEmail = companyEmailInput.trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (!trimmedUsername || !trimmedEmail) {
    return {
      success: false,
      message: 'Both Username and Company Email are required.'
    };
  }

  // Security check: Manager accounts must NOT be reset through this page
  if (
    trimmedUsername === 'manager' ||
    trimmedUsername === 'manager_gcu' ||
    trimmedUsername.includes('manager') ||
    trimmedEmail === 'manager@zollid.in' ||
    trimmedEmail === 'manager@gcu.in' ||
    trimmedEmail.includes('manager')
  ) {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  // 1. Check in public.users table
  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .ilike('username', trimmedUsername)
      .ilike('company_email', trimmedEmail)
      .maybeSingle();

    if (dbUser) {
      if (dbUser.role === 'manager') {
        return {
          success: false,
          message: 'The provided information does not match any employee account.'
        };
      }
      return {
        success: true,
        message: 'Account verified successfully.'
      };
    }
  } catch (err) {
    console.warn('Note checking public.users for verifyEmployeeAccount:', err);
  }

  // 2. Check in Supabase Auth listUsers
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing users for verification:', listErr);
    return {
      success: false,
      message: 'Database error verifying employee account.'
    };
  }

  const user = (listData.users || []).find((u: any) => {
    const meta = u.user_metadata || {};
    const uName = (meta.username || '').trim().toLowerCase();
    const cleanUName = uName.includes('@') ? uName.split('@')[0] : uName;
    const uEmail = (u.email || meta.company_email || '').trim().toLowerCase();

    const matchesUsername = uName === trimmedUsername || cleanUName === trimmedUsername;
    const matchesEmail = uEmail === trimmedEmail;

    return matchesUsername && matchesEmail;
  });

  if (!user) {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  const role = user.user_metadata?.role || 'employee';
  if (role === 'manager' || user.email === 'manager@zollid.in' || user.email === 'manager@gcu.in') {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  return {
    success: true,
    message: 'Account verified successfully.'
  };
}

export async function resetEmployeePassword(
  usernameInput: string,
  companyEmailInput: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const trimmedUsername = usernameInput.trim().toLowerCase();
  const trimmedEmail = companyEmailInput.trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (!trimmedUsername || !trimmedEmail || !newPassword) {
    return {
      success: false,
      message: 'Username, Company Email, and New Password are required.'
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.'
    };
  }

  // Security check: Manager accounts must NOT be reset through this page
  if (
    trimmedUsername === 'manager' ||
    trimmedUsername === 'manager_gcu' ||
    trimmedUsername.includes('manager') ||
    trimmedEmail === 'manager@zollid.in' ||
    trimmedEmail === 'manager@gcu.in' ||
    trimmedEmail.includes('manager')
  ) {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  // Find user in Supabase Auth listUsers
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  let authUser = (listData?.users || []).find((u: any) => {
    const meta = u.user_metadata || {};
    const uName = (meta.username || '').trim().toLowerCase();
    const cleanUName = uName.includes('@') ? uName.split('@')[0] : uName;
    const uEmail = (u.email || meta.company_email || '').trim().toLowerCase();

    const matchesUsername = uName === trimmedUsername || cleanUName === trimmedUsername;
    const matchesEmail = uEmail === trimmedEmail;

    return matchesUsername && matchesEmail;
  });

  let targetAuthUserId: string | null = authUser?.id || null;
  let targetEmail: string = authUser?.email || trimmedEmail;
  let targetRole: string = authUser?.user_metadata?.role || 'employee';

  // Also check public.users
  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .ilike('username', trimmedUsername)
    .ilike('company_email', trimmedEmail)
    .maybeSingle();

  if (dbUser) {
    if (dbUser.role === 'manager') {
      return {
        success: false,
        message: 'The provided information does not match any employee account.'
      };
    }
    if (dbUser.auth_user_id) {
      targetAuthUserId = dbUser.auth_user_id;
    }
    targetEmail = dbUser.company_email || trimmedEmail;
    targetRole = dbUser.role || 'employee';
  }

  if (targetRole === 'manager') {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  if (!authUser && !dbUser) {
    return {
      success: false,
      message: 'The provided information does not match any employee account.'
    };
  }

  const newHashedPassword = bcrypt.hashSync(newPassword, 10);

  // Update password in Supabase Auth using service_role key
  if (targetAuthUserId) {
    const existingMeta = authUser?.user_metadata || {};
    const { error: updateErr } = await supabase.auth.admin.updateUserById(targetAuthUserId, {
      password: newPassword,
      user_metadata: {
        ...existingMeta,
        username: trimmedUsername,
        company_email: trimmedEmail,
        password_hash: newHashedPassword,
        password: newHashedPassword
      }
    });

    if (updateErr) {
      console.error('Error updating user password in Supabase Auth:', updateErr);
      return {
        success: false,
        message: `Failed to update password: ${updateErr.message}`
      };
    }
  } else {
    // If auth user wasn't directly found by ID, update or create via auth admin
    const { data: updated, error: updateErr } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: newPassword,
      user_metadata: {
        username: trimmedUsername,
        company_email: trimmedEmail,
        password_hash: newHashedPassword,
        role: 'employee'
      },
      email_confirm: true
    });

    if (updateErr) {
      console.error('Error updating auth password:', updateErr);
      return {
        success: false,
        message: `Failed to update password: ${updateErr.message}`
      };
    }

    if (updated?.user?.id && dbUser) {
      await supabase
        .from('users')
        .update({ auth_user_id: updated.user.id })
        .eq('id', dbUser.id);
    }
  }

  return {
    success: true,
    message: 'Your password has been updated successfully. Please sign in with your new password.'
  };
}

export async function updateUserProfileInDb(
  userId: number,
  fullName: string,
  username: string,
  companyEmail: string
): Promise<UserRecord> {
  const trimmedFullName = fullName.trim();
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = companyEmail.trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (!trimmedFullName || !trimmedUsername || !trimmedEmail) {
    throw new Error('Full Name, Username, and Company Email are required.');
  }

  // Check duplicate username for other users
  const existingUsername = await findUserByUsername(trimmedUsername);
  if (existingUsername && existingUsername.id !== userId) {
    throw new Error(`Username '${trimmedUsername}' is already taken by another account.`);
  }

  // Check duplicate email for other users
  const existingEmail = await findUserByEmail(trimmedEmail);
  if (existingEmail && existingEmail.id !== userId) {
    throw new Error(`Company email '${trimmedEmail}' is already registered to another account.`);
  }

  // 1. Update public.users table
  try {
    await supabase
      .from('users')
      .update({
        full_name: trimmedFullName,
        username: trimmedUsername,
        company_email: trimmedEmail
      })
      .eq('id', userId);
  } catch (err) {
    console.warn('Note updating public.users for updateUserProfileInDb:', err);
  }

  // 2. Update Supabase Auth user_metadata if auth user exists
  const currentUser = await findUserById(userId);
  if (currentUser?.auth_user_id) {
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(currentUser.auth_user_id);
      if (authData?.user) {
        await supabase.auth.admin.updateUserById(currentUser.auth_user_id, {
          email: trimmedEmail,
          user_metadata: {
            ...authData.user.user_metadata,
            full_name: trimmedFullName,
            username: trimmedUsername,
            company_email: trimmedEmail
          }
        });
      }
    } catch (authErr) {
      console.warn('Note updating Supabase auth metadata:', authErr);
    }
  }

  const updatedUser = await findUserById(userId);
  if (!updatedUser) {
    throw new Error('Failed to retrieve updated user profile.');
  }

  return updatedUser;
}

export async function changeUserPasswordInDb(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();

  if (!currentPassword || !newPassword) {
    throw new Error('Current Password and New Password are required.');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User account not found.');
  }

  // Find user password in DB or Auth
  let savedPasswordHash = user.password;
  if (!savedPasswordHash && user.auth_user_id) {
    const { data: authData } = await supabase.auth.admin.getUserById(user.auth_user_id);
    if (authData?.user) {
      savedPasswordHash = authData.user.user_metadata?.password_hash || authData.user.user_metadata?.password;
    }
  }

  // Verify current password if available
  if (savedPasswordHash) {
    const isMatch = bcrypt.compareSync(currentPassword, savedPasswordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect. Please try again.');
    }
  }

  const newHashedPassword = bcrypt.hashSync(newPassword, 10);

  // Update in public.users if column exists
  try {
    await supabase
      .from('users')
      .update({ password: newHashedPassword })
      .eq('id', userId);
  } catch (err) {
    // Ignore if column is absent
  }

  // Update in Supabase Auth user_metadata and password
  if (user.auth_user_id) {
    const { data: authData } = await supabase.auth.admin.getUserById(user.auth_user_id);
    const meta = authData?.user?.user_metadata || {};
    await supabase.auth.admin.updateUserById(user.auth_user_id, {
      password: newPassword,
      user_metadata: {
        ...meta,
        password_hash: newHashedPassword,
        password: newHashedPassword
      }
    });
  }

  return {
    success: true,
    message: 'Password updated successfully.'
  };
}

// ==========================================
// NEW TABLES SEEDERS AND GETTER FUNCTIONS
// ==========================================

const DEFAULT_LEAVE_TYPES: LeaveTypeRecord[] = [
  { id: 1, code: 'Annual', name: 'Annual Leave', max_days_per_year: 20, description: 'Paid time off for vacation or personal rest', requires_proof: false, color_code: '#3B82F6' },
  { id: 2, code: 'Sick', name: 'Sick Leave', max_days_per_year: 12, description: 'Medical treatment, illness, or doctor appointments', requires_proof: true, color_code: '#EF4444' },
  { id: 3, code: 'Casual', name: 'Casual Leave', max_days_per_year: 10, description: 'Short-notice personal tasks or family matters', requires_proof: false, color_code: '#F59E0B' },
  { id: 4, code: 'Emergency', name: 'Emergency Leave', max_days_per_year: 5, description: 'Unforeseen urgent events or family emergencies', requires_proof: true, color_code: '#8B5CF6' },
  { id: 5, code: 'Maternity', name: 'Maternity / Paternity Leave', max_days_per_year: 180, description: 'Parental leave for childbirth or adoption support', requires_proof: true, color_code: '#EC4899' },
  { id: 6, code: 'Unpaid', name: 'Loss of Pay (LOP)', max_days_per_year: 30, description: 'Unpaid extended leave approved beyond standard quota', requires_proof: false, color_code: '#6B7280' }
];

const DEFAULT_COMPANY_HOLIDAYS: CompanyHolidayRecord[] = [
  { id: 1, holiday_name: "New Year's Day", holiday_date: '2026-01-01', day_of_week: 'Thursday', type: 'National', description: 'Global New Year Celebration' },
  { id: 2, holiday_name: 'Republic Day', holiday_date: '2026-01-26', day_of_week: 'Monday', type: 'National', description: 'National Republic Day Holiday' },
  { id: 3, holiday_name: 'Good Friday', holiday_date: '2026-04-03', day_of_week: 'Friday', type: 'Festival', description: 'Good Friday Observance' },
  { id: 4, holiday_name: 'May Day / Labour Day', holiday_date: '2026-05-01', day_of_week: 'Friday', type: 'Company Holiday', description: 'International Workers Day' },
  { id: 5, holiday_name: 'Independence Day', holiday_date: '2026-08-15', day_of_week: 'Saturday', type: 'National', description: 'National Independence Day' },
  { id: 6, holiday_name: 'Gandhi Jayanti', holiday_date: '2026-10-02', day_of_week: 'Friday', type: 'National', description: 'Mahatma Gandhi Birth Anniversary' },
  { id: 7, holiday_name: 'Diwali / Deepavali', holiday_date: '2026-11-08', day_of_week: 'Sunday', type: 'Festival', description: 'Festival of Lights' },
  { id: 8, holiday_name: 'Christmas Day', holiday_date: '2026-12-25', day_of_week: 'Friday', type: 'Festival', description: 'Christmas Celebration' }
];

const DEFAULT_DEPARTMENTS: DepartmentRecord[] = [
  { id: 1, code: 'ENG', name: 'Software Engineering', manager_name: 'ZOLLID Manager', total_employees: 18, description: 'Core product engineering and technology infrastructure' },
  { id: 2, code: 'HR', name: 'Human Resources', manager_name: 'GCU Manager', total_employees: 6, description: 'Talent acquisition, employee welfare, and leave management' },
  { id: 3, code: 'PD', name: 'Product & Design', manager_name: 'ZOLLID Manager', total_employees: 8, description: 'User experience, product strategy, and visual design' },
  { id: 4, code: 'SM', name: 'Sales & Marketing', manager_name: 'GCU Manager', total_employees: 12, description: 'Business development, client relationships, and marketing' },
  { id: 5, code: 'FO', name: 'Finance & Operations', manager_name: 'ZOLLID Manager', total_employees: 5, description: 'Payroll, financial planning, and enterprise ops' }
];

const DEFAULT_POLICIES: CompanyPolicyRecord[] = [
  { id: 1, title: 'Annual Leave Quota & Application Window', category: 'Leave Quota', content: 'Employees receive 20 days of paid annual leave per calendar year. Leave applications exceeding 3 consecutive days must be submitted at least 5 business days in advance.', effective_date: '2026-01-01' },
  { id: 2, title: 'Sick Leave & Medical Certificate Requirements', category: 'Sick Leave', content: 'Medical certificates issued by a certified healthcare professional are mandatory for sick leave applications extending beyond 2 consecutive days.', effective_date: '2026-01-01' },
  { id: 3, title: 'Year-End Carry Forward Policy', category: 'Carry Forward', content: 'Up to 5 unused annual leave days can be carried forward into the next calendar year. Carried forward leave must be utilized by Q1.', effective_date: '2026-01-01' },
  { id: 4, title: 'Notice Period for Emergency Leave', category: 'Emergency Leave', content: 'In emergency situations, leave must be reported to line manager or submitted via the portal within 24 hours of absence start date.', effective_date: '2026-01-01' }
];

export async function getLeaveTypesFromDb(): Promise<LeaveTypeRecord[]> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('leave_types').select('*').order('id', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as LeaveTypeRecord[];
    }
    if (!error && data && data.length === 0) {
      // Auto-seed into Supabase
      await supabase.from('leave_types').upsert(DEFAULT_LEAVE_TYPES, { onConflict: 'code' });
      const { data: seededData } = await supabase.from('leave_types').select('*').order('id', { ascending: true });
      if (seededData && seededData.length > 0) {
        return seededData as LeaveTypeRecord[];
      }
    }
  } catch (err) {
    console.warn('Note on fetching leave_types table:', err);
  }
  return DEFAULT_LEAVE_TYPES;
}

export async function getCompanyHolidaysFromDb(): Promise<CompanyHolidayRecord[]> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('company_holidays').select('*').order('holiday_date', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as CompanyHolidayRecord[];
    }
    if (!error && data && data.length === 0) {
      // Auto-seed into Supabase
      await supabase.from('company_holidays').upsert(DEFAULT_COMPANY_HOLIDAYS, { onConflict: 'id' });
      const { data: seededData } = await supabase.from('company_holidays').select('*').order('holiday_date', { ascending: true });
      if (seededData && seededData.length > 0) {
        return seededData as CompanyHolidayRecord[];
      }
    }
  } catch (err) {
    console.warn('Note on fetching company_holidays table:', err);
  }
  return DEFAULT_COMPANY_HOLIDAYS;
}

export async function getDepartmentsFromDb(): Promise<DepartmentRecord[]> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('departments').select('*').order('id', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as DepartmentRecord[];
    }
    if (!error && data && data.length === 0) {
      // Auto-seed into Supabase
      await supabase.from('departments').upsert(DEFAULT_DEPARTMENTS, { onConflict: 'code' });
      const { data: seededData } = await supabase.from('departments').select('*').order('id', { ascending: true });
      if (seededData && seededData.length > 0) {
        return seededData as DepartmentRecord[];
      }
    }
  } catch (err) {
    console.warn('Note on fetching departments table:', err);
  }
  return DEFAULT_DEPARTMENTS;
}

export async function getCompanyPoliciesFromDb(): Promise<CompanyPolicyRecord[]> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('company_policies').select('*').order('id', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as CompanyPolicyRecord[];
    }
    if (!error && data && data.length === 0) {
      // Auto-seed into Supabase
      await supabase.from('company_policies').upsert(DEFAULT_POLICIES, { onConflict: 'id' });
      const { data: seededData } = await supabase.from('company_policies').select('*').order('id', { ascending: true });
      if (seededData && seededData.length > 0) {
        return seededData as CompanyPolicyRecord[];
      }
    }
  } catch (err) {
    console.warn('Note on fetching company_policies table:', err);
  }
  return DEFAULT_POLICIES;
}

export async function getLeaveBalancesFromDb(userId: number): Promise<LeaveBalanceRecord[]> {
  // Fetch user's actual leaves from DB to calculate real balances dynamically
  const userLeaves = await getLeavesByEmployeeId(userId);
  const leaveTypes = await getLeaveTypesFromDb();

  const balances: LeaveBalanceRecord[] = leaveTypes.map((lt) => {
    const typeLeaves = userLeaves.filter(l => (l.leave_type || 'Annual').toLowerCase() === lt.code.toLowerCase() || (l.leave_type || '').toLowerCase().includes(lt.code.toLowerCase()));

    let usedDays = 0;
    let pendingDays = 0;

    typeLeaves.forEach((l) => {
      const s = l.approved_start_date || l.start_date;
      const e = l.approved_end_date || l.end_date;
      const d = l.duration || 1;

      if (l.status === 'Approved' || l.status === 'Partially Approved') {
        usedDays += d;
      } else if (l.status === 'Pending') {
        pendingDays += d;
      }
    });

    const remainingDays = Math.max(0, lt.max_days_per_year - usedDays);

    return {
      employee_id: userId,
      leave_type: lt.name,
      total_allowance: lt.max_days_per_year,
      used_days: usedDays,
      pending_days: pendingDays,
      remaining_days: remainingDays
    };
  });

  return balances;
}


