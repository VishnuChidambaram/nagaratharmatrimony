import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import '@testing-library/jest-dom';

describe('DashboardHeader Search Dropdowns', () => {
  const mockProps = {
    view: 'search',
    setView: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    searchField: '',
    setSearchField: jest.fn(),
    currentUserTemple: 'Mathur',
    currentUserDivision: 'Arumbakkur',
    t: (key) => key,
  };

  it('renders a text input when a normal field is selected', () => {
    render(<DashboardHeader {...mockProps} searchField="name" />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Select Temple|Select Division/ })).not.toBeInTheDocument();
  });

  it('renders a temple dropdown when Temple field is selected', () => {
    render(<DashboardHeader {...mockProps} searchField="yourTemple" />);
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2); // Search Field and Temple Search
    expect(screen.getByText('Select Temple')).toBeInTheDocument();
  });

  it('filters out current user temple from the temple dropdown', () => {
    render(<DashboardHeader {...mockProps} searchField="yourTemple" />);
    expect(screen.queryByText('Mathur')).not.toBeInTheDocument();
    expect(screen.getByText('Nemam Kovil')).toBeInTheDocument();
  });

  it('renders a division dropdown when Division field is selected', () => {
    render(<DashboardHeader {...mockProps} searchField="yourDivision" />);
    expect(screen.getByText('Select Division')).toBeInTheDocument();
    expect(screen.getByText('Kazhani Vaasarkkudaiyar')).toBeInTheDocument();
  });

  it('filters out current user division from the division dropdown', () => {
    render(<DashboardHeader {...mockProps} searchField="yourDivision" />);
    expect(screen.queryByText('Arumbakkur')).not.toBeInTheDocument();
    expect(screen.getByText('Kazhani Vaasarkkudaiyar')).toBeInTheDocument();
  });

  it('clears searchTerm when searchField changes', () => {
    const setSearchTerm = jest.fn();
    const setSearchField = jest.fn();
    render(<DashboardHeader {...mockProps} setSearchTerm={setSearchTerm} setSearchField={setSearchField} />);
    
    const fieldSelect = screen.getByRole('combobox', { name: '' }); // The search-select
    fireEvent.change(fieldSelect, { target: { value: 'yourTemple' } });
    
    expect(setSearchField).toHaveBeenCalledWith('yourTemple');
    expect(setSearchTerm).toHaveBeenCalledWith('');
  });
});
