import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { employeeService } from '../../services/employeeService.js';
import { User, LeaveRequest } from '../../types.js';
import { TableSkeleton } from '../../components/common/SkeletonLoader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Modal } from '../../components/common/Modal.js';
import { LeaveStatusBadge } from '../../components/common/LeaveStatusBadge.js';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal.js';
import { formatDate, calculateDurationDays } from '../../utils/formatters.js';
import {
  Users,
  Search,
  UserCheck,
  Calendar,
  Mail,
  AtSign,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Tag,
  Shield,
  Briefcase
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { isDark } = useTheme();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await employeeService.getAllEmployees({ search: searchQuery });
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const parseLeaveDetails = (reasonStr: string) => {
    if (!reasonStr) return { type: 'Annual', reason: '' };
    const match = reasonStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && match[1]) {
      return { type: match[1], reason: match[2] || reasonStr };
    }
    return { type: 'Annual', reason: reasonStr };
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
              Employee Directory
            </h1>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Registered organization staff members and individual leave metrics
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-stone-500' : 'text-stone-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or email"
            className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500 focus:border-blue-500'
                : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-[#FFFDF9] focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Directory Table */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833]' : 'bg-[#FCFAF7] border-[#E8E2D8] shadow-sm'
        }`}
      >
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : employees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No employees found"
              description={
                searchQuery
                  ? 'No staff member matched your search query.'
                  : 'There are currently no registered employee accounts.'
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
                  <th className="py-3.5 px-4 sm:px-6">Full Name / Account</th>
                  <th className="py-3.5 px-4 sm:px-6">Role</th>
                  <th className="py-3.5 px-4 sm:px-6">Date Joined</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Total Applied</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Approved</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Pending</th>
                  <th className="py-3.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? 'divide-[#3D3833]' : 'divide-[#E8E2D8]'}`}>
                {employees.map((emp) => {
                  const cleanUsername = emp.username?.includes('@') ? emp.username.split('@')[0] : (emp.username || 'user');
                  const displayName = emp.fullName && !emp.fullName.includes('@')
                    ? emp.fullName
                    : cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
                  const usernameHandle = `@${cleanUsername}`;
                  const companyEmailStr = emp.companyEmail || '';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`cursor-pointer transition-colors group ${
                        isDark ? 'hover:bg-[#33302C]' : 'hover:bg-[#F5F0E6]/50'
                      }`}
                    >
                      {/* Full Name (Primary) & Username/Email (Secondary) */}
                      <td className={`py-4 px-4 sm:px-6 font-semibold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm truncate group-hover:text-blue-500 transition-colors">
                              {displayName}
                            </p>
                            <p className={`text-[10px] font-mono ${isDark ? 'text-stone-400' : 'text-stone-500'} truncate`}>
                              {usernameHandle} {companyEmailStr ? `• ${companyEmailStr}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border capitalize ${
                            isDark
                              ? 'bg-[#22201D] text-stone-300 border-[#3D3833]'
                              : 'bg-[#F2ECE1] text-stone-800 border-[#E2DBD0]'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{emp.role}</span>
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td className={`py-4 px-4 sm:px-6 whitespace-nowrap ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{emp.created_at ? formatDate(emp.created_at) : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Total Applied */}
                      <td className={`py-4 px-4 sm:px-6 text-center font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                        {emp.total_leaves || 0}
                      </td>

                      {/* Approved */}
                      <td className="py-4 px-4 sm:px-6 text-center font-bold text-emerald-500">
                        {emp.approved_leaves || 0}
                      </td>

                      {/* Pending */}
                      <td className="py-4 px-4 sm:px-6 text-center font-bold text-amber-500">
                        {emp.pending_leaves || 0}
                      </td>

                      {/* Arrow indicator */}
                      <td className="py-4 px-2 text-right">
                        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'text-stone-400' : 'text-stone-500'
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`Employee Details - ${selectedEmployee.fullName && !selectedEmployee.fullName.includes('@') ? selectedEmployee.fullName : (selectedEmployee.username?.includes('@') ? selectedEmployee.username.split('@')[0] : selectedEmployee.username || 'Employee')}`}
          maxWidth="2xl"
        >
          {(() => {
            const cleanModalUsername = selectedEmployee.username?.includes('@')
              ? selectedEmployee.username.split('@')[0]
              : (selectedEmployee.username || 'user');
            const modalDisplayName = selectedEmployee.fullName && !selectedEmployee.fullName.includes('@')
              ? selectedEmployee.fullName
              : cleanModalUsername.charAt(0).toUpperCase() + cleanModalUsername.slice(1);
            const modalEmail = selectedEmployee.companyEmail || '';

            return (
              <div className="space-y-5 text-xs">
                {/* Top Identity Profile Card */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                      {modalDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {modalDisplayName}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1 mt-0.5">
                        <span className="text-blue-500 font-semibold">@{cleanModalUsername}</span>
                        {modalEmail && <span className={isDark ? 'text-stone-600' : 'text-stone-400'}>•</span>}
                        {modalEmail && (
                          <span className={`font-mono ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            {modalEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border capitalize ${
                    isDark ? 'bg-[#33302C] text-stone-200 border-[#3D3833]' : 'bg-[#F2ECE1] text-stone-800 border-[#E2DBD0]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedEmployee.role}</span>
                </span>
              </div>
            </div>

            {/* Quick Details Bar */}
            <div className="flex items-center justify-between px-1 text-stone-400 text-xs">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Date Joined:</span>
                <span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  {selectedEmployee.created_at ? formatDate(selectedEmployee.created_at) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-3.5 h-3.5 text-stone-500" />
                <span>Account ID:</span>
                <span className={`font-mono font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  #{selectedEmployee.id}
                </span>
              </div>
            </div>

            {/* Leave Metrics Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-3.5 rounded-xl border text-center ${
                  isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  Total Applied
                </p>
                <p className={`text-xl font-extrabold mt-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {selectedEmployee.total_leaves || 0}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center ${
                  isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider text-emerald-500`}>Approved</p>
                <p className="text-xl font-extrabold text-emerald-500 mt-1">
                  {selectedEmployee.approved_leaves || 0}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center ${
                  isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider text-amber-500`}>Pending</p>
                <p className="text-xl font-extrabold text-amber-500 mt-1">
                  {selectedEmployee.pending_leaves || 0}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center ${
                  isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider text-rose-500`}>Rejected</p>
                <p className="text-xl font-extrabold text-rose-500 mt-1">
                  {selectedEmployee.rejected_leaves || 0}
                </p>
              </div>
            </div>

            {/* Recent Leave History Section */}
            <div className="space-y-2 pt-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Leave History ({selectedEmployee.leaves?.length || 0})
              </h4>

              {!selectedEmployee.leaves || selectedEmployee.leaves.length === 0 ? (
                <div
                  className={`p-6 rounded-xl border text-center italic ${
                    isDark ? 'bg-[#22201D] border-[#3D3833] text-stone-500' : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-400'
                  }`}
                >
                  No leave applications recorded for this employee.
                </div>
              ) : (
                <div className={`border rounded-xl divide-y max-h-64 overflow-y-auto ${
                  isDark ? 'border-[#3D3833] divide-[#3D3833] bg-[#22201D]' : 'border-[#E2DBD0] divide-[#E8E2D8] bg-[#FAF7F2]'
                }`}>
                  {selectedEmployee.leaves.map((leave: LeaveRequest) => {
                    const days = calculateDurationDays(leave.start_date, leave.end_date);
                    const { type, reason } = parseLeaveDetails(leave.leave_reason);

                    return (
                      <div key={leave.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{type} Leave</span>
                            </span>
                            <span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                              {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              isDark ? 'bg-[#33302C] text-stone-400 border-[#3D3833]' : 'bg-[#F2ECE1] text-stone-700 border-[#E2DBD0]'
                            }`}>
                              {days} {days === 1 ? 'day' : 'days'}
                            </span>
                          </div>

                          <p className={`text-xs line-clamp-1 italic ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                            "{reason}"
                          </p>

                          {leave.remarks && (
                            <p className={`text-[11px] ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                              Remarks: {leave.remarks}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {leave.document_url && (
                            <button
                              type="button"
                              onClick={() => setViewDocumentUrl(leave.document_url!)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 font-semibold text-[11px] flex items-center space-x-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Document</span>
                            </button>
                          )}

                          <LeaveStatusBadge status={leave.status} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`pt-3 border-t flex justify-end ${isDark ? 'border-[#3D3833]' : 'border-[#E8E2D8]'}`}>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className={`px-4 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                  isDark
                    ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:bg-[#3D3833]'
                    : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:bg-[#EAE2D3]'
                }`}
              >
                Close Profile
              </button>
            </div>
          </div>
            );
          })()}
        </Modal>
      )}

      {/* Document Viewer Modal */}
      {viewDocumentUrl && (
        <DocumentViewerModal
          isOpen={!!viewDocumentUrl}
          onClose={() => setViewDocumentUrl(null)}
          documentUrl={viewDocumentUrl}
          employeeName={selectedEmployee?.fullName || selectedEmployee?.username}
        />
      )}
    </div>
  );
};
