/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
} 