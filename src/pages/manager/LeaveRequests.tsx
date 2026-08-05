import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { leaveService } from '../../services/leaveService.js';
import { LeaveRequest, LeaveStatus } from '../../types.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { TableSkeleton } from '../../components/common/SkeletonLoader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { ReviewRequestModal } from '../../components/common/ReviewRequestModal.js';
import { Modal } from '../../components/common/Modal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  ClipboardList,
  Search,
  FileText,
  Check,
  X,
  Calendar,
  MessageSquare,
  User as UserIcon,
  Tag,
  Eye,
  Mail,
  AtSign,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerLeaveRequests: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

  // Review Modal state
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);

  // Request Details Modal
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await leaveService.getAllLeaves({
        status: statusFilter,
        search: searchQuery
      });
      if (res.success) {
        setLeaves(res.leaves);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaves();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

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
        fetchLeaves();
        if (viewingLeave && viewingLeave.id === data.id) {
          setViewingLeave(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update leave request status.');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300 ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100'
            : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
              All Leave Requests
            </h1>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Review, filter, and process employee leave applications across the organization
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or reason"
              className={`w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500 focus:border-blue-500'
                  : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-[#FFFDF9] focus:border-blue-500'
              }`}
            />
          </div>

          {/* Status Filter buttons */}
          <div
            className={`flex items-center p-1 border rounded-xl w-full sm:w-auto overflow-x-auto ${
              isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
            }`}
          >
            {(['All', 'Pending', 'Approved', 'Partially Approved', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        {isLoading ? (
          <TableSkeleton rows={7} />
        ) : leaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No leave applications found"
              description="No employee leave requests matched your current search/status filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark
                      ? 'border-[#3D3833] bg-[#22201D] text-stone-400'
                      : 'border-[#E8E2D8] bg-[#F8F4EC] text-stone-600'
                  }`}
                >
                  <th className="py-3.5 px-4 sm:px-6">Employee Identity</th>
                  <th className="py-3.5 px-4 sm:px-6">Leave Type</th>
                  <th className="py-3.5 px-4 sm:px-6">Dates & Duration</th>
                  <th className="py-3.5 px-4 sm:px-6">Leave Reason</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Remarks</th>
                  <th className="py-3.5 px-4 sm:px-6">Document</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
                {leaves.map((leave) => {
                  const requestedDays = calculateDurationDays(leave.start_date, leave.end_date);
                  const approvedStart = leave.approved_start_date || leave.start_date;
                  const approvedEnd = leave.approved_end_date || leave.end_date;
                  const approvedDays = calculateDurationDays(approvedStart, approvedEnd);
                  const isPartiallyApproved = leave.status === 'Partially Approved' || (leave.approved_start_date && leave.approved_start_date !== leave.start_date);

                  const { type, reason } = parseLeaveDetails(leave.leave_reason);

                  const cleanEmpUsername = leave.employee_username?.includes('@')
                    ? leave.employee_username.split('@')[0]
                    : (leave.employee_username || 'user');
                  const rawEmpName = leave.employee_name;
                  const empName = (rawEmpName && !rawEmpName.includes('@'))
                    ? rawEmpName
                    : cleanEmpUsername.charAt(0).toUpperCase() + cleanEmpUsername.slice(1);
                  const empEmail = leave.employee_email || '';

                  return (
                    <tr
                      key={leave.id}
                      className={`transition-colors ${isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'}`}
                    >
                      {/* Employee Full Name (Primary) & @username / email (Secondary) */}
                      <td className={`py-4 px-4 sm:px-6 font-semibold whitespace-nowrap ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold text-xs sm:text-sm ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{empName}</p>
                            <p className={`text-[10px] font-mono ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                              @{cleanEmpUsername} {empEmail ? `• ${empEmail}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type Badge */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            isDark
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <Tag className="w-3 h-3 text-blue-500" />
                          <span>{type} Leave</span>
                        </span>
                      </td>

                      {/* Dates & Duration */}
                      <td className={`py-4 px-4 sm:px-6 whitespace-nowrap ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                          <div>
                            <p className="font-semibold">
                              {formatDate(approvedStart)} – {formatDate(approvedEnd)}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-bold text-blue-400">
                                Approved: {approvedDays} {approvedDays === 1 ? 'day' : 'days'}
                              </span>
                              {isPartiallyApproved && (
                                <span className="text-stone-400 line-through">
                                  Req: {requestedDays}d
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className={`py-4 px-4 sm:px-6 max-w-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                        <p className="line-clamp-2 font-medium">{reason}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <LeaveStatusBadge status={leave.status} />
                      </td>

                      {/* Remarks */}
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        {leave.remarks ? (
                          <div className={`flex items-start space-x-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span
                              className={`text-[11px] italic px-2.5 py-1 rounded-lg border ${
                                isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6] border-[#E2DBD0]'
                              }`}
                            >
                              {leave.remarks}
                            </span>
                          </div>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>—</span>
                        )}
                      </td>

                      {/* Document Attachment */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {leave.document_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDocUrl(leave.document_url!)}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium border rounded-xl transition-colors ${
                              isDark
                                ? 'bg-[#33302C] hover:bg-[#3D3833] text-stone-200 border-[#3D3833]'
                                : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 border-[#E2DBD0]'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setReviewRequest(leave)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Review Request</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewingLeave(leave)}
                            className={`px-3 py-1.5 rounded-xl border transition-colors text-xs font-semibold flex items-center space-x-1 ${
                              isDark
                                ? 'bg-[#33302C] hover:bg-[#3D3833] text-stone-300 border-[#3D3833]'
                                : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-700 border-[#E2DBD0]'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-400" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Request Details Modal */}
      {viewingLeave && (
        <Modal
          isOpen={!!viewingLeave}
          onClose={() => setViewingLeave(null)}
          title={`Leave Application Details #${viewingLeave.id}`}
        >
          {(() => {
            const requestedDays = calculateDurationDays(viewingLeave.start_date, viewingLeave.end_date);
            const approvedStart = viewingLeave.approved_start_date || viewingLeave.start_date;
            const approvedEnd = viewingLeave.approved_end_date || viewingLeave.end_date;
            const approvedDays = calculateDurationDays(approvedStart, approvedEnd);
            const isPartiallyApproved = viewingLeave.status === 'Partially Approved' || (viewingLeave.approved_start_date && viewingLeave.approved_start_date !== viewingLeave.start_date);

            const { type, reason } = parseLeaveDetails(viewingLeave.leave_reason);
            const cleanEmpUsername = viewingLeave.employee_username?.includes('@')
              ? viewingLeave.employee_username.split('@')[0]
              : (viewingLeave.employee_username || 'user');
            const rawEmpName = viewingLeave.employee_name;
            const empName = (rawEmpName && !rawEmpName.includes('@'))
              ? rawEmpName
              : cleanEmpUsername.charAt(0).toUpperCase() + cleanEmpUsername.slice(1);
            const empEmail = viewingLeave.employee_email || '';

            return (
              <div className="space-y-4 text-xs">
                {/* Employee Profile Header */}
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
                      <p className="text-blue-500 font-semibold">
                        @{cleanEmpUsername} {empEmail ? `• ${empEmail}` : ''}
                      </p>
                    </div>
                  </div>

                  <LeaveStatusBadge status={viewingLeave.status} />
                </div>

                {/* Duration & Dates Grid */}
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
                      Approved Duration
                    </p>
                    <p className="font-extrabold text-emerald-400">{approvedDays} {approvedDays === 1 ? 'Day' : 'Days'}</p>
                    {isPartiallyApproved && (
                      <p className="text-[10px] text-stone-400 line-through">Requested: {requestedDays} Days</p>
                    )}
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Approved Dates
                    </p>
                    <p className="font-medium text-stone-200">{formatDate(approvedStart)} – {formatDate(approvedEnd)}</p>
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Requested Dates
                    </p>
                    <p className="font-medium text-stone-400">{formatDate(viewingLeave.start_date)} – {formatDate(viewingLeave.end_date)}</p>
                  </div>

                  {viewingLeave.created_at && (
                    <div className="col-span-2 pt-2 border-t border-stone-500/10 flex items-center justify-between text-[11px]">
                      <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>Submitted Date:</span>
                      <span className="font-medium">{formatDate(viewingLeave.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
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

                {/* Manager Remarks */}
                {viewingLeave.remarks && (
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Manager Remarks
                    </p>
                    <p className={`p-3 rounded-xl border italic ${isDark ? 'bg-[#22201D] border-[#3D3833] text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'}`}>
                      "{viewingLeave.remarks}"
                    </p>
                  </div>
                )}

                {/* Supporting Document */}
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Supporting Document
                  </p>
                  {viewingLeave.document_url ? (
                    <button
                      type="button"
                      onClick={() => setSelectedDocUrl(viewingLeave.document_url!)}
                      className="w-full p-2.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Attached Document</span>
                    </button>
                  ) : (
                    <p className={`text-xs italic ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>No document attached.</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className={`pt-3 border-t flex items-center justify-between gap-3 ${isDark ? 'border-[#3D3833]' : 'border-[#E8E2D8]'}`}>
                  <button
                    type="button"
                    onClick={() => setViewingLeave(null)}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                      isDark
                        ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:bg-[#3D3833]'
                        : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:bg-[#EAE2D3]'
                    }`}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewRequest(viewingLeave);
                      setViewingLeave(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Review Application</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Review Request Modal */}
      <ReviewRequestModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
        onSubmit={handleReviewSubmit}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        documentUrl={selectedDocUrl}
      />
    </div>
  );
};
