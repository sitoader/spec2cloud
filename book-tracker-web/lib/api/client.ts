/**
 * API Client for making type-safe HTTP requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type-safe API client wrapper function
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options
 * @returns Parsed response data
 * @throws ApiError for non-2xx responses
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get JWT token from cookie if available
  const token = getTokenFromCookie();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Merge with existing headers if provided
  if (options?.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
    });
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData: unknown;
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = text;
      }
      
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    // Parse JSON response
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap network errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Get JWT token from cookie
 * @returns JWT token or null
 */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find((cookie) => 
    cookie.trim().startsWith('auth_token=')
  );
  
  if (!tokenCookie) {
    return null;
  }
  
  return tokenCookie.split('=')[1];
}
