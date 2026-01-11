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
        data-testid={props.id}
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
    
    // Reset window.location mock if previously messed up (JSDOM usually resets, but good to be safe)
    // We cannot delete window.location in new JSDOM, so we leave it alone as we use router.push now!
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { level: 3, name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();
  });

  it('shows error on empty submission', () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Login'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls login API and redirects on success', async () => {
    jest.useFakeTimers();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, sessionId: '123' }),
    });

    render(<Login />);

    fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Login'));

    // 1. Verify API Call
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    // 2. Verify Session Storage (immediate side effect)
    await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
    });

    // 3. Verify Redirect (delayed side effect)
    // Advance timers by 2 seconds (setTimeout in Login.js)
    act(() => {
        jest.advanceTimersByTime(2500);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    jest.useRealTimers();
  });
});
