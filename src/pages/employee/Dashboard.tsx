import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { leaveService } from '../../services/leaveService.js';
import { LeaveRequest } from '../../types.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { CardSkeleton } from '../../components/common/SkeletonLoader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  FilePlus2,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  FileText,
  ArrowRight,
  Sparkles,
  Search,
  Trash2,
  AlertCircle,
  Layers,
  Calendar,
  CheckCheck
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { fetchUnreadNotifications } = useNotifications();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete / Withdraw Leave State
  const [deletingLeaveId, setDeletingLeaveId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const data = await leaveService.getMyLeaves();
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error: any) {
      console.error('Failed to load leave requests:', error);
      toast.error(error?.response?.data?.message || 'Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Compute analytics
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const totalApprovedDays = leaves
    .filter((l) => l.status === 'Approved')
    .reduce((acc, l) => acc + calculateDurationDays(l.start_date, l.end_date), 0);

  // Username display calculation (strictly username, never email)
  const displayUsername = (() => {
    const raw = user?.username || '';
    if (!raw) return 'Employee';
    return raw.includes('@') ? raw.split('@')[0] : raw;
  })();

  // Personalized Summary Statement
  const personalizedSummary = useMemo(() => {
    if (isLoading) return 'Loading your leave status...';
    if (pendingCount > 0) {
      return `You currently have ${pendingCount} ${
        pendingCount === 1 ? 'leave request' : 'leave requests'
      } pending manager review.`;
    }
    if (totalCount > 0) {
      return `All your leave applications are up to date (${approvedCount} approved, ${rejectedCount} rejected). You have ${totalApprovedDays} total approved leave ${
        totalApprovedDays === 1 ? 'day' : 'days'
      }.`;
    }
    return 'Welcome to your leave portal. Submit your first leave application anytime.';
  }, [isLoading, pendingCount, totalCount, approvedCount, rejectedCount, totalApprovedDays]);

  // Filtered recent leaves list
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        leave.leave_reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.start_date.includes(searchQuery) ||
        leave.end_date.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [leaves, statusFilter, searchQuery]);

  // Handle withdrawing a pending leave
  const handleConfirmDelete = async () => {
    if (!deletingLeaveId) return;
    try {
      setIsDeleting(true);
      const res = await leaveService.deleteLeave(deletingLeaveId);
      if (res.success) {
        toast.success(res.message || 'Leave request withdrawn successfully.');
        setLeaves((prev) => prev.filter((l) => l.id !== deletingLeaveId));
        setDeletingLeaveId(null);
        fetchUnreadNotifications();
      } else {
        toast.error(res.message || 'Could not delete leave request.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error deleting leave request.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border shadow-xl transition-colors duration-300 ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {displayUsername}!
            </h1>
            <p
              className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                isDark ? 'text-stone-400' : 'text-slate-600'
              }`}
            >
              {personalizedSummary}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/apply-leave"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 border border-blue-400/20 transition-all duration-200"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Apply for Leave</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/apply-leave"
          className={`group relative overflow-hidden border rounded-2xl p-6 transition-all duration-200 shadow-xl ${
            isDark
              ? 'bg-[#292623] hover:bg-[#33302C] border-[#3D3833] hover:border-blue-500/40 text-stone-100'
              : 'bg-[#FCFAF7] hover:bg-[#FFFDF9] border-[#E8E2D8] hover:border-blue-400/60 text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
              }`}
            >
              <FilePlus2 className="w-6 h-6" />
            </div>
            <ArrowRight
              className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                isDark ? 'text-stone-500 group-hover:text-blue-400' : 'text-stone-400 group-hover:text-blue-600'
              }`}
            />
          </div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
            Apply for Leave
          </h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            Submit a new leave application specifying date ranges, detailed reasons, and medical attachments.
          </p>
        </Link>

        <Link
          to="/leave-history"
          className={`group relative overflow-hidden border rounded-2xl p-6 transition-all duration-200 shadow-xl ${
            isDark
              ? 'bg-[#292623] hover:bg-[#33302C] border-[#3D3833] hover:border-[#4A453F] text-stone-100'
              : 'bg-[#FCFAF7] hover:bg-[#FFFDF9] border-[#E8E2D8] hover:border-stone-300 text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                isDark
                  ? 'bg-[#33302C] border-[#3D3833] text-stone-300'
                  : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700'
              }`}
            >
              <History className="w-6 h-6" />
            </div>
            <ArrowRight
              className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                isDark ? 'text-stone-500 group-hover:text-stone-200' : 'text-stone-400 group-hover:text-stone-800'
              }`}
            />
          </div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
            View Leave History
          </h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            Review your historical requests, status records, manager notes, and document records.
          </p>
        </Link>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
            {/* Total Requests */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4A453F]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Total Requests
                </span>
                <div className="p-2 bg-slate-500/10 rounded-xl text-slate-400 border border-slate-500/20">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{totalCount}</p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                All leave submissions
              </p>
            </div>

            {/* Pending Review */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4A453F]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Pending
                </span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {pendingCount}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Awaiting decision
              </p>
            </div>

            {/* Approved */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4A453F]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approved
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

            {/* Rejected */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4A453F]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Rejected
                </span>
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {rejectedCount}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Declined requests
              </p>
            </div>

            {/* Approved Days */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-lg col-span-2 lg:col-span-1 ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] hover:border-[#4A453F]'
                  : 'bg-[#FCFAF7] border-[#E8E2D8] hover:border-stone-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Approved Days
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {totalApprovedDays}
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                Total days off
              </p>
            </div>
          </>
        )}
      </div>

      {/* Recent Leave Submissions List & Controls */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xl ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        {/* Table/List Header & Controls */}
        <div
          className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
          }`}
        >
          <div>
            <h2 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
              Recent Leave Submissions
            </h2>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Track real-time status, manage requests, and view notes
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/leave-history"
              className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10"
            >
              <span>View All ({leaves.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs & Search Bar */}
        <div
          className={`p-4 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
            isDark ? 'border-[#3D3833] bg-[#292623]' : 'border-[#E8E2D8] bg-[#FCFAF7]'
          }`}
        >
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 border ${
                    active
                      ? isDark
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-blue-600 text-white border-blue-600'
                      : isDark
                      ? 'bg-[#22201D] text-stone-400 border-[#3D3833] hover:text-stone-200 hover:bg-[#33302C]'
                      : 'bg-[#F2ECE1] text-stone-700 border-[#E2DBD0] hover:text-stone-900 hover:bg-[#EAE2D3]'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reason or date"
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-none border transition-colors ${
                isDark
                  ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500 focus:border-blue-500'
                  : 'bg-[#FFFDF9] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-16 bg-stone-800/20 rounded-xl" />
            <div className="h-16 bg-stone-800/20 rounded-xl" />
            <div className="h-16 bg-stone-800/20 rounded-xl" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                searchQuery || statusFilter !== 'All'
                  ? 'No matching leave requests'
                  : 'No leave requests submitted yet'
              }
              description={
                searchQuery || statusFilter !== 'All'
                  ? 'Try adjusting your search filters or status criteria.'
                  : 'You haven’t submitted any leave applications. Click below to apply.'
              }
              action={
                searchQuery || statusFilter !== 'All' ? (
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link
                    to="/apply-leave"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>Apply Now</span>
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
            {filteredLeaves.map((leave) => {
              const days = calculateDurationDays(leave.start_date, leave.end_date);
              const isPending = leave.status === 'Pending';

              return (
                <div
                  key={leave.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Badge Row */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                      <LeaveStatusBadge status={leave.status} size="sm" />

                      <div
                        className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                          isDark
                            ? 'bg-[#22201D] text-stone-300 border-[#3D3833]'
                            : 'bg-[#F2ECE1] text-stone-800 border-[#E2DBD0]'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                          isDark
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        {days} {days === 1 ? 'day' : 'days'}
                      </span>

                      {leave.created_at && (
                        <span
                          className={`text-[10px] ${
                            isDark ? 'text-stone-500' : 'text-stone-500'
                          }`}
                        >
                          Submitted {formatDate(leave.created_at)}
                        </span>
                      )}
                    </div>

                    {/* Reason / Details */}
                    <p
                      className={`text-xs font-semibold leading-relaxed ${
                        isDark ? 'text-stone-200' : 'text-stone-800'
                      }`}
                    >
                      {leave.leave_reason}
                    </p>

                    {/* Manager Remarks */}
                    {leave.remarks && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs ${
                          isDark
                            ? 'bg-[#22201D] border-[#3D3833] text-stone-300'
                            : 'bg-[#F5F0E6] border-[#E2DBD0] text-stone-700'
                        }`}
                      >
                        <span className="font-bold text-blue-500">Manager Note:</span> "{leave.remarks}"
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center space-x-2 shrink-0 self-start lg:self-center">
                    {leave.document_url && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocUrl(leave.document_url)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                          isDark
                            ? 'text-stone-300 hover:text-white bg-[#33302C] hover:bg-[#3D3833] border-[#3D3833]'
                            : 'text-stone-700 hover:text-stone-900 bg-[#F2ECE1] hover:bg-[#EAE2D3] border-[#E2DBD0]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Document</span>
                      </button>
                    )}

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => setDeletingLeaveId(leave.id)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all`}
                        title="Withdraw pending request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supporting Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        documentUrl={selectedDocUrl}
        employeeName={displayUsername}
      />

      {/* Withdraw Leave Request Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingLeaveId}
        onClose={() => setDeletingLeaveId(null)}
        onConfirm={handleConfirmDelete}
        title="Withdraw Leave Request?"
        description="Are you sure you want to withdraw this pending leave request? This action cannot be undone."
        confirmType="danger"
        confirmText="Withdraw Request"
        isLoading={isDeleting}
      />
    </div>
  );
};


