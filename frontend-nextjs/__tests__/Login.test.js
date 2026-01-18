import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '@/app/login/page';
import '@testing-library/jest-dom';

// 1. Mock Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Mock Config
jest.mock('@/app/utils/config', () => ({
  API_URL: 'http://localhost:5000',
}));

// 3. Mock Hooks
jest.mock('@/app/hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    toggleLanguage: jest.fn(),
  }),
}));

// 4. Mock Children Components
jest.mock('@/app/components/TamilInput', () => {
  return function DummyInput(props) {
    return (
      <input
        data-testid={props.id || props.name}
        name={props.name}
        onChange={props.onChange}
        value={props.value}
        type={props.type}
        placeholder={props.placeholder}
      />
    );
  };
});

global.fetch = jest.fn();

describe('Login Page', () => {
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
    
    // Default mock for fetch (handles logout on mount)
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('renders login form', async () => {
    render(<Login />);
    expect(screen.getByRole('heading', { level: 3, name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();
  });

  it('shows error on empty submission', async () => {
    render(<Login />);
    // Initial fetch for logout on mount
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/logout'), expect.anything());
    });
    
    fireEvent.click(screen.getByText('Login'));
    // Should NOT call login API if empty
    expect(fetch).toHaveBeenCalledTimes(1); 
  });

  it('calls login API and redirects on success', async () => {
    jest.useFakeTimers();

    // Prepare for login call (the second call)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }), // For logout
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, sessionId: '123' }), // For login
    });

    render(<Login />);

    // Wait for logout call
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/logout'), expect.anything());
    });

    fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Login'));

    // 1. Verify Login API Call
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/login'), expect.anything());
    });

    // 2. Verify Session Storage (immediate side effect)
    await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
    });

    // 3. Verify Redirect
    act(() => {
        // Advancing timers is not strictly necessary anymore as I removed the delay in a previous step 
        // but Login.js might still have some state updates.
        // Wait, Login.js line 116 says router.push("/dashboard") immediately.
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    jest.useRealTimers();
  });
});
