import { format, parseISO } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';

// Get user's timezone
export const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Format date for display
export const formatDate = (dateString, timezone = getUserTimezone()) => {
    try {
        const date = parseISO(dateString);
        const zonedDate = utcToZonedTime(date, timezone);
        return formatInTimeZone(zonedDate, timezone, 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

// Format time for display
export const formatTime = (dateString, timezone = getUserTimezone()) => {
    try {
        const date = parseISO(dateString);
        const zonedDate = utcToZonedTime(date, timezone);
        return formatInTimeZone(zonedDate, timezone, 'h:mm a');
    } catch (error) {
        return 'Invalid time';
    }
};

// Format date and time for display
export const formatDateTime = (dateString, timezone = getUserTimezone()) => {
    try {
        const date = parseISO(dateString);
        const zonedDate = utcToZonedTime(date, timezone);
        return formatInTimeZone(zonedDate, timezone, 'MMM dd, yyyy h:mm a');
    } catch (error) {
        return 'Invalid date/time';
    }
};

// Get timezone abbreviation
export const getTimezoneAbbr = (timezone = getUserTimezone()) => {
    try {
        const date = new Date();
        return formatInTimeZone(date, timezone, 'z');
    } catch (error) {
        return 'UTC';
    }
};

// Check if date is in the past
export const isPast = (dateString) => {
    try {
        const date = parseISO(dateString);
        return date < new Date();
    } catch (error) {
        return false;
    }
};

// Check if date is today
export const isToday = (dateString) => {
    try {
        const date = parseISO(dateString);
        const today = new Date();
        return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    } catch (error) {
        return false;
    }
}; 