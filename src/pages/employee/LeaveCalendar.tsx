import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';
import { leaveService } from '../../services/leaveService.js';
import { LeaveRequest } from '../../types.js';
import { Modal } from '../../components/common/Modal.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Tag,
  FileText,
  MessageSquare,
  Filter,
  Info,
  CheckCircle2,
  XCircle,
  CalendarDays,
  User,
  PartyPopper,
  Bookmark
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  category: 'Company Holiday' | 'Optional Holiday' | 'Approved Leave' | 'Pending Leave' | 'Rejected Leave';
  dateStr: string; // YYYY-MM-DD
  startDate: string;
  endDate: string;
  type: string; // 'Company Holiday' | 'Optional Holiday' | 'Casual' | 'Sick' | 'Earned' | 'Unpaid' etc.
  status: 'Company Holiday' | 'Optional Holiday' | 'Approved' | 'Pending' | 'Rejected';
  leaveReason?: string;
  remarks?: string | null;
  documentUrl?: string | null;
  employeeName?: string;
}

export const LeaveCalendar: React.FC = () => {
  const { isDark } = useTheme();
  const { role, user } = useAuth();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Filter Chip: 'All' | 'Company Holidays' | 'Optional Holidays' | 'My Leaves' | 'Approved' | 'Pending' | 'Rejected'
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Company Holidays' | 'Optional Holidays' | 'My Leaves' | 'Approved' | 'Pending' | 'Rejected'
  >('All');

  // Selected Date Detail Modal
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  // Fetch Leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setIsLoading(true);
        let res;
        if (role === 'manager') {
          res = await leaveService.getAllLeaves();
        } else {
          res = await leaveService.getMyLeaves();
        }

        if (res.success) {
          setLeaves(res.leaves);
        }
      } catch (err) {
        console.error('Failed to load leave calendar data:', err);
        toast.error('Failed to load calendar data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaves();
  }, [role]);

  // Calendar Month Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to parse leave type prefix from reason string
  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

  // Generate Predefined Holidays for current year
  const getHolidaysForYear = (y: number): CalendarEvent[] => {
    const pad = (n: number) => String(n).padStart(2, '0');

    const companyHolidays: { month: number; day: number; title: string }[] = [
      { month: 1, day: 1, title: "New Year's Day" },
      { month: 1, day: 26, title: 'Republic Day' },
      { month: 5, day: 1, title: 'May Day / Labor Day' },
      { month: 8, day: 15, title: 'Independence Day' },
      { month: 10, day: 2, title: 'Gandhi Jayanti' },
      { month: 11, day: 8, title: 'Diwali (Deepavali)' },
      { month: 12, day: 25, title: 'Christmas Day' }
    ];

    const optionalHolidays: { month: number; day: number; title: string }[] = [
      { month: 2, day: 15, title: 'Maha Shivratri' },
      { month: 3, day: 4, title: 'Holi' },
      { month: 3, day: 20, title: 'Eid-ul-Fitr' },
      { month: 3, day: 31, title: 'Mahavir Jayanti' },
      { month: 4, day: 3, title: 'Good Friday' },
      { month: 5, day: 31, title: 'Buddha Purnima' },
      { month: 8, day: 28, title: 'Raksha Bandhan' },
      { month: 11, day: 24, title: 'Guru Nanak Jayanti' }
    ];

    const events: CalendarEvent[] = [];

    companyHolidays.forEach((h) => {
      const dateStr = `${y}-${pad(h.month)}-${pad(h.day)}`;
      events.push({
        id: `hol-company-${dateStr}`,
        title: h.title,
        category: 'Company Holiday',
        dateStr,
        startDate: dateStr,
        endDate: dateStr,
        type: 'Company Holiday',
        status: 'Company Holiday',
        leaveReason: 'Official Organization Holiday'
      });
    });

    optionalHolidays.forEach((h) => {
      const dateStr = `${y}-${pad(h.month)}-${pad(h.day)}`;
      events.push({
        id: `hol-opt-${dateStr}`,
        title: h.title,
        category: 'Optional Holiday',
        dateStr,
        startDate: dateStr,
        endDate: dateStr,
        type: 'Optional Holiday',
        status: 'Optional Holiday',
        leaveReason: 'Restricted / Optional Festival Holiday'
      });
    });

    return events;
  };

  // Convert Leave Requests to Calendar Events across date ranges
  const leaveEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    leaves.forEach((leave) => {
      const { type, reason } = parseLeaveDetails(leave.leave_reason);

      let cat: 'Approved Leave' | 'Pending Leave' | 'Rejected Leave' = 'Pending Leave';
      if (leave.status === 'Approved') cat = 'Approved Leave';
      if (leave.status === 'Rejected') cat = 'Rejected Leave';

      // Loop through all days in [start_date, end_date]
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const curr = new Date(start);
        while (curr <= end) {
          const yyyy = curr.getFullYear();
          const mm = String(curr.getMonth() + 1).padStart(2, '0');
          const dd = String(curr.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          events.push({
            id: `leave-${leave.id}-${dateStr}`,
            title: `${type} Leave: ${reason}`,
            category: cat,
            dateStr,
            startDate: leave.start_date,
            endDate: leave.end_date,
            type: `${type} Leave`,
            status: leave.status,
            leaveReason: reason,
            remarks: leave.remarks,
            documentUrl: leave.document_url,
            employeeName: leave.employee_name || leave.employee_username
          });

          curr.setDate(curr.getDate() + 1);
        }
      }
    });

    return events;
  }, [leaves]);

  // Combined List of Events for Current Year & Neighboring Years
  const allEventsMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

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

  // Filter Event Check
  const isEventMatchingFilter = (event: CalendarEvent) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Company Holidays') return event.category === 'Company Holiday';
    if (activeFilter === 'Optional Holidays') return event.category === 'Optional Holiday';
    if (activeFilter === 'My Leaves') {
      return (
        event.category === 'Approved Leave' ||
        event.category === 'Pending Leave' ||
        event.category === 'Rejected Leave'
      );
    }
    if (activeFilter === 'Approved') return event.category === 'Approved Leave';
    if (activeFilter === 'Pending') return event.category === 'Pending Leave';
    if (activeFilter === 'Rejected') return event.category === 'Rejected Leave';
    return true;
  };

  // Calendar Grid Matrix Construction
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous Month Padding Days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const prevDateObj = new Date(year, month - 1, pDay);
      const yyyy = prevDateObj.getFullYear();
      const mm = String(prevDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(pDay).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dayNum: pDay,
        dateStr,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current Month Days
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;

      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next Month Padding Days to complete 35 or 42 grid cells
    const remainingGridCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingGridCells; n++) {
      const nextDateObj = new Date(year, month + 1, n);
      const yyyy = nextDateObj.getFullYear();
      const mm = String(nextDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(n).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [year, month]);

  // Selected Date Events for Detail Modal
  const selectedEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    const eventsOnDate = allEventsMap.get(selectedDateStr) || [];
    return eventsOnDate.filter(isEventMatchingFilter);
  }, [selectedDateStr, allEventsMap, activeFilter]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
            <h1 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
              Leave Calendar
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              View company holidays, optional holidays, and track your leave request statuses
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={goToToday}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
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
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]' : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]' : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div
        className={`border rounded-2xl p-5 shadow-xl space-y-4 transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        {/* Color Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b pb-4 border-stone-500/20">
          <span className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${
            isDark ? 'text-stone-400' : 'text-stone-600'
          }`}>
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Indicator Legend:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Company Holiday</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border bg-purple-500/10 border-purple-500/20 text-purple-400 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Optional Holiday</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Approved Leave</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pending Leave</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-400 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Rejected Leave</span>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
          <span className={`text-xs font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1 ${
            isDark ? 'text-stone-400' : 'text-stone-600'
          }`}>
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Filter:</span>
          </span>

          {(
            [
              'All',
              'Company Holidays',
              'Optional Holidays',
              'My Leaves',
              'Approved',
              'Pending',
              'Rejected'
            ] as const
          ).map((chip) => {
            const isActive = activeFilter === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveFilter(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/20'
                    : isDark
                    ? 'bg-[#22201D] hover:bg-[#33302C] text-stone-300 border border-[#3D3833]'
                    : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-stone-700 border border-[#E2DBD0]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3.5 px-1 border-r last:border-r-0 border-stone-500/10">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b text-xs divide-stone-500/15 border-stone-500/15">
          {calendarDays.map((cell, idx) => {
            const allCellEvents = allEventsMap.get(cell.dateStr) || [];
            const filteredCellEvents = allCellEvents.filter(isEventMatchingFilter);

            return (
              <div
                key={`${cell.dateStr}-${idx}`}
                onClick={() => {
                  if (filteredCellEvents.length > 0) {
                    setSelectedDateStr(cell.dateStr);
                  }
                }}
                className={`min-h-[95px] sm:min-h-[110px] p-1.5 sm:p-2 transition-all flex flex-col justify-between group ${
                  filteredCellEvents.length > 0 ? 'cursor-pointer hover:bg-blue-500/5' : ''
                } ${
                  !cell.isCurrentMonth
                    ? isDark
                      ? 'bg-[#1D1B19]/50 text-stone-600'
                      : 'bg-stone-100/50 text-stone-400'
                    : isDark
                    ? 'bg-[#292623] text-stone-200'
                    : 'bg-[#FCFAF7] text-stone-800'
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      cell.isToday
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/30'
                        : cell.isCurrentMonth
                        ? isDark
                          ? 'text-stone-200 group-hover:text-blue-400'
                          : 'text-stone-800 group-hover:text-blue-600'
                        : 'text-stone-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-extrabold text-blue-500 uppercase tracking-tight">
                      Today
                    </span>
                  )}
                </div>

                {/* Event Indicators list */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[70px] sm:max-h-[80px] scrollbar-none">
                  {filteredCellEvents.map((ev) => {
                    let badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                    let dotClass = 'bg-blue-500';

                    if (ev.category === 'Company Holiday') {
                      badgeClass = isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                      dotClass = 'bg-emerald-500';
                    } else if (ev.category === 'Optional Holiday') {
                      badgeClass = isDark
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800/80 hover:bg-purple-900/80'
                        : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
                      dotClass = 'bg-purple-500';
                    } else if (ev.category === 'Approved Leave') {
                      badgeClass = isDark
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/80 hover:bg-blue-900/80'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
                      dotClass = 'bg-blue-500';
                    } else if (ev.category === 'Pending Leave') {
                      badgeClass = isDark
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/80'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
                      dotClass = 'bg-amber-500';
                    } else if (ev.category === 'Rejected Leave') {
                      badgeClass = isDark
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/80'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
                      dotClass = 'bg-rose-500';
                    }

                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-1 rounded-md border text-[10px] font-bold transition-all truncate flex items-center space-x-1 ${badgeClass}`}
                        title={`${ev.title} (${ev.category})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                        <span className="truncate leading-none">{ev.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Modal / Side Drawer */}
      {selectedDateStr && (
        <Modal
          isOpen={!!selectedDateStr}
          onClose={() => setSelectedDateStr(null)}
          title={`Events on ${formatDate(selectedDateStr)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {selectedEvents.length === 0 ? (
              <div className="py-8 text-center text-stone-500">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                <p className="font-semibold text-sm">No matching events on this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedEvents.map((ev, idx) => {
                  let bannerStyle = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                  if (ev.category === 'Company Holiday') {
                    bannerStyle = isDark
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900';
                  } else if (ev.category === 'Optional Holiday') {
                    bannerStyle = isDark
                      ? 'bg-purple-950/40 border-purple-800/60 text-purple-300'
                      : 'bg-purple-50 border-purple-200 text-purple-900';
                  } else if (ev.category === 'Approved Leave') {
                    bannerStyle = isDark
                      ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                      : 'bg-blue-50 border-blue-200 text-blue-900';
                  } else if (ev.category === 'Pending Leave') {
                    bannerStyle = isDark
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                      : 'bg-amber-50 border-amber-200 text-amber-900';
                  } else if (ev.category === 'Rejected Leave') {
                    bannerStyle = isDark
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      : 'bg-rose-50 border-rose-200 text-rose-900';
                  }

                  const days = calculateDurationDays(ev.startDate, ev.endDate);

                  return (
                    <div
                      key={ev.id || idx}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                      }`}
                    >
                      {/* Badge Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center space-x-1.5 ${bannerStyle}`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{ev.category}</span>
                          </span>
                        </div>

                        {ev.status === 'Approved' || ev.status === 'Pending' || ev.status === 'Rejected' ? (
                          <LeaveStatusBadge status={ev.status} />
                        ) : (
                          <span className="text-[11px] font-semibold opacity-75">Official Holiday</span>
                        )}
                      </div>

                      {/* Event Title */}
                      <div>
                        <h4 className={`text-base font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                          {ev.title}
                        </h4>
                        {ev.employeeName && (
                          <p className={`text-xs mt-0.5 flex items-center space-x-1 ${
                            isDark ? 'text-stone-400' : 'text-stone-600'
                          }`}>
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span>Employee: <strong className="text-stone-200">{ev.employeeName}</strong></span>
                          </p>
                        )}
                      </div>

                      {/* Date & Duration Info */}
                      <div
                        className={`p-3 rounded-xl border grid grid-cols-2 gap-2 text-xs ${
                          isDark ? 'bg-[#1B1917] border-[#38332E]' : 'bg-[#F2ECE1] border-[#E2DBD0]'
                        }`}
                      >
                        <div>
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                            Date Range
                          </p>
                          <p className="font-semibold text-stone-200">
                            {formatDate(ev.startDate)}
                            {ev.startDate !== ev.endDate && ` – ${formatDate(ev.endDate)}`}
                          </p>
                        </div>

                        <div>
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                            Type / Category
                          </p>
                          <p className="font-semibold text-stone-200">{ev.type}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      {ev.leaveReason && (
                        <div>
                          <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                            isDark ? 'text-stone-400' : 'text-stone-500'
                          }`}>
                            Reason / Description
                          </p>
                          <p className={`p-2.5 rounded-xl border leading-relaxed ${
                            isDark ? 'bg-[#1D1B19] border-[#38332E] text-stone-200' : 'bg-[#FFFDF9] border-[#E2DBD0] text-stone-800'
                          }`}>
                            {ev.leaveReason}
                          </p>
                        </div>
                      )}

                      {/* Remarks */}
                      {ev.remarks && (
                        <div>
                          <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                            isDark ? 'text-stone-400' : 'text-stone-500'
                          }`}>
                            Manager Remarks
                          </p>
                          <p className={`p-2.5 rounded-xl border italic leading-relaxed ${
                            isDark ? 'bg-amber-950/30 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            "{ev.remarks}"
                          </p>
                        </div>
                      )}

                      {/* Attachment Button */}
                      {ev.documentUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDocUrl(ev.documentUrl!)}
                            className="w-full py-2 px-3 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>View Supporting Attachment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:bg-[#3D3833]'
                    : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:bg-[#EAE2D3]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        documentUrl={selectedDocUrl}
      />
    </div>
  );
};
