import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { leaveService } from '../../services/leaveService.js';
import { LeaveRequest } from '../../types.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { TableSkeleton } from '../../components/common/SkeletonLoader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';
import { Modal } from '../../components/common/Modal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  History,
  Search,
  FileText,
  Trash2,
  Calendar,
  MessageSquare,
  Eye,
  Download,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LeaveHistory: React.FC = () => {
  const { isDark } = useTheme();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected'>('All');

  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await leaveService.getMyLeaves();
      if (res.success) {
        setLeaves(res.leaves);
      }
    } catch (err) {
      console.error('Failed to load leave history:', err);
      toast.error('Failed to load leave records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await leaveService.deleteLeave(deleteId);
      if (res.success) {
        toast.success('Leave request withdrawn successfully.');
        setLeaves((prev) => prev.filter((l) => l.id !== deleteId));
      } else {
        toast.error(res.message || 'Failed to withdraw request.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to withdraw request.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Helper to parse leave type prefix from reason string
  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    const { type, reason } = parseLeaveDetails(leave.leave_reason);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      reason.toLowerCase().includes(q) ||
      type.toLowerCase().includes(q) ||
      leave.start_date.includes(q) ||
      leave.end_date.includes(q) ||
      (leave.remarks && leave.remarks.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

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
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Leave Application History
              </h1>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                View, search, and track all your submitted leave records ({leaves.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Search & Status Filter Controls */}
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
              placeholder="Search by reason, type, or date"
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

      {/* Leave Requests Table Card */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredLeaves.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              title={searchQuery || statusFilter !== 'All' ? 'No matching leave records' : 'No leave records found'}
              description={
                searchQuery || statusFilter !== 'All'
                  ? 'Try clearing your search query or changing status filters.'
                  : 'You have not submitted any leave applications yet.'
              }
              action={
                searchQuery || statusFilter !== 'All' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }}
                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                ) : undefined
              }
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
                  <th className="py-3.5 px-4 sm:px-6">Leave Type</th>
                  <th className="py-3.5 px-4 sm:px-6">Dates & Duration</th>
                  <th className="py-3.5 px-4 sm:px-6">Reason</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Manager Remarks</th>
                  <th className="py-3.5 px-4 sm:px-6">Attachment</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
                {filteredLeaves.map((leave) => {
                  const requestedDays = calculateDurationDays(leave.start_date, leave.end_date);
                  const approvedStart = leave.approved_start_date || leave.start_date;
                  const approvedEnd = leave.approved_end_date || leave.end_date;
                  const approvedDays = calculateDurationDays(approvedStart, approvedEnd);
                  const isPartiallyApproved = leave.status === 'Partially Approved' || (leave.approved_start_date && leave.approved_start_date !== leave.start_date);

                  const { type, reason } = parseLeaveDetails(leave.leave_reason);
                  const isPending = leave.status === 'Pending';

                  return (
                    <tr
                      key={leave.id}
                      className={`transition-colors ${isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'}`}
                    >
                      {/* Leave Type */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
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
                      <td
                        className={`py-4 px-4 sm:px-6 font-medium whitespace-nowrap ${
                          isDark ? 'text-stone-200' : 'text-stone-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
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
                                  Req: {requestedDays}d ({formatDate(leave.start_date)} – {formatDate(leave.end_date)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className={`py-4 px-4 sm:px-6 max-w-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                        <p className="line-clamp-2 font-medium" title={reason}>
                          {reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <LeaveStatusBadge status={leave.status} />
                      </td>

                      {/* Remarks */}
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        {leave.remarks ? (
                          <div className={`flex items-start space-x-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span
                              className={`text-[11px] leading-relaxed italic px-2.5 py-1 rounded-lg border ${
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
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold border rounded-xl transition-colors ${
                              isDark
                                ? 'bg-[#33302C] hover:bg-[#3D3833] text-stone-200 border-[#3D3833]'
                                : 'bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 border-[#E2DBD0]'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>View / Download</span>
                          </button>
                        ) : (
                          <span
                            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              isDark ? 'text-stone-500 bg-[#22201D]' : 'text-stone-400 bg-stone-100'
                            }`}
                          >
                            None
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Request Details Button */}
                          <button
                            type="button"
                            onClick={() => setViewingLeave(leave)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? 'text-stone-400 hover:text-white hover:bg-[#33302C]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
                            }`}
                            title="View request details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Withdraw Button if Pending */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(leave.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Withdraw leave request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        documentUrl={selectedDocUrl}
      />

      {/* Leave Details Modal */}
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

            return (
              <div className="space-y-4 text-xs">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-500">{type} Leave</span>
                    <LeaveStatusBadge status={viewingLeave.status} />
                  </div>
                  <span className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    ID: #{viewingLeave.id}
                  </span>
                </div>

                {/* Dates & Duration Grid */}
                <div
                  className={`p-3.5 rounded-xl border grid grid-cols-2 gap-3 ${
                    isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Approved Duration
                    </p>
                    <p className="font-extrabold text-sm text-emerald-400">{approvedDays} {approvedDays === 1 ? 'Day' : 'Days'}</p>
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
                      Requested Start Date
                    </p>
                    <p className="font-medium text-stone-400">{formatDate(viewingLeave.start_date)}</p>
                  </div>

                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Requested End Date
                    </p>
                    <p className="font-medium text-stone-400">{formatDate(viewingLeave.end_date)}</p>
                  </div>
                </div>

                {/* Leave Reason */}
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Leave Reason
                  </p>
                  <div
                    className={`p-3 rounded-xl border leading-relaxed ${
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
                    <div
                      className={`p-3 rounded-xl border italic leading-relaxed ${
                        isDark ? 'bg-[#22201D] border-[#3D3833] text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      "{viewingLeave.remarks}"
                    </div>
                  </div>
                )}

                {/* Attachment */}
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Attachment Document
                  </p>
                  {viewingLeave.document_url ? (
                    <button
                      onClick={() => {
                        setSelectedDocUrl(viewingLeave.document_url!);
                      }}
                      className="w-full p-2.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Supporting Document</span>
                    </button>
                  ) : (
                    <p className={`text-xs italic ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>No document attached.</p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => setViewingLeave(null)}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                      isDark
                        ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:bg-[#3D3833]'
                        : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:bg-[#EAE2D3]'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Delete / Withdraw Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Withdraw Leave Request?"
        description="Are you sure you want to withdraw and cancel this pending leave application? This action cannot be undone."
        confirmType="danger"
        confirmText="Withdraw Request"
        isLoading={isDeleting}
      />
    </div>
  );
};

