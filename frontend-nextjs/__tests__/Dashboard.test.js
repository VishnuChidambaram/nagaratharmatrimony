import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import '@testing-library/jest-dom';

// Mock Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Dependencies
jest.mock('@/app/utils/config', () => ({
  API_URL: 'http://localhost:5000',
}));

jest.mock('@/app/hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    toggleLanguage: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clean Session Storage Mock
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });
    // No window.location hack needed anymore!
  });

  it('redirects to login if not authenticated', async () => {
    // Mock no session
    window.sessionStorage.getItem.mockReturnValue(null);
    
    // Mock check-auth API failure (if called)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    render(<Dashboard />);

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('renders dashboard content if authenticated', async () => {
    // Mock session
    window.sessionStorage.getItem.mockReturnValue('valid-session-id');
    
    // Mock API success
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: [{ id: 1, name: 'Test User', email: 'other@example.com' }] 
      }),
    });

    render(<Dashboard />);
    
    // Dashboard should make a fetch call to verify/get data
    await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
    });
  });
});
