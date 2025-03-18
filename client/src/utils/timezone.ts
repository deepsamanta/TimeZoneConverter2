import { format, formatISO, parseISO, formatDistance } from 'date-fns';
import { toZonedTime, zonedTimeToUtc } from 'date-fns-tz';

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
    console.log('convertTime called with:', { sourceTimezone, targetTimezone, date, time });
    
    // Combine date and time into an ISO string
    const dateTimeString = `${date}T${time}:00`;
    console.log('dateTimeString:', dateTimeString);
    
    // Create a source date object with correct timezone information
    // This converts the input time, which is specified as being in the source timezone,
    // to a JavaScript Date object with the correct UTC time
    const sourceDate = new Date(dateTimeString);
    console.log('Source date (local):', sourceDate);
    
    // Convert to zoned time in source timezone to display the time
    const sourceZonedDate = toZonedTime(sourceDate, sourceTimezone);
    console.log('Source date (zoned):', sourceZonedDate);
    
    // Convert to UTC first, considering it was originally in the source timezone
    const utcDate = zonedTimeToUtc(sourceDate, sourceTimezone);
    console.log('UTC date:', utcDate);
    
    // Then convert the UTC date to the target timezone
    const targetDate = toZonedTime(utcDate, targetTimezone);
    console.log('Target date:', targetDate);
    
    // Format the results
    const sourceTime = format(sourceZonedDate, 'h:mm a');
    const targetTime = format(targetDate, 'h:mm a');
    const targetDateStr = format(targetDate, 'MMMM d, yyyy');
    
    // Calculate difference
    const difference = formatTimeDifference(sourceZonedDate, targetDate);
    
    const result = {
      sourceTime,
      targetTime,
      targetDate: targetDateStr,
      difference
    };
    
    console.log('Conversion result:', result);
    return result;
  } catch (error) {
    console.error('Error converting time:', error);
    throw new Error(`Failed to convert time between timezones: ${error instanceof Error ? error.message : String(error)}`);
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

// Get time offset for display
export function getTimezoneOffset(timezone: string): string {
  try {
    // Use a reference date (now) to avoid DST issues
    const now = new Date();
    
    // Get the local time
    const localTime = now.getTime();
    
    // Get the time in the specified timezone
    const zonedTime = toZonedTime(now, timezone);
    
    // Calculate the UTC time for the zoned time
    const utcTime = Date.UTC(
      zonedTime.getUTCFullYear(),
      zonedTime.getUTCMonth(),
      zonedTime.getUTCDate(),
      zonedTime.getUTCHours(),
      zonedTime.getUTCMinutes(),
      zonedTime.getUTCSeconds()
    );
    
    // Calculate the offset between the zoned time and UTC in minutes
    // We need to handle DST correctly by looking at the actual difference
    const offsetInMs = localTime - utcTime;
    const offsetInMinutes = Math.round(offsetInMs / (1000 * 60));
    
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
