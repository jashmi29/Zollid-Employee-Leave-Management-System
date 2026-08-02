export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and end
  return diffDays > 0 ? diffDays : 0;
}

export function getStatusBadgeStyle(status: 'Pending' | 'Approved' | 'Rejected'): string {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Rejected':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'Pending':
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
}
