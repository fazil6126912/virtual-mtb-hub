import { format, parseISO, isToday, isTomorrow, differenceInMinutes, isAfter, startOfToday } from 'date-fns';
import type { Meeting } from '@/lib/storage';

/**
 * Format a 24-hour time string (HH:mm) to 12-hour format with AM/PM
 */
export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'h:mm a');
};

/**
 * Format meeting date for display
 */
export const formatMeetingDateDisplay = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d, yyyy');
};

/**
 * Format meeting date short (for lists)
 */
export const formatMeetingDateShort = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, d MMM');
};

/**
 * Check if Join button should be enabled (5 minutes before meeting, up to 60 min after start)
 */
export const isJoinEnabled = (meeting: Meeting): boolean => {
  const now = new Date();
  // Parse the date and time correctly without timezone issues
  const [year, month, day] = meeting.scheduled_date.split('-').map(Number);
  const [hours, minutes] = meeting.scheduled_time.split(':').map(Number);
  
  // Create date in local timezone
  const meetingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  const minutesUntilMeeting = differenceInMinutes(meetingDateTime, now);
  // Enable 5 min before, disable 60 min after start
  return minutesUntilMeeting <= 5 && minutesUntilMeeting >= -60;
};

/**
 * Create a date string (YYYY-MM-DD) from a Date object in local timezone
 * This prevents timezone shifting issues
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string (YYYY-MM-DD) to Date in local timezone
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get meeting datetime for sorting
 */
export const getMeetingDateTime = (meeting: Meeting): Date => {
  const [year, month, day] = meeting.scheduled_date.split('-').map(Number);
  const [hours, minutes] = meeting.scheduled_time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Sort meetings chronologically (earliest first)
 */
export const sortMeetingsChronologically = (meetings: Meeting[]): Meeting[] => {
  return [...meetings].sort((a, b) => {
    const dateA = getMeetingDateTime(a);
    const dateB = getMeetingDateTime(b);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Filter and sort upcoming meetings (today and future)
 */
export const getUpcomingMeetingsSorted = (meetings: Meeting[]): Meeting[] => {
  const now = new Date();
  const todayStart = startOfToday();
  
  return meetings
    .filter(m => {
      const meetingDate = parseLocalDate(m.scheduled_date);
      const meetingDateTime = getMeetingDateTime(m);
      // Include if meeting date is today or later, and meeting hasn't ended (60 min grace)
      const isUpcoming = isAfter(meetingDate, todayStart) || format(meetingDate, 'yyyy-MM-dd') === format(todayStart, 'yyyy-MM-dd');
      const minutesSinceStart = differenceInMinutes(now, meetingDateTime);
      const hasEnded = minutesSinceStart > 60; // Meeting considered ended 60 min after start
      return isUpcoming && !hasEnded;
    })
    .sort((a, b) => {
      const dateA = getMeetingDateTime(a);
      const dateB = getMeetingDateTime(b);
      return dateA.getTime() - dateB.getTime();
    });
};
