import React, { useEffect, useState } from 'react';
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
import { Modal } from '../../components/common/Modal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
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
  Sun
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [employees, setEmployees] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Modal states
  const [actionLeave, setActionLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Review Modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
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
      console.error('Failed to load manager dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved');
  const approvedCount = approvedLeaves.length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const totalApprovedDays = approvedLeaves.reduce(
    (acc, l) => acc + calculateDurationDays(l.start_date, l.end_date),
    0
  );

  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

  const handleAction = async (remarks?: string) => {
    if (!actionLeave || !actionType) return;

    try {
      setIsSubmitting(true);
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      const res = await leaveService.updateLeaveStatus(actionLeave.id, newStatus, remarks);

      if (res.success) {
        toast.success(
          `Leave request for ${actionLeave.employee_username || 'employee'} ${newStatus.toLowerCase()}.`
        );
        setLeaves((prev) =>
          prev.map((l) => (l.id === actionLeave.id ? { ...l, status: newStatus, remarks } : l))
        );
        if (reviewingLeave && reviewingLeave.id === actionLeave.id) {
          setReviewingLeave(null);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update leave status.');
    } finally {
      setIsSubmitting(false);
      setActionLeave(null);
      setActionType(null);
    }
  };

  // Sort latest leaves for recent activity feed
  const recentLeaves = [...leaves]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
        }`}
      >
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-500 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manager Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || user?.username || 'Manager'}!
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-xl leading-relaxed ${
              isDark ? 'text-stone-400' : 'text-slate-600'
            }`}
          >
            Real-time management dashboard for team leave requests, staff directory, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/manager/leave-requests"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all border border-blue-400/20"
          >
            <span>Review All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total Staff */}
            <div
              className={`border rounded-2xl p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Total Staff
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {employees.length}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Active team members
              </p>
            </div>

            {/* Pending Review */}
            <div
              className={`border rounded-2xl p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Pending Review
                </span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-500">{pendingLeaves.length}</p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Requires manager review
              </p>
            </div>

            {/* Approved Leaves */}
            <div
              className={`border rounded-2xl p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approved Leaves
                </span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {approvedCount}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Granted applications
              </p>
            </div>

            {/* Rejected Leaves */}
            <div
              className={`border rounded-2xl p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Rejected Leaves
                </span>
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {rejectedCount}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Declined applications
              </p>
            </div>

            {/* Total Approved Days (New Metric) */}
            <div
              className={`border rounded-2xl p-5 transition-all shadow-lg col-span-2 sm:col-span-1 ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4D4740]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approved Days
                </span>
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
                  <Sun className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-indigo-500">{totalApprovedDays}</p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Total days approved
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Pending Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Approval Queue (Takes 2 cols on desktop) */}
        <div
          className={`lg:col-span-2 border rounded-2xl overflow-hidden shadow-xl ${
            isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
          }`}
        >
          <div
            className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-sm font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Pending Review Queue
                </h2>
                <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Applications waiting for your approval decision ({pendingLeaves.length})
                </p>
              </div>
            </div>

            <Link
              to="/manager/leave-requests?status=Pending"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>View All Pending</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              <div className="h-12 bg-zinc-800/80 rounded-xl" />
              <div className="h-12 bg-zinc-800/80 rounded-xl" />
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Queue clear!"
                description="All submitted leave applications have been reviewed and processed."
              />
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
              {pendingLeaves.map((leave) => {
                const days = calculateDurationDays(leave.start_date, leave.end_date);
                const { type, reason } = parseLeaveDetails(leave.leave_reason);
                const cleanEmpUsername = leave.employee_username?.includes('@')
                  ? leave.employee_username.split('@')[0]
                  : (leave.employee_username || 'user');
                const rawEmpName = leave.employee_name;
                const empName = (rawEmpName && !rawEmpName.includes('@'))
                  ? rawEmpName
                  : cleanEmpUsername.charAt(0).toUpperCase() + cleanEmpUsername.slice(1);

                return (
                  <div
                    key={leave.id}
                    className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      {/* Employee Name & Username & Leave Type */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`text-xs font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                          {empName}
                        </span>
                        <span className="text-xs font-semibold text-blue-500">@{cleanEmpUsername}</span>
                        <span className={isDark ? 'text-stone-600' : 'text-stone-400'}>•</span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                            isDark
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5 text-blue-500" />
                          <span>{type} Leave</span>
                        </span>
                      </div>

                      {/* Date Range, Duration, Submitted Date */}
                      <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-1">
                        <span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                          {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isDark
                              ? 'bg-[#22201D] text-stone-400 border-[#3D3833]'
                              : 'bg-[#F2ECE1] text-stone-700 border-[#E2DBD0]'
                          }`}
                        >
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        {leave.created_at && (
                          <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                            Submitted: {formatDate(leave.created_at)}
                          </span>
                        )}
                      </div>

                      {/* Reason snippet */}
                      <p
                        className={`text-xs font-medium leading-relaxed line-clamp-1 ${
                          isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        "{reason}"
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Review details button */}
                      <button
                        type="button"
                        onClick={() => setReviewingLeave(leave)}
                        className={`px-3 py-1.5 rounded-xl border transition-colors text-xs font-semibold flex items-center space-x-1.5 ${
                          isDark
                            ? 'bg-[#33302C] hover:bg-[#3D3833] text-stone-200 border-[#3D3833]'
                            : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 border-[#E2DBD0]'
                        }`}
                        title="Review Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Review</span>
                      </button>

                      {/* Quick Approve */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionLeave(leave);
                          setActionType('approve');
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 font-semibold rounded-xl transition-all text-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>

                      {/* Quick Reject */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionLeave(leave);
                          setActionType('reject');
                        }}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 font-semibold rounded-xl transition-all text-xs flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lightweight Recent Activity Section */}
        <div
          className={`border rounded-2xl overflow-hidden shadow-xl ${
            isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
          }`}
        >
          <div
            className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-sm font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Recent Activity
                </h2>
                <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Latest team leave events from database
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              <div className="h-10 bg-zinc-800/80 rounded-xl" />
              <div className="h-10 bg-zinc-800/80 rounded-xl" />
            </div>
          ) : recentLeaves.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">No activity logged yet.</div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
              {recentLeaves.map((l) => {
                const { type } = parseLeaveDetails(l.leave_reason);
                const days = calculateDurationDays(l.start_date, l.end_date);
                const empName = l.employee_name || l.employee_username || 'Employee';

                return (
                  <div
                    key={l.id}
                    className={`p-3.5 transition-colors flex items-center justify-between gap-3 text-xs ${
                      isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold truncate ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                          {empName}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                          ({type})
                        </span>
                      </div>

                      <div className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        {days} {days === 1 ? 'day' : 'days'} • {formatDate(l.start_date)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <LeaveStatusBadge status={l.status} />
                      <button
                        type="button"
                        onClick={() => setReviewingLeave(l)}
                        className={`p-1 rounded-lg transition-colors ${
                          isDark
                            ? 'text-stone-400 hover:text-white hover:bg-[#282522]'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
                        }`}
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {reviewingLeave && (
        <Modal
          isOpen={!!reviewingLeave}
          onClose={() => setReviewingLeave(null)}
          title={`Review Leave Request #${reviewingLeave.id}`}
        >
          {(() => {
            const days = calculateDurationDays(reviewingLeave.start_date, reviewingLeave.end_date);
            const { type, reason } = parseLeaveDetails(reviewingLeave.leave_reason);
            const empName = reviewingLeave.employee_name || reviewingLeave.employee_username || 'Employee';
            const empUsername = reviewingLeave.employee_username || 'user';
            const isPending = reviewingLeave.status === 'Pending';

            return (
              <div className="space-y-4 text-xs">
                {/* Employee Header Info */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-extrabold text-sm">
                      {empName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-extrabold text-sm ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {empName}
                      </p>
                      <p className="text-blue-500 font-semibold">@{empUsername}</p>
                    </div>
                  </div>

                  <LeaveStatusBadge status={reviewingLeave.status} />
                </div>

                {/* Dates, Duration, Submitted Date Grid */}
                <div
                  className={`p-3.5 rounded-xl border grid grid-cols-2 gap-3 ${
                    isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Leave Type
                    </p>
                    <p className="font-semibold text-blue-500">{type} Leave</p>
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Duration
                    </p>
                    <p className="font-extrabold text-stone-200">{days} {days === 1 ? 'Day' : 'Days'}</p>
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Start Date
                    </p>
                    <p className="font-medium">{formatDate(reviewingLeave.start_date)}</p>
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      End Date
                    </p>
                    <p className="font-medium">{formatDate(reviewingLeave.end_date)}</p>
                  </div>

                  {reviewingLeave.created_at && (
                    <div className="col-span-2 pt-2 border-t border-stone-500/10 flex items-center justify-between text-[11px]">
                      <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>Submitted Date:</span>
                      <span className="font-medium">{formatDate(reviewingLeave.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Leave Reason */}
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Leave Reason
                  </p>
                  <div
                    className={`p-3.5 rounded-xl border leading-relaxed ${
                      isDark ? 'bg-[#22201D] border-[#3D3833] text-stone-200' : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-800'
                    }`}
                  >
                    {reason}
                  </div>
                </div>

                {/* Attachment Document */}
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Supporting Document
                  </p>
                  {reviewingLeave.document_url ? (
                    <button
                      type="button"
                      onClick={() => setSelectedDocUrl(reviewingLeave.document_url!)}
                      className="w-full p-2.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Attached Document</span>
                    </button>
                  ) : (
                    <p className={`text-xs italic ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>No document attached.</p>
                  )}
                </div>

                {/* Manager Remarks if existing */}
                {reviewingLeave.remarks && (
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Existing Manager Remarks
                    </p>
                    <p className={`p-2.5 rounded-xl border italic ${isDark ? 'bg-[#22201D] border-[#3D3833] text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'}`}>
                      "{reviewingLeave.remarks}"
                    </p>
                  </div>
                )}

                {/* Manager Decision Actions */}
                <div className={`pt-3 border-t flex items-center justify-between gap-3 ${isDark ? 'border-[#3D3833]' : 'border-[#E8E2D8]'}`}>
                  <button
                    type="button"
                    onClick={() => setReviewingLeave(null)}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                      isDark
                        ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:bg-[#3D3833]'
                        : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:bg-[#EAE2D3]'
                    }`}
                  >
                    Close
                  </button>

                  {isPending && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActionLeave(reviewingLeave);
                          setActionType('reject');
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject Request</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionLeave(reviewingLeave);
                          setActionType('approve');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Status Confirmation Modal */}
      {actionLeave && actionType && (
        <ConfirmModal
          isOpen={!!actionLeave}
          onClose={() => {
            setActionLeave(null);
            setActionType(null);
          }}
          onConfirm={handleAction}
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request?`}
          description={`Process leave request for ${
            actionLeave.employee_name || actionLeave.employee_username
          } (${formatDate(actionLeave.start_date)} – ${formatDate(actionLeave.end_date)}).`}
          confirmType={actionType}
          confirmText={actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          showRemarksInput={true}
          isLoading={isSubmitting}
        />
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


