import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../hooks/useTheme.js';
import { leaveService } from '../../services/leaveService.js';
import { employeeService } from '../../services/employeeService.js';
import { LeaveRequest, LeaveStatus, User } from '../../types.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { ReviewRequestModal } from '../../components/common/ReviewRequestModal.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  UserCheck,
  UserX,
  Clock,
  FileText,
  CalendarDays,
  PartyPopper,
  Bookmark,
  Sparkles,
  Info,
  Layers,
  Briefcase,
  Edit3,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ManagerDayEvent {
  id: string;
  type: 'leave' | 'company_holiday' | 'optional_holiday';
  title: string;
  category: LeaveStatus | 'Company Holiday' | 'Optional Holiday';
  dateStr: string; // YYYY-MM-DD
  startDate: string;
  endDate: string;
  approvedStartDate?: string | null;
  approvedEndDate?: string | null;
  employeeId?: number;
  employeeName: string;
  employeeEmail?: string;
  leaveType?: string;
  leaveReason?: string;
  remarks?: string | null;
  documentUrl?: string | null;
  originalLeave?: LeaveRequest;
}

export const ManagerLeaveCalendar: React.FC = () => {
  const { isDark } = useTheme();

  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-${dd}`;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Document & Review Modals
  const [viewDocUrl, setViewDocUrl] = useState<string | null>(null);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leaveRes, empRes] = await Promise.all([
        leaveService.getAllLeaves(),
        employeeService.getAllEmployees()
      ]);

      if (leaveRes.success) {
        setLeaves(leaveRes.leaves);
      }
      if (empRes.success) {
        setEmployees(empRes.employees);
      }
    } catch (err) {
      console.error('Failed to load manager calendar data:', err);
      toast.error('Failed to update calendar dataset');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewSubmit = async (data: {
    id: number;
    status: LeaveStatus;
    remarks: string;
    approved_start_date?: string;
    approved_end_date?: string;
  }) => {
    try {
      const res = await leaveService.updateLeaveStatus(
        data.id,
        data.status,
        data.remarks,
        data.approved_start_date,
        data.approved_end_date
      );
      if (res.success) {
        toast.success(`Leave request #${data.id} updated to ${data.status}.`);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update leave request status.');
      throw err;
    }
  };

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newDate.getFullYear()}-${mm}-01`);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newDate.getFullYear()}-${mm}-01`);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${today.getFullYear()}-${mm}-${dd}`);
  };

  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

  // Predefined Holidays
  const getHolidaysForYear = (y: number): ManagerDayEvent[] => {
    const pad = (n: number) => String(n).padStart(2, '0');

    const companyHolidays = [
      { month: 1, day: 1, title: "New Year's Day" },
      { month: 1, day: 26, title: 'Republic Day' },
      { month: 5, day: 1, title: 'Labor Day' },
      { month: 8, day: 15, title: 'Independence Day' },
      { month: 10, day: 2, title: 'Gandhi Jayanti' },
      { month: 11, day: 8, title: 'Diwali' },
      { month: 12, day: 25, title: 'Christmas Day' }
    ];

    const optionalHolidays = [
      { month: 2, day: 15, title: 'Maha Shivratri' },
      { month: 3, day: 4, title: 'Holi' },
      { month: 3, day: 20, title: 'Eid-ul-Fitr' },
      { month: 3, day: 31, title: 'Mahavir Jayanti' },
      { month: 4, day: 3, title: 'Good Friday' },
      { month: 5, day: 31, title: 'Buddha Purnima' },
      { month: 8, day: 28, title: 'Raksha Bandhan' },
      { month: 11, day: 24, title: 'Guru Nanak Jayanti' }
    ];

    const events: ManagerDayEvent[] = [];

    companyHolidays.forEach((h) => {
      const dateStr = `${y}-${pad(h.month)}-${pad(h.day)}`;
      events.push({
        id: `hol-comp-${dateStr}`,
        type: 'company_holiday',
        title: h.title,
        category: 'Company Holiday',
        dateStr,
        startDate: dateStr,
        endDate: dateStr,
        employeeName: 'ZOLLID Organization'
      });
    });

    optionalHolidays.forEach((h) => {
      const dateStr = `${y}-${pad(h.month)}-${pad(h.day)}`;
      events.push({
        id: `hol-opt-${dateStr}`,
        type: 'optional_holiday',
        title: h.title,
        category: 'Optional Holiday',
        dateStr,
        startDate: dateStr,
        endDate: dateStr,
        employeeName: 'Optional Festival Holiday'
      });
    });

    return events;
  };

  // Flatten Leave Requests into daily events
  const leaveEvents = useMemo(() => {
    const events: ManagerDayEvent[] = [];

    leaves.forEach((leave) => {
      const { type, reason } = parseLeaveDetails(leave.leave_reason);
      const empName = leave.employee_name || leave.employee_username || 'Employee';

      // Filtering checks
      if (selectedEmployeeId !== 'All' && String(leave.employee_id) !== selectedEmployeeId) return;
      if (selectedStatus !== 'All' && leave.status !== selectedStatus) return;

      // Effective active date range for calendar grid
      const effectiveStart = (leave.status === 'Approved' || leave.status === 'Partially Approved') && leave.approved_start_date
        ? leave.approved_start_date
        : leave.start_date;
      const effectiveEnd = (leave.status === 'Approved' || leave.status === 'Partially Approved') && leave.approved_end_date
        ? leave.approved_end_date
        : leave.end_date;

      const start = new Date(effectiveStart);
      const end = new Date(effectiveEnd);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const curr = new Date(start);
        while (curr <= end) {
          const yyyy = curr.getFullYear();
          const mm = String(curr.getMonth() + 1).padStart(2, '0');
          const dd = String(curr.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          events.push({
            id: `mgr-leave-${leave.id}-${dateStr}`,
            type: 'leave',
            title: `${type} Leave`,
            category: leave.status,
            dateStr,
            startDate: leave.start_date,
            endDate: leave.end_date,
            approvedStartDate: leave.approved_start_date,
            approvedEndDate: leave.approved_end_date,
            employeeId: leave.employee_id,
            employeeName: empName,
            employeeEmail: leave.employee_email,
            leaveType: `${type} Leave`,
            leaveReason: reason,
            remarks: leave.remarks,
            documentUrl: leave.document_url,
            originalLeave: leave
          });

          curr.setDate(curr.getDate() + 1);
        }
      }
    });

    return events;
  }, [leaves, selectedEmployeeId, selectedStatus]);

  // Combined Events Map
  const allEventsMap = useMemo(() => {
    const map = new Map<string, ManagerDayEvent[]>();

    const holidays = [
      ...getHolidaysForYear(year - 1),
      ...getHolidaysForYear(year),
      ...getHolidaysForYear(year + 1)
    ];

    const combine = [...holidays, ...leaveEvents];

    combine.forEach((ev) => {
      const existing = map.get(ev.dateStr) || [];
      existing.push(ev);
      map.set(ev.dateStr, existing);
    });

    return map;
  }, [year, leaveEvents]);

  // Calendar Matrix Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev Month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const prevDateObj = new Date(year, month - 1, pDay);
      const dateStr = `${prevDateObj.getFullYear()}-${String(prevDateObj.getMonth() + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      const dayOfWeek = prevDateObj.getDay();
      days.push({
        dayNum: pDay,
        dateStr,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    // Current Month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = currDateObj.getDay();
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    // Next Month
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextDateObj = new Date(year, month + 1, n);
      const dateStr = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const dayOfWeek = nextDateObj.getDay();
      days.push({
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    return days;
  }, [year, month]);

  // Selected Date Information (for Right Panel)
  const selectedDayEvents = useMemo(() => {
    return allEventsMap.get(selectedDateStr) || [];
  }, [selectedDateStr, allEventsMap]);

  // Selected Day Breakdown Metrics
  const selectedDayLeaveEvents = useMemo(() => {
    return selectedDayEvents.filter((e) => e.type === 'leave');
  }, [selectedDayEvents]);

  const selectedDayHoliday = useMemo(() => {
    return selectedDayEvents.find((e) => e.type === 'company_holiday' || e.type === 'optional_holiday');
  }, [selectedDayEvents]);

  const totalEmployeesCount = employees.length || 12; // fallback total workforce
  const employeesOnLeaveCount = useMemo(() => {
    const uniqueLeaveEmps = new Set(
      selectedDayLeaveEvents
        .filter((e) => e.category === 'Approved' || e.category === 'Pending')
        .map((e) => e.employeeName)
    );
    return uniqueLeaveEmps.size;
  }, [selectedDayLeaveEvents]);

  const pendingRequestsCount = useMemo(() => {
    return selectedDayLeaveEvents.filter((e) => e.category === 'Pending').length;
  }, [selectedDayLeaveEvents]);

  const availableEmployeesCount = Math.max(0, totalEmployeesCount - employeesOnLeaveCount);

  // Upcoming Events in the Next 7 Days from Selected Date / Today
  const upcomingEventsThisWeek = useMemo(() => {
    const result: { dateStr: string; event: ManagerDayEvent }[] = [];
    const baseDate = new Date(selectedDateStr || new Date());
    if (isNaN(baseDate.getTime())) return [];

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setDate(futureDate.getDate() + i);
      const yyyy = futureDate.getFullYear();
      const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
      const dd = String(futureDate.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const dayEvs = allEventsMap.get(dateKey) || [];
      dayEvs.forEach((ev) => {
        result.push({ dateStr: dateKey, event: ev });
      });
    }

    return result.slice(0, 5); // top 5
  }, [selectedDateStr, allEventsMap]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Workforce Leave Calendar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-500 border border-blue-500/20">
                HR Manager Portal
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Plan team coverage, monitor employee availability, and manage organizational leave schedules
            </p>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={goToToday}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-[#33302C] hover:bg-[#3D3833] border-[#3D3833] text-stone-200'
                : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] border-[#E2DBD0] text-stone-800'
            }`}
          >
            Today
          </button>

          <div
            className={`flex items-center p-1 border rounded-xl ${
              isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
            }`}
          >
            <button
              type="button"
              onClick={prevMonth}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:scale-105 active:scale-95 ${
                isDark ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]' : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className={`p-2 rounded-lg transition-colors cursor-pointer hover:scale-105 active:scale-95 ${
                isDark ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]' : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee Filter */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              <Users className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
              Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs font-semibold border focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#3D3833] text-stone-200 focus:border-blue-500'
                  : 'bg-[#FFFDF9] border-[#E2DBD0] text-stone-800 focus:border-blue-600'
              }`}
            >
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.fullName || emp.username} ({emp.companyEmail || emp.username})
                </option>
              ))}
            </select>
          </div>

          {/* Leave Status Filter */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              <Filter className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
              Leave Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs font-semibold border focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#3D3833] text-stone-200 focus:border-blue-500'
                  : 'bg-[#FFFDF9] border-[#E2DBD0] text-stone-800 focus:border-blue-600'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">🟢 Approved Leaves</option>
              <option value="Partially Approved">🟦 Partially Approved</option>
              <option value="Pending">🟡 Pending Requests</option>
              <option value="Rejected">🔴 Rejected Requests</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-500/15 text-xs">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Status Indicators:
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Partially Approved
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Company Holiday
          </span>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
            isDark ? 'bg-[#22201D] text-stone-400 border-[#3D3833]' : 'bg-[#EAE2D3]/60 text-stone-600 border-[#E2DBD0]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-stone-400/60" /> Weekend (Sun/Sat)
          </span>
        </div>
      </div>

      {/* 70/30 Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT SIDE: 70% Width (7/10 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            <div className="overflow-x-auto pb-2">
              <motion.div
                key={`${year}-${month}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={`min-w-[640px] md:min-w-0 border rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${
                  isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
                }`}
              >
              {/* Days of week header */}
              <div
                className={`grid grid-cols-7 border-b text-center text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-[#22201D] border-[#3D3833] text-stone-400'
                    : 'bg-[#F8F4EC] border-[#E8E2D8] text-stone-600'
                }`}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dIdx) => (
                  <div
                    key={day}
                    className={`py-3 px-1 border-r last:border-r-0 border-stone-500/10 ${
                      dIdx === 0 || dIdx === 6
                        ? isDark
                          ? 'bg-[#1C1A18]/60 text-stone-500'
                          : 'bg-[#F3EFE8]/70 text-stone-500'
                        : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Day Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b text-xs divide-stone-500/15 border-stone-500/15">
                {calendarDays.map((cell, idx) => {
                  const dayEvs = allEventsMap.get(cell.dateStr) || [];
                  const isSelected = cell.dateStr === selectedDateStr;
                  const isToday = cell.dateStr === todayStr;

                  const approvedCount = dayEvs.filter((e) => e.category === 'Approved').length;
                  const partialCount = dayEvs.filter((e) => e.category === 'Partially Approved').length;
                  const pendingCount = dayEvs.filter((e) => e.category === 'Pending').length;
                  const rejectedCount = dayEvs.filter((e) => e.category === 'Rejected').length;
                  const holidayEv = dayEvs.find((e) => e.type === 'company_holiday' || e.type === 'optional_holiday');

                  const totalLeavesOnDay = dayEvs.filter((e) => e.type === 'leave').length;

                  // Subtle background tinting for selected, weekend, current month
                  let bgClass = '';
                  if (isSelected) {
                    bgClass = isDark
                      ? 'bg-blue-950/25 border-blue-500/30 text-stone-100 shadow-inner'
                      : 'bg-blue-50/70 border-blue-200 text-stone-900 shadow-inner';
                  } else if (!cell.isCurrentMonth) {
                    bgClass = isDark
                      ? 'bg-[#1D1B19]/50 text-stone-600'
                      : 'bg-stone-100/50 text-stone-400';
                  } else if (cell.isWeekend) {
                    bgClass = isDark
                      ? 'bg-[#22201D]/70 text-stone-300 hover:bg-[#2B2825]'
                      : 'bg-[#F2ECE1]/50 text-stone-800 hover:bg-[#EAE2D3]';
                  } else {
                    bgClass = isDark
                      ? 'bg-[#292623] text-stone-200 hover:bg-[#33302C]'
                      : 'bg-[#FCFAF7] text-stone-800 hover:bg-[#F4ECE1]';
                  }

                  return (
                    <div
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[110px] sm:min-h-[125px] p-2.5 sm:p-3 transition-all duration-200 flex flex-col justify-between cursor-pointer relative group hover:shadow-md hover:z-10 ${bgClass}`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-transform group-hover:scale-105 ${
                            isToday
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                              : isSelected
                              ? 'bg-blue-500/20 text-blue-500 font-extrabold border border-blue-500/30'
                              : cell.isCurrentMonth
                              ? isDark
                                ? 'text-stone-200'
                                : 'text-stone-800'
                              : 'text-stone-500'
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                      </div>

                      {/* Minimal Purple Indicator for Holiday & Status Dots */}
                      <div className="space-y-1.5 my-1">
                        {holidayEv && (
                          <div
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-colors ${
                              isDark
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                                : 'bg-purple-50 text-purple-700 border border-purple-200/80'
                            }`}
                            title={`Company Holiday: ${holidayEv.title}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_4px_rgba(168,85,247,0.6)]" />
                            <span>Holiday</span>
                          </div>
                        )}

                        {/* Minimal Glowing Dots for Leave Statuses (No numbers or count pills) */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {approvedCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0"
                              title={`${approvedCount} Approved Leave(s)`}
                            />
                          )}

                          {partialCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)] shrink-0"
                              title={`${partialCount} Partially Approved Leave(s)`}
                            />
                          )}

                          {pendingCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] shrink-0"
                              title={`${pendingCount} Pending Request(s)`}
                            />
                          )}

                          {rejectedCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)] shrink-0"
                              title={`${rejectedCount} Rejected Request(s)`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Subtle selection line indicator */}
                      {isSelected && (
                        <div className="h-0.5 w-full bg-blue-500/80 rounded-full mt-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
        </div>

        {/* RIGHT SIDE: 30% Width (3/10 Columns) - Daily Team Summary */}
        <div className="lg:col-span-3 space-y-6">
          {/* Daily Team Summary Panel */}
          <div
            className={`border rounded-2xl p-5 shadow-2xl space-y-5 transition-all duration-300 ${
              isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
            }`}
          >
            {/* Header Date Display */}
            <div className="border-b pb-4 border-stone-500/15">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">
                Selected Date Overview
              </span>
              <h3 className={`text-lg font-extrabold mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {formatDate(selectedDateStr)}
              </h3>

              {/* Holiday Alert Badge if selected date is holiday */}
              {selectedDayHoliday && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                    selectedDayHoliday.type === 'company_holiday'
                      ? isDark
                        ? 'bg-purple-950/50 border-purple-800/60 text-purple-300'
                        : 'bg-purple-50 border-purple-200 text-purple-900'
                      : isDark
                      ? 'bg-purple-900/30 border-purple-800/40 text-purple-300'
                      : 'bg-purple-50 border-purple-200 text-purple-800'
                  }`}
                >
                  <PartyPopper className="w-4 h-4 shrink-0 text-purple-400" />
                  <div className="truncate">
                    <span className="font-bold">{selectedDayHoliday.title}</span>
                    <span className="block text-[10px] opacity-80">{selectedDayHoliday.category}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Total Employees */}
              <div
                className={`p-3 rounded-xl border space-y-1 transition-all ${
                  isDark ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Staff</span>
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className={`text-lg font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {totalEmployeesCount}
                </p>
              </div>

              {/* Available Employees */}
              <div
                className={`p-3 rounded-xl border space-y-1 transition-all ${
                  isDark ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Available</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-lg font-extrabold text-emerald-500">{availableEmployeesCount}</p>
              </div>

              {/* Employees on Leave */}
              <div
                className={`p-3 rounded-xl border space-y-1 transition-all ${
                  isDark ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">On Leave</span>
                  <UserX className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-lg font-extrabold text-blue-500">{employeesOnLeaveCount}</p>
              </div>

              {/* Pending Requests */}
              <div
                className={`p-3 rounded-xl border space-y-1 transition-all ${
                  isDark ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Pending</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-lg font-extrabold text-amber-500">{pendingRequestsCount}</p>
              </div>
            </div>

            {/* Employees On Leave List */}
            <div className="space-y-3 pt-2">
              <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center justify-between ${
                isDark ? 'text-stone-300' : 'text-stone-700'
              }`}>
                <span>Employees on Leave</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                  {selectedDayLeaveEvents.length}
                </span>
              </h4>

              {selectedDayLeaveEvents.length === 0 ? (
                <div
                  className={`p-4 rounded-xl border text-center space-y-1 text-xs ${
                    isDark
                      ? 'bg-[#22201D]/60 border-[#38332E] text-stone-400'
                      : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-500'
                  }`}
                >
                  <UserCheck className="w-6 h-6 mx-auto opacity-50 text-emerald-500" />
                  <p className="font-semibold text-stone-300">No employees are on leave for the selected date.</p>
                  <p className="text-[11px] opacity-75">Full workforce available on this date.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {selectedDayLeaveEvents.map((ev) => {
                    const initials = (ev.employeeName || 'EM')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    const requestedDays = calculateDurationDays(ev.startDate, ev.endDate);
                    const approvedStart = ev.approvedStartDate || ev.startDate;
                    const approvedEnd = ev.approvedEndDate || ev.endDate;
                    const approvedDays = calculateDurationDays(approvedStart, approvedEnd);
                    const isEditedRange = ev.category === 'Partially Approved' || (ev.approvedStartDate && ev.approvedStartDate !== ev.startDate);

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-xl border space-y-2.5 transition-all hover:border-blue-500/30 ${
                          isDark ? 'bg-[#1E1C1A] border-[#3D3833]' : 'bg-[#FFFDF9] border-[#E2DBD0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                              {initials}
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                                {ev.employeeName}
                              </p>
                              {ev.employeeEmail && (
                                <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                  {ev.employeeEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          <LeaveStatusBadge status={ev.category as any} />
                        </div>

                        <div className="text-[11px] space-y-1.5 pt-1.5 border-t border-stone-500/10">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="font-semibold text-blue-400">{ev.leaveType}</span>
                            <span className="font-semibold text-stone-300">
                              {approvedDays} {approvedDays === 1 ? 'day' : 'days'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <p className={`text-[11px] font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                              <span className="text-stone-400 text-[10px]">Approved: </span>
                              {formatDate(approvedStart)} – {formatDate(approvedEnd)}
                            </p>

                            {isEditedRange && (
                              <p className="text-[10px] text-stone-400 line-through">
                                Requested: {formatDate(ev.startDate)} – {formatDate(ev.endDate)} ({requestedDays} days)
                              </p>
                            )}
                          </div>

                          {ev.leaveReason && (
                            <p className={`text-[11px] italic line-clamp-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                              "{ev.leaveReason}"
                            </p>
                          )}

                          {ev.remarks && (
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
                              <span className="font-bold">Manager Remarks: </span>
                              "{ev.remarks}"
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-stone-500/10">
                            {ev.documentUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewDocUrl(ev.documentUrl!)}
                                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Attachment</span>
                              </button>
                            ) : <div />}

                            {ev.originalLeave && (
                              <button
                                type="button"
                                onClick={() => setReviewRequest(ev.originalLeave!)}
                                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Review Request</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming This Week Card */}
          <div
            className={`border rounded-2xl p-5 shadow-xl space-y-3 transition-colors duration-300 ${
              isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
            }`}
          >
            <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 ${
              isDark ? 'text-stone-200' : 'text-stone-800'
            }`}>
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span>Upcoming This Week</span>
            </h4>

            {upcomingEventsThisWeek.length === 0 ? (
              <p className={`text-xs italic py-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                No upcoming leaves or holidays scheduled for the next 7 days.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEventsThisWeek.map(({ dateStr, event }) => (
                  <div
                    key={`${dateStr}-${event.id}`}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all hover:border-blue-500/30 ${
                      isDark ? 'bg-[#1E1C1A] border-[#3D3833]' : 'bg-[#FFFDF9] border-[#E2DBD0]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className={`font-bold truncate ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                        {event.employeeName}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        {event.title} • {formatDate(dateStr)}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        event.category === 'Approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : event.category === 'Pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {event.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewDocUrl}
        onClose={() => setViewDocUrl(null)}
        documentUrl={viewDocUrl}
      />

      {/* Review Leave Request Modal */}
      <ReviewRequestModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

