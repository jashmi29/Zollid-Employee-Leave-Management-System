export function validateLeaveDates(startDate: string, endDate: string): string | null {
  if (!startDate) return 'Start date is required.';
  if (!endDate) return 'End date is required.';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date format.';
  }

  // Prevent selecting dates prior to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
  const startMidnight = new Date(sYear, sMonth - 1, sDay);

  if (startMidnight < today) {
    return 'Cannot apply for leave on past dates. Please select today or a future date.';
  }

  if (end < start) {
    return 'End date cannot be prior to start date.';
  }

  return null;
}

export function checkLeaveOverlap(
  startDate: string,
  endDate: string,
  existingLeaves: { start_date: string; end_date: string; status: string }[]
): string | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

  for (const leave of existingLeaves) {
    if (leave.status === 'Pending' || leave.status === 'Approved') {
      const existingStart = new Date(leave.start_date);
      const existingEnd = new Date(leave.end_date);

      if (!isNaN(existingStart.getTime()) && !isNaN(existingEnd.getTime())) {
        if (start <= existingEnd && end >= existingStart) {
          return `Selected dates (${startDate} to ${endDate}) overlap with an existing ${leave.status.toLowerCase()} leave request (${leave.start_date} to ${leave.end_date}).`;
        }
      }
    }
  }

  return null;
}

export function validateFile(file: File | null): string | null {
  if (!file) return null; // Optional

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file format. Only PDF, JPG, and PNG documents are allowed.';
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'File size exceeds 10MB limit.';
  }

  return null;
}

