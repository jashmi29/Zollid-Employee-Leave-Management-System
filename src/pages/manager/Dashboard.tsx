import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { leaveService } from '../../services/leaveService.js';
import { employeeService } from '../../services/employeeService.js';
import { LeaveRequest, User } from '../../types.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { CardSkeleton } from '../../components/common/SkeletonLoader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { ReviewRequestModal } from '../../components/common/ReviewRequestModal.js';
import { Modal } from '../../components/common/Modal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Eye,
  Calendar,
  Activity,
  Tag,
  User as UserIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart2,
  Filter,
  Search,
  AlertTriangle,
  Award,
  Paperclip,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [employees, setEmployees] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time Horizon Filter for Analytics
  const [timeHorizon, setTimeHorizon] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Pending Leave Review Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveCategoryFilter, setLeaveCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');

  // Modal Actions
  const [actionLeave, setActionLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Review & Edit Modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [empData, leaveData] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getAllLeaves()
      ]);

      if (empData.success) setEmployees(empData.employees);
      if (leaveData.success) setLeaves(leaveData.leaves);
    } catch (error) {
      console.error('Failed to load manager dashboard analytics:', error);
      toast.error('Failed to load real-time analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Parse leave type category from reason string e.g. "[Sick] Flu symptoms"
  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

  // Filter leaves based on selected Time Horizon
  const filteredTimeLeaves = useMemo(() => {
    if (timeHorizon === 'all') return leaves;
    const now = new Date();
    return leaves.filter((l) => {
      const created = new Date(l.created_at || l.start_date);
      if (timeHorizon === 'month') {
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }
      if (timeHorizon === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const createdQuarter = Math.floor(created.getMonth() / 3);
        return currentQuarter === createdQuarter && created.getFullYear() === now.getFullYear();
      }
      if (timeHorizon === 'year') {
        return created.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [leaves, timeHorizon]);

  // Derived KPI Metrics
  const totalEmployees = employees.length || 1;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved' || l.status === 'Partially Approved');
  const rejectedLeaves = leaves.filter((l) => l.status === 'Rejected');

  // Currently On Leave Today
  const todayStr = new Date().toISOString().split('T')[0];
  const currentlyOnLeave = useMemo(() => {
    return leaves.filter((l) => {
      if (l.status !== 'Approved' && l.status !== 'Partially Approved') return false;
      const start = l.approved_start_date || l.start_date;
      const end = l.approved_end_date || l.end_date;
      return todayStr >= start && todayStr <= end;
    });
  }, [leaves, todayStr]);

  const workforceAvailability = Math.max(
    0,
    Math.round(((totalEmployees - currentlyOnLeave.length) / totalEmployees) * 100)
  );

  const totalApprovedDays = useMemo(() => {
    return approvedLeaves.reduce((acc, l) => {
      const start = l.approved_start_date || l.start_date;
      const end = l.approved_end_date || l.end_date;
      return acc + calculateDurationDays(start, end);
    }, 0);
  }, [approvedLeaves]);

  const approvalRate = useMemo(() => {
    const decidedCount = approvedLeaves.length + rejectedLeaves.length;
    if (decidedCount === 0) return 100;
    return Math.round((approvedLeaves.length / decidedCount) * 100);
  }, [approvedLeaves, rejectedLeaves]);

  const requestsWithDocsCount = leaves.filter((l) => !!l.document_url).length;
  const docsRate = leaves.length > 0 ? Math.round((requestsWithDocsCount / leaves.length) * 100) : 0;

  // Chart 1 Data: Leave Distribution by Category (Donut Chart)
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTimeLeaves.forEach((l) => {
      const { type } = parseLeaveDetails(l.leave_reason);
      counts[type] = (counts[type] || 0) + 1;
    });

    const COLOR_MAP: Record<string, string> = {
      Annual: '#3B82F6', // Blue
      Sick: '#EF4444', // Red
      Casual: '#10B981', // Emerald
      Maternity: '#EC4899', // Pink
      Paternity: '#8B5CF6', // Purple
      Unpaid: '#F59E0B', // Amber
      Emergency: '#F97316', // Orange
      Other: '#6B7280' // Gray
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLOR_MAP[name] || '#3B82F6'
    }));
  }, [filteredTimeLeaves]);

  // Chart 2 Data: Monthly Trends (Area Chart)
  const monthlyTrendsData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Map month index (0-11)
    const monthMap = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      monthIndex: i,
      Total: 0,
      Approved: 0,
      Pending: 0,
      Rejected: 0
    }));

    leaves.forEach((l) => {
      const d = new Date(l.created_at || l.start_date);
      if (d.getFullYear() === currentYear) {
        const mIdx = d.getMonth();
        if (monthMap[mIdx]) {
          monthMap[mIdx].Total += 1;
          if (l.status === 'Approved' || l.status === 'Partially Approved') {
            monthMap[mIdx].Approved += 1;
          } else if (l.status === 'Pending') {
            monthMap[mIdx].Pending += 1;
          } else if (l.status === 'Rejected') {
            monthMap[mIdx].Rejected += 1;
          }
        }
      }
    });

    // Return current month + previous 5 months or full year if non-zero
    return monthMap;
  }, [leaves]);

  // Chart 3 Data: Status Breakdown (Bar Chart)
  const statusBreakdownData = useMemo(() => {
    return [
      { name: 'Approved', count: approvedLeaves.length, color: '#10B981' },
      { name: 'Pending', count: pendingLeaves.length, color: '#F59E0B' },
      { name: 'Rejected', count: rejectedLeaves.length, color: '#EF4444' }
    ];
  }, [approvedLeaves, pendingLeaves, rejectedLeaves]);

  // Chart 4 Data: Top Leave Requesting Employees
  const employeeLeaveData = useMemo(() => {
    const empMap: Record<string, { name: string; approvedDays: number; totalRequests: number }> = {};

    leaves.forEach((l) => {
      const empName = l.employee_name || l.employee_username || `Emp #${l.employee_id}`;
      if (!empMap[empName]) {
        empMap[empName] = { name: empName, approvedDays: 0, totalRequests: 0 };
      }
      empMap[empName].totalRequests += 1;
      if (l.status === 'Approved' || l.status === 'Partially Approved') {
        const start = l.approved_start_date || l.start_date;
        const end = l.approved_end_date || l.end_date;
        empMap[empName].approvedDays += calculateDurationDays(start, end);
      }
    });

    return Object.values(empMap)
      .sort((a, b) => b.approvedDays - a.approvedDays)
      .slice(0, 5);
  }, [leaves]);

  // Upcoming Leave Absences (Next 7 days)
  const upcomingAbsences = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return leaves.filter((l) => {
      const start = l.approved_start_date || l.start_date;
      return (
        (l.status === 'Approved' || l.status === 'Partially Approved' || l.status === 'Pending') &&
        start >= todayStr &&
        start <= nextWeekStr
      );
    });
  }, [leaves, todayStr]);

  // Filter pending review requests
  const filteredReviewRequests = useMemo(() => {
    let list = viewMode === 'pending' ? pendingLeaves : leaves;

    if (leaveCategoryFilter !== 'all') {
      if (leaveCategoryFilter === 'attachment') {
        list = list.filter((l) => !!l.document_url);
      } else {
        list = list.filter((l) => {
          const { type } = parseLeaveDetails(l.leave_reason);
          return type.toLowerCase() === leaveCategoryFilter.toLowerCase();
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          (l.employee_name && l.employee_name.toLowerCase().includes(q)) ||
          (l.employee_username && l.employee_username.toLowerCase().includes(q)) ||
          (l.employee_email && l.employee_email.toLowerCase().includes(q)) ||
          l.leave_reason.toLowerCase().includes(q)
      );
    }

    return list;
  }, [pendingLeaves, leaves, viewMode, leaveCategoryFilter, searchQuery]);

  // Quick Action Handler
  const handleQuickAction = async (remarks?: string) => {
    if (!actionLeave || !actionType) return;

    try {
      setIsSubmitting(true);
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      const res = await leaveService.updateLeaveStatus(actionLeave.id, newStatus, remarks);

      if (res.success) {
        toast.success(
          `Leave request for ${actionLeave.employee_username || 'employee'} ${newStatus.toLowerCase()}.`
        );
        fetchData();
        if (reviewingLeave && reviewingLeave.id === actionLeave.id) {
          setReviewingLeave(null);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update leave status.');
    } finally {
      setIsSubmitting(false);
      setActionLeave(null);
      setActionType(null);
    }
  };

  // Detailed Modal Submit Handler
  const handleReviewSubmit = async (data: {
    id: number;
    status: any;
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
        fetchData();
        if (reviewingLeave && reviewingLeave.id === data.id) {
          setReviewingLeave(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update leave request status.');
      throw err;
    }
  };

  // Recharts Custom Tooltip (strictly styled for light/dark mode)
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl border shadow-xl text-xs space-y-1.5 transition-colors ${
            isDark
              ? 'bg-[#22201D] border-[#3D3833] text-stone-100 shadow-black/60'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-stone-200'
          }`}
        >
          <p className="font-bold border-b pb-1 border-stone-500/20">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>{entry.name || 'Count'}:</span>
              <span className="font-extrabold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Executive Command Bar */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100 shadow-stone-950/40'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-stone-200/50'
        }`}
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise HR Analytics Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Workforce Command & Analytics
          </h1>
          <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            Real-time workforce insights, interactive leave distribution, attendance metrics, and pending manager approval queue.
          </p>
        </div>

        {/* Time Horizon Selector & Quick Action Links */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <div
            className={`flex items-center p-1 rounded-2xl border ${
              isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6] border-[#E2DBD0]'
            }`}
          >
            {(['all', 'month', 'quarter', 'year'] as const).map((horizon) => (
              <button
                key={horizon}
                type="button"
                onClick={() => setTimeHorizon(horizon)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                  timeHorizon === horizon
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {horizon === 'all' ? 'All Time' : horizon}
              </button>
            ))}
          </div>

          <Link
            to="/manager/employees"
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition-all ${
              isDark
                ? 'bg-[#33302C] hover:bg-[#3D3833] text-stone-200 border-[#3D3833]'
                : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 border-[#E2DBD0]'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Directory</span>
          </Link>
        </div>
      </div>

      {/* 2. Enterprise HR Analytics KPI Grid (6 High-Impact Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* KPI 1: Total Workforce */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Workforce
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {employees.length}
                </p>
                <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Registered Employees
                </p>
              </div>
            </div>

            {/* KPI 2: Pending Approvals */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-amber-500/50'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-amber-400 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Pending Review
                </span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 relative">
                  <Clock className="w-4 h-4" />
                  {pendingLeaves.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-amber-500">{pendingLeaves.length}</p>
                <p className={`text-[11px] mt-1 font-semibold text-amber-600 dark:text-amber-400`}>
                  Requires Manager Action
                </p>
              </div>
            </div>

            {/* KPI 3: On Leave Today & Availability */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Absent Today
                </span>
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {currentlyOnLeave.length}
                  </p>
                  <span className="text-xs font-extrabold text-emerald-500">{workforceAvailability}% active</span>
                </div>
                <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Workforce On-site Today
                </p>
              </div>
            </div>

            {/* KPI 4: Total Approved Days */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approved Days
                </span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {totalApprovedDays}
                </p>
                <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Total Approved Leave Days
                </p>
              </div>
            </div>

            {/* KPI 5: Approval Rate % */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approval Rate
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-500">{approvalRate}%</p>
                <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Decision Concurrence
                </p>
              </div>
            </div>

            {/* KPI 6: Attachment Compliance */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Doc Compliance
                </span>
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
                  <Paperclip className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {docsRate}%
                </p>
                <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Requests with Documents
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Real-time Interactive Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Monthly Leave Request & Approval Trends (Area Chart - 7 cols) */}
        <div
          className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Monthly Leave Volume & Approvals
                </h3>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Real-time trend analysis of submitted vs approved requests across months.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Total</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Approved</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3D3833' : '#E8E2D8'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#a8a29e' : '#78716c'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#a8a29e' : '#78716c'} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="Approved"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Leave Distribution by Category / Type (Donut Chart - 5 cols) */}
        <div
          className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Leave Type Breakdown
              </h3>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Distribution by request category
              </p>
            </div>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs">
              <Layers className="w-8 h-8 mb-2 opacity-50" />
              <span>No leave data recorded yet</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#292623' : '#FCFAF7'} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {filteredTimeLeaves.length}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Total Requests
                  </span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 w-full mt-2 pt-3 border-t border-stone-500/20 text-xs">
                {categoryChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-2 py-1 rounded-lg">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className={`truncate font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-extrabold ml-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Secondary Analytics & Workforce Availability Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget A: Leave Request Status Bar Chart (4 cols) */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Decision Status Totals
              </h3>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Comparison across approval states
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3D3833' : '#E8E2D8'} vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#a8a29e' : '#78716c'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#a8a29e' : '#78716c'} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget B: Top Staff Leave Allocation (5 cols) */}
        <div
          className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Top Leave Takers (Approved Days)
              </h3>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Employees with highest granted leave volume
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {employeeLeaveData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-stone-400">
                No approved employee leaves recorded yet.
              </div>
            ) : (
              employeeLeaveData.map((emp) => (
                <div
                  key={emp.name}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6] border-[#E2DBD0]'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className={`font-bold truncate ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {emp.name}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                        {emp.totalRequests} Leave Request{emp.totalRequests > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-indigo-500 text-sm">{emp.approvedDays} Days</span>
                    <span className={`block text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      Granted
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget C: Real-time On-Leave Today & Upcoming (3 cols) */}
        <div
          className={`lg:col-span-3 p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Staff On Leave Today
              </h3>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Active & upcoming absences
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-56">
            {currentlyOnLeave.length === 0 && upcomingAbsences.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-stone-400">
                <Sparkles className="w-6 h-6 mb-1 text-emerald-500" />
                <span>Full Team Present Today!</span>
                <span className="text-[10px] mt-0.5 opacity-70">No active absences active right now.</span>
              </div>
            ) : (
              <>
                {currentlyOnLeave.map((l) => (
                  <div
                    key={`today-${l.id}`}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-bold truncate">{l.employee_name || l.employee_username}</p>
                      <p className="text-[10px] opacity-80">{l.start_date} → {l.end_date}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shrink-0">
                      On Leave
                    </span>
                  </div>
                ))}

                {upcomingAbsences
                  .filter((l) => !currentlyOnLeave.some((col) => col.id === l.id))
                  .map((l) => (
                    <div
                      key={`upcoming-${l.id}`}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6] border-[#E2DBD0]'
                      }`}
                    >
                      <div className="truncate">
                        <p className={`font-bold truncate ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                          {l.employee_name || l.employee_username}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                          Starts {l.start_date}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                        Upcoming
                      </span>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. PROMINENT "REVIEW LEAVE REQUESTS" SECTION BELOW ANALYTICS */}
      <div
        id="review-section"
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-colors ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100 shadow-stone-950/40'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-stone-200/50'
        }`}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-stone-500/20">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center space-x-2">
                <span>Review Leave Requests</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-md">
                  {pendingLeaves.length} Pending
                </span>
              </h2>
            </div>
            <p className={`text-xs sm:text-sm mt-1.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Review, approve, reject, or partially approve requested leave dates with custom manager remarks.
            </p>
          </div>

          {/* View Mode Toggle (Pending vs All) */}
          <div className="flex items-center space-x-2 shrink-0">
            <div
              className={`flex items-center p-1 rounded-2xl border ${
                isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6] border-[#E2DBD0]'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'pending'
                    ? 'bg-amber-500 text-white shadow-md'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pending ({pendingLeaves.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All History ({leaves.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name, email or leave reason..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark
                  ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-white'
              }`}
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="md:col-span-6 flex items-center space-x-2 overflow-x-auto pb-1">
            <Filter className={`w-4 h-4 shrink-0 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
            {[
              { id: 'all', label: 'All Types' },
              { id: 'annual', label: 'Annual' },
              { id: 'sick', label: 'Sick' },
              { id: 'casual', label: 'Casual' },
              { id: 'attachment', label: 'With Attachment' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeaveCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  leaveCategoryFilter === tab.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : isDark
                    ? 'bg-[#22201D] border-[#3D3833] text-stone-400 hover:text-stone-200'
                    : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request Cards List */}
        {filteredReviewRequests.length === 0 ? (
          <EmptyState
            title={viewMode === 'pending' ? 'No Pending Leave Requests' : 'No Leave Requests Found'}
            description={
              viewMode === 'pending'
                ? 'All submitted leave requests have been reviewed! Switch to All History tab to review past decisions.'
                : 'No leave applications match your search filters.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviewRequests.map((leave) => {
              const { type, reason } = parseLeaveDetails(leave.leave_reason);
              const requestedDays = calculateDurationDays(leave.start_date, leave.end_date);
              const isPending = leave.status === 'Pending';

              return (
                <div
                  key={leave.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-md ${
                    isDark
                      ? 'bg-[#22201D] border-[#3D3833] hover:border-[#4D4740]'
                      : 'bg-[#FAF7F2] border-[#E2DBD0] hover:border-stone-300 shadow-sm'
                  }`}
                >
                  {/* Card Header: Employee info & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                        {(leave.employee_name || leave.employee_username || 'E').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                          {leave.employee_name || leave.employee_username}
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                          {leave.employee_email || `@${leave.employee_username}`}
                        </p>
                      </div>
                    </div>
                    <LeaveStatusBadge status={leave.status} />
                  </div>

                  {/* Dates & Duration Banner */}
                  <div
                    className={`p-3 rounded-xl border text-xs grid grid-cols-2 gap-2 ${
                      isDark ? 'bg-[#191816] border-[#33302C]' : 'bg-[#F2ECE1] border-[#E2DBD0]'
                    }`}
                  >
                    <div>
                      <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                        Requested Period
                      </span>
                      <span className={`font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                        {leave.start_date} → {leave.end_date}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                        Duration
                      </span>
                      <span className="font-extrabold text-blue-500">
                        {requestedDays} Day{requestedDays > 1 ? 's' : ''} ({type})
                      </span>
                    </div>
                  </div>

                  {/* Reason Text & Attachment */}
                  <div className="space-y-2 text-xs">
                    <p className={`italic line-clamp-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                      "{reason}"
                    </p>

                    {leave.document_url && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocUrl(leave.document_url!)}
                        className="inline-flex items-center space-x-1.5 text-xs text-blue-500 hover:text-blue-600 font-bold hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>View Supporting Document</span>
                      </button>
                    )}

                    {leave.remarks && (
                      <p className={`text-[11px] p-2 rounded-lg border ${
                        isDark ? 'bg-[#191816] border-[#33302C] text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}>
                        <strong>Manager Remarks:</strong> {leave.remarks}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="pt-3 border-t border-stone-500/20 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewRequest(leave)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isDark
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                      title="Review details, modify dates or partial approval"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>Review / Edit</span>
                    </button>

                    {isPending ? (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActionLeave(leave);
                            setActionType('reject');
                          }}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionLeave(leave);
                            setActionType('approve');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[11px] font-semibold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                        Reviewed on {new Date(leave.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review & Edit Dates Modal (Full Date Editor & Remarks) */}
      <ReviewRequestModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
        onSubmit={handleReviewSubmit}
      />

      {/* Quick Status Confirmation Modal */}
      {actionLeave && actionType && (
        <ConfirmModal
          isOpen={!!actionLeave}
          onClose={() => {
            setActionLeave(null);
            setActionType(null);
          }}
          onConfirm={handleQuickAction}
          title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          description={`Are you sure you want to ${actionType} the leave request for ${
            actionLeave.employee_name || actionLeave.employee_username
          } (${actionLeave.start_date} to ${actionLeave.end_date})?`}
          confirmType={actionType}
          confirmText={actionType === 'approve' ? 'Approve' : 'Reject'}
          showRemarksInput={true}
          isLoading={isSubmitting}
        />
      )}

      {/* Document Viewer Attachment Modal */}
      {selectedDocUrl && (
        <DocumentViewerModal
          isOpen={!!selectedDocUrl}
          onClose={() => setSelectedDocUrl(null)}
          documentUrl={selectedDocUrl}
        />
      )}
    </div>
  );
};
