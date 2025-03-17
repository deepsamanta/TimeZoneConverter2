import { format, formatISO, parseISO, formatDistance } from 'date-fns';
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
    console.log('convertTime called with:', { sourceTimezone, targetTimezone, date, time });
    
    // Combine date and time
    const dateTimeString = `${date}T${time}:00`;
    console.log('dateTimeString:', dateTimeString);
    
    // Parse the input date as if it were in the source timezone
    const sourceDateObj = new Date(dateTimeString);
    console.log('sourceDateObj:', sourceDateObj);
    
    // Convert it to a zoned time in the source timezone
    console.log('Converting to source timezone:', sourceTimezone);
    const sourceZonedDate = toZonedTime(sourceDateObj, sourceTimezone);
    console.log('sourceZonedDate:', sourceZonedDate);
    
    // Get the target timezone date
    console.log('Converting to target timezone:', targetTimezone);
    const targetDate = toZonedTime(sourceDateObj, targetTimezone);
    console.log('targetDate:', targetDate);
    
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
  const now = new Date();
  const zonedTime = toZonedTime(now, timezone);
  const offsetInMinutes = (zonedTime.getTimezoneOffset() * -1);
  
  const hours = Math.floor(Math.abs(offsetInMinutes) / 60);
  const minutes = Math.abs(offsetInMinutes) % 60;
  
  const sign = offsetInMinutes >= 0 ? '+' : '-';
  
  return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Get ISO formatted date for input
export function getISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

// Get ISO formatted time for input
export function getISOTime(date: Date = new Date()): string {
  return format(date, 'HH:mm');
}
