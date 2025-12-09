import { apiClient, ApiError } from './client';

// Mock fetch
global.fetch = jest.fn();

// Mock document.cookie for token tests
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = '';
  });

  describe('successful requests', () => {
    it('should send requests to correct endpoint with base URL', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient<{ data: string }>('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include authentication header when token is present', async () => {
      document.cookie = 'auth_token=test-token-123';
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient<{ data: string }>('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should parse JSON response correctly', async () => {
      const mockResponse = { id: 1, name: 'Test User', email: 'test@example.com' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient<{ id: number; name: string; email: string }>('/users/1');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should throw ApiError for non-2xx responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(apiClient('/not-found')).rejects.toThrow(ApiError);
    });

    it('should include response data in ApiError', async () => {
      const errorResponse = { message: 'Validation failed', errors: ['Invalid email'] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
      });

      try {
        await apiClient('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.status).toBe(400);
          expect(error.response).toEqual(errorResponse);
        }
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient('/test')).rejects.toThrow(ApiError);
    });

    it('should handle non-JSON error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
        text: async () => 'Server error',
      });

      await expect(apiClient('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('request options', () => {
    it('should pass custom headers', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-custom-header': 'custom-value', // Headers normalizes to lowercase
          }),
        })
      );
    });

    it('should pass custom request options', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient('/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });
  });
});
