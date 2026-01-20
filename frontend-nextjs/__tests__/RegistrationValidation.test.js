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
    gender: '',
    password: '',
    confirmPassword: '',
    maritalStatus: '',
    fatherName: '',
    motherName: '',
    brothers: '',
    brothersMarried: '',
    sisters: '',
    sistersMarried: '',
    yourTemple: '',
    yourDivision: '',
    nativePlace: '',
    nativePlaceHouseName: '',
    presentResidence: '',
    pincode: '',
    referredBy: '',
    referralDetails1Name: '',
    referralDetails1Phone: '',
    referralDetails1Email: '',
    referralDetails2Name: '',
    referralDetails2Phone: '',
    referralDetails2Email: '',
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
          placeholder={props.placeholder}
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
    fireEvent.change(screen.getByTestId('motherName'), { target: { name: 'motherName', value: 'Mother Name' } });
    
    fireEvent.change(screen.getByDisplayValue(/select your temple/i), { target: { name: 'yourTemple', value: 'Nemam Kovil' } });
    
    fireEvent.change(screen.getByDisplayValue(/select number of brothers/i), { target: { name: 'brothers', value: '1' } });
    fireEvent.change(screen.getByDisplayValue(/select married number of brothers/i), { target: { name: 'brothersMarried', value: '0' } });
    fireEvent.change(screen.getByDisplayValue(/select number of sisters/i), { target: { name: 'sisters', value: '1' } });
    fireEvent.change(screen.getByDisplayValue(/select married number of sisters/i), { target: { name: 'sistersMarried', value: '0' } });

    fireEvent.change(screen.getByDisplayValue(/select native place/i), { target: { name: 'nativePlace', value: 'Karaikudi – 630001' } });
    fireEvent.change(screen.getByTestId('nativePlaceHouseName'), { target: { name: 'nativePlaceHouseName', value: 'House Name' } });

    // presentResidence is a TamilInput, name="presentResidence"
    fireEvent.change(screen.getByTestId('presentResidence'), { target: { name: 'presentResidence', value: 'Address line' } });
    fireEvent.change(screen.getByTestId('pincode'), { target: { name: 'pincode', value: '123456' } });
    fireEvent.change(screen.getByDisplayValue(/select profile created by/i), { target: { name: 'profileCreatedBy', value: 'Self' } });
    fireEvent.change(screen.getByDisplayValue(/select referred by/i), { target: { name: 'referredBy', value: 'Friends' } });
    
    // Referral 1
    const refNames = screen.getAllByPlaceholderText(/referral name/i);
    const refPhones = screen.getAllByPlaceholderText(/referral phone/i);
    const refEmails = screen.getAllByPlaceholderText(/referral email/i);

    fireEvent.change(refNames[0], { target: { name: 'referralDetails1Name', value: 'Ref 1' } });
    fireEvent.change(refPhones[0], { target: { name: 'referralDetails1Phone', value: '9876543210' } });
    fireEvent.change(refEmails[0], { target: { name: 'referralDetails1Email', value: 'ref1@test.com' } });

    // Referral 2
    fireEvent.change(refNames[1], { target: { name: 'referralDetails2Name', value: 'Ref 2' } });
    fireEvent.change(refPhones[1], { target: { name: 'referralDetails2Phone', value: '9876543211' } });
    fireEvent.change(refEmails[1], { target: { name: 'referralDetails2Email', value: 'ref2@test.com' } });

    const pincodeInput = screen.getByTestId('pincode');
    
    // Invalid pincode: too short
    fireEvent.change(pincodeInput, { target: { name: 'pincode', value: '123' } });
    
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      const allErrors = screen.queryAllByText(/required|must be|invalid/i);
      const errorTexts = allErrors.map(e => e.textContent).join(", ");
      if (errorTexts && !errorTexts.includes("Pincode must be a 6-digit number")) {
          throw new Error(`VALIDATION ERRORS FOUND: ${errorTexts}`);
      }
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
