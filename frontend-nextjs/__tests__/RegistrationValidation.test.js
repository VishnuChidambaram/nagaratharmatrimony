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

// Mock styles storage functions to avoid IndexedDB issues in Jest
jest.mock('@/app/register/styles', () => ({
  ...jest.requireActual('@/app/register/styles'),
  loadFormData: jest.fn(() => Promise.resolve({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    maritalStatus: '',
    fatherName: '',
    yourTemple: '',
    presentResidence: '',
    pincode: '',
    profileCreatedBy: '',
  })),
  saveFormData: jest.fn(() => Promise.resolve()),
}));

// Mock TamilInput
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
  });

  it('renders registration form step 1', async () => {
    render(<Page />);
    await waitFor(() => {
        expect(screen.getByText(/step 1 - basic details/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('name')).toBeInTheDocument();
  });

  it('shows validation error for invalid pincode', async () => {
    render(<Page />);
    
    // Wait for initial load
    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());

    // Fill ALL required fields to reach pincode validation
    fireEvent.change(screen.getByTestId('name'), { target: { name: 'name', value: 'John Doe' } });
    fireEvent.change(screen.getByDisplayValue(/select gender/i), { target: { name: 'gender', value: 'Male' } });
    fireEvent.change(screen.getByPlaceholderText(/create password/i), { target: { name: 'password', value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { name: 'confirmPassword', value: 'Password123!' } });
    fireEvent.change(screen.getByDisplayValue(/select marital status/i), { target: { name: 'maritalStatus', value: 'unmarried' } });
    
    // fatherName is a TamilInput, name="fatherName"
    fireEvent.change(screen.getByTestId('fatherName'), { target: { name: 'fatherName', value: 'Father Name' } });
    
    fireEvent.change(screen.getByDisplayValue(/select your temple/i), { target: { name: 'yourTemple', value: 'Nemam Kovil' } });
    
    // presentResidence is a TamilInput, name="presentResidence"
    fireEvent.change(screen.getByTestId('presentResidence'), { target: { name: 'presentResidence', value: 'Address line' } });

    fireEvent.change(screen.getByDisplayValue(/select profile created by/i), { target: { name: 'profileCreatedBy', value: 'Self' } });

    const pincodeInput = screen.getByTestId('pincode');
    
    // Invalid pincode: too short
    fireEvent.change(pincodeInput, { target: { name: 'pincode', value: '123' } });
    
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/pincode must be a 6-digit number/i)).toBeInTheDocument();
    });
  });

  it('prevents navigation if fields are missing', async () => {
    render(<Page />);
    
    // Click Next without filling mandatory fields
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    
    expect(mockPush).not.toHaveBeenCalled();
  });
});
