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

jest.mock('@/app/hooks/useLanguage', () => {
  return {
    useLanguage: () => ({
      language: 'en',
      toggleLanguage: jest.fn(),
    }),
  };
});

global.fetch = jest.fn();

describe('Dashboard Page', () => {
  const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    
    // Clean Session Storage Mock
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });
    
    // Mock scrolling functions
    window.scrollTo = jest.fn();
    if (typeof Element !== 'undefined') {
      Element.prototype.scrollTo = jest.fn();
    }
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
    window.sessionStorage.getItem.mockReturnValue('test@example.com');
    
    // Mock API success
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: [{ id: 1, name: 'Test User', email: 'other@example.com' }] 
      }),
    });

    render(<Dashboard />);
    
    // 1. Initial view: Click "Other Profiles" card to see members
    await waitFor(() => {
        expect(screen.getByText(/all other profiles/i)).toBeInTheDocument();
    });
    
    const { fireEvent } = require('@testing-library/react');
    fireEvent.click(screen.getByText(/all other profiles/i));

    // 2. Dashboard should now show members, wait for "Test User"
    await waitFor(() => {
        try {
          expect(screen.getByText(/test user/i)).toBeInTheDocument();
        } catch (e) {
          screen.debug();
          throw e;
        }
    });
  });

  it('shows loading spinner while fetching data', async () => {
    window.sessionStorage.getItem.mockReturnValue('test@example.com');
    
    // Mock a slow response
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetch.mockReturnValue(fetchPromise);

    render(<Dashboard />);
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    // Cleanup by resolving fetch
    resolveFetch({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
  });

  it('shows error message and retry button on API failure', async () => {
    window.sessionStorage.getItem.mockReturnValue('test@example.com');
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: 'Server explosion' }),
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });
});
