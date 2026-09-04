import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  subDays, 
  addDays, 
  isSameDay, 
  getDaysInMonth, 
  startOfMonth,
  endOfMonth,
  getDay
} from 'date-fns';

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateDisplay(dateStr: string, pattern: string = 'EEE, MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern);
  } catch (e) {
    return dateStr;
  }
}

export function getDaysInCurrentMonth(year: number, monthZeroIndexed: number): number {
  return getDaysInMonth(new Date(year, monthZeroIndexed));
}

export function getMonthDaysArray(year: number, monthZeroIndexed: number): Array<{ dayNumber: number; dateString: string; dayOfWeek: number }> {
  const totalDays = getDaysInMonth(new Date(year, monthZeroIndexed));
  const days = [];
  
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthZeroIndexed, d);
    const dateString = format(dateObj, 'yyyy-MM-dd');
    days.push({
      dayNumber: d,
      dateString,
      dayOfWeek: getDay(dateObj) // 0=Sun, 1=Mon, ..., 6=Sat
    });
  }
  return days;
}

export function getLastNDays(n: number, endDateStr?: string): string[] {
  const end = endDateStr ? parseISO(endDateStr) : new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(format(subDays(end, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function getWeekDays(referenceDate: Date = new Date()): string[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Mon
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sun
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
}

export function isScheduledDay(dateStr: string, frequencyType: string, frequencyDays: number[]): boolean {
  const dateObj = parseISO(dateStr);
  const dayOfWeek = getDay(dateObj); // 0=Sun, 1=Mon...6=Sat

  if (frequencyType === 'daily') return true;
  if (frequencyType === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (frequencyType === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
  if (frequencyType === 'specific_days' || frequencyType === 'custom') {
    return frequencyDays ? frequencyDays.includes(dayOfWeek) : true;
  }
  return true;
}
