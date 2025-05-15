/**
 * Safely checks if a string includes a substring, handling null/undefined values
 */
export function safeIncludes(str: string | null | undefined, searchValue: string): boolean {
  if (!str) return false;
  return str.includes(searchValue);
}

/**
 * Safely gets a string's length, handling null/undefined values
 */
export function safeLength(str: string | null | undefined): number {
  if (!str) return 0;
  return str.length;
}

/**
 * Safely converts a value to lowercase, handling null/undefined values
 */
export function safeLowercase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase();
}

/**
 * Safely gets the first character of a string, handling null/undefined values
 */
export function safeFirstChar(str: string | null | undefined): string {
  if (!str || str.length === 0) return '';
  return str[0];
}