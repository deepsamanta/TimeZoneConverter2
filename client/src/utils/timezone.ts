import { format, formatISO, parseISO, addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

// Convert time between timezones
export function convertTime(
  sourceTimezone: string,
  targetTimezone: string,
  date: string,
  time: string
): { sourceTime: string; targetTime: string; targetDate: string; difference: string } {
  try {
    // Combine date and time into an ISO string
    const dateTimeString = `${date}T${time}:00`;

    // Create a Date object from the input
    const utcDate = new Date(dateTimeString);
    
    // Convert to source timezone
    const sourceDate = toZonedTime(utcDate, sourceTimezone);
    
    // Convert to target timezone
    const targetDate = toZonedTime(utcDate, targetTimezone);
    
    // Format the results for display
    const sourceTime = format(sourceDate, 'h:mm a');
    const targetTime = format(targetDate, 'h:mm a');
    const targetDateStr = format(targetDate, 'MMMM d, yyyy');
    
    // Calculate human-readable time difference
    const difference = formatTimeDifference(sourceDate, targetDate);
    
    return {
      sourceTime,
      targetTime,
      targetDate: targetDateStr,
      difference
    };
  } catch (error) {
    console.error('Error converting time:', error);
    throw new Error('Failed to convert time between timezones');
  }
}

// Get current time for a timezone
export function getCurrentTime(timezone: string): { time: string; date: string } {
  try {
    const now = new Date();
    const zonedTime = toZonedTime(now, timezone);
    
    return {
      time: format(zonedTime, 'h:mm a'),
      date: format(zonedTime, 'MMMM d, yyyy')
    };
  } catch (error) {
    console.error('Error getting current time:', error);
    throw new Error('Failed to get current time for timezone');
  }
}

// Format time difference between two dates
export function formatTimeDifference(date1: Date, date2: Date): string {
  const diffInHours = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
  const hours = Math.floor(Math.abs(diffInHours));
  const minutes = Math.floor((Math.abs(diffInHours) - hours) * 60);
  
  const sign = diffInHours >= 0 ? '+' : '-';
  
  if (hours === 0 && minutes === 0) {
    return 'Now';
  }
  
  if (minutes === 0) {
    return `${sign}${hours}h`;
  }
  
  return `${sign}${hours}h ${minutes}m`;
}

// Get formatted timezone offset string for display
export function getFormattedOffset(timezone: string): string {
  try {
    // Use a reference date (now)
    const now = new Date();
    
    // Convert to the target timezone
    const zonedTime = toZonedTime(now, timezone);
    
    // Get timezone offset in minutes from the Date object
    // getTimezoneOffset returns the offset in minutes from UTC
    const offsetInMinutes = -(now.getTimezoneOffset() - zonedTime.getTimezoneOffset());
    
    // Format the offset string
    const hours = Math.floor(Math.abs(offsetInMinutes) / 60);
    const minutes = Math.abs(offsetInMinutes) % 60;
    const sign = offsetInMinutes >= 0 ? '+' : '-';
    
    return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return 'GMT+00:00'; // Default to UTC if there's an error
  }
}

// Get ISO formatted date for input
export function getISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

// Get ISO formatted time for input
export function getISOTime(date: Date = new Date()): string {
  return format(date, 'HH:mm');
}
