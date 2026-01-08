export function getDateForDayIndex(weekStart: Date, dayIndex: number): Date {
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + dayIndex);
  return date;
}


