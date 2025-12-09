import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for conditional class names using clsx
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
