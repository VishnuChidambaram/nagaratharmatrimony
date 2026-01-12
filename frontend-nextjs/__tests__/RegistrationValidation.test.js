import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '@/app/register/1/page';
import '@testing-library/jest-dom';

// Mock Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/register/1',
}));

// Mock useLanguage
jest.mock('@/app/hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    toggleLanguage: jest.fn(),
  }),
}));

// Mock TamilInput to simplify testing (since the real one uses complex transliteration logic)
// But we need to make sure it handles the 'error' prop correctly as we added it!
jest.mock('@/app/components/TamilInput', () => {
  return function DummyInput(props) {
    const testId = props.id || props.name;
    return (
      <div data-testid={`container-${testId}`}>
        <label>{props.label}</label>
        <input
          data-testid={testId}
          name={props.name}
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
          type={props.type}
        />
        {props.error && <span data-testid={`error-${testId}`} style={{color: 'red'}}>{props.error}</span>}
      </div>
    );
  };
});

global.fetch = jest.fn((url) => {
  if (url.includes('/check-auth')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: false }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({ success: true, data: [] }),
  });
});

describe('Registration Step 1 Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear session storage mock
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });
  });

  it('renders registration form step 1', () => {
    render(<Page />);
    expect(screen.getByText(/step 1 - basic details/i)).toBeInTheDocument();
    expect(screen.getByTestId('name')).toBeInTheDocument();
  });

  it('shows validation error for invalid pincode', async () => {
    render(<Page />);
    const pincodeInput = screen.getByTestId('pincode');
    
    // Invalid pincode: too short
    fireEvent.change(pincodeInput, { target: { name: 'pincode', value: '123' } });
    fireEvent.blur(pincodeInput);

    await waitFor(() => {
      expect(screen.getByTestId('error-pincode')).toHaveTextContent(/pincode must be 6 digits/i);
    });

    // Valid pincode: 6 digits
    fireEvent.change(pincodeInput, { target: { name: 'pincode', value: '600001' } });
    fireEvent.blur(pincodeInput);

    await waitFor(() => {
      expect(screen.queryByTestId('error-pincode')).not.toBeInTheDocument();
    });
  });

  it('prevents navigation if fields are missing', async () => {
    render(<Page />);
    
    // Click Next without filling mandatory fields
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    // In our implementation, we added real-time errors.
    await waitFor(() => {
        expect(screen.getByTestId('error-name')).toBeInTheDocument();
    });
    
    expect(mockPush).not.toHaveBeenCalled();
  });
});
