import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Houses } from './Houses';
import type { House, Room } from './data';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('./data', () => ({
  gbp: (n: number) => `£${n}`,
}));

vi.mock('../../ds-vendor/components', () => ({
  Card: ({ children, style, padding }: any) => <div data-testid="card" style={style}>{children}</div>,
  Badge: ({ children, tone, size }: any) => <span data-testid={`badge-${tone}`} data-size={size}>{children}</span>,
  Button: ({ children, onClick, variant, leadingIcon }: any) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  ),
  IconButton: ({ children, onClick, label }: any) => (
    <button onClick={onClick} aria-label={label}>{children}</button>
  ),
}));

vi.mock('../../components/ui', () => ({
  di: () => null,
}));

// ── Test data ──────────────────────────────────────────────────────────────

const mockRoom: Room = {
  id: 'r1', unit: 'Room 1', tenant: 'Alice', rent: 600, paid: 600, status: 'Paid', beds: 1,
};

const mockHouse: House = {
  id: 'h1',
  name: 'Maple Court',
  address: '1 Maple St, London',
  rooms: [
    mockRoom,
    { id: 'r2', unit: 'Room 2', tenant: 'Bob', rent: 640, paid: 320, status: 'Partial', beds: 1 },
    { id: 'r3', unit: 'Room 3', tenant: null, rent: 600, paid: 0, status: 'Vacant', beds: 1 },
  ],
};

const defaultCallbacks = {
  onAddRent: vi.fn(),
  onEditRoom: vi.fn(),
  onAddHouse: vi.fn(),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Houses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<Houses house={mockHouse} isLoading {...defaultCallbacks} />);
      expect(screen.getByTestId('houses-loading')).toBeInTheDocument();
    });

    it('shows loading indicator when house is undefined', () => {
      render(<Houses house={undefined} {...defaultCallbacks} />);
      expect(screen.getByTestId('houses-loading')).toBeInTheDocument();
    });

    it('does not render room rows while loading', () => {
      render(<Houses house={mockHouse} isLoading {...defaultCallbacks} />);
      expect(screen.queryByText('Room 1')).not.toBeInTheDocument();
    });
  });

  // done ─────────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('renders the house name and address', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      expect(screen.getByText('Maple Court')).toBeInTheDocument();
      expect(screen.getByText('1 Maple St, London')).toBeInTheDocument();
    });

    it('renders a row for each room', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('Room 2')).toBeInTheDocument();
      expect(screen.getByText('Room 3')).toBeInTheDocument();
    });

    it('shows "Vacant" for rooms with no tenant', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      // Both the tenant text div and the status badge show "Vacant" for vacant rooms
      expect(screen.getAllByText('Vacant').length).toBeGreaterThanOrEqual(2);
    });

    it('calls onAddHouse when the Add house button is clicked', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      fireEvent.click(screen.getByRole('button', { name: /add house/i }));
      expect(defaultCallbacks.onAddHouse).toHaveBeenCalledTimes(1);
    });

    it('calls onEditRoom with the correct room when the edit button is clicked', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      const editButtons = screen.getAllByRole('button', { name: /edit room/i });
      fireEvent.click(editButtons[0]);
      expect(defaultCallbacks.onEditRoom).toHaveBeenCalledWith(mockRoom);
    });

    it('calls onAddRent with the correct room when Add rent is clicked', () => {
      render(<Houses house={mockHouse} {...defaultCallbacks} />);
      const addRentButtons = screen.getAllByRole('button', { name: /add rent/i });
      fireEvent.click(addRentButtons[0]);
      expect(defaultCallbacks.onAddRent).toHaveBeenCalledWith(mockRoom);
    });
  });

  // fail ─────────────────────────────────────────────────────────────────────

  describe('fail', () => {
    it('shows an error state when error prop is set', () => {
      render(<Houses house={mockHouse} error="Failed to load houses" {...defaultCallbacks} />);
      expect(screen.getByTestId('houses-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load houses/i)).toBeInTheDocument();
    });

    it('does not render room rows in error state', () => {
      render(<Houses house={mockHouse} error="Server error 500" {...defaultCallbacks} />);
      expect(screen.queryByText('Room 1')).not.toBeInTheDocument();
    });

    it('shows a Retry button in the error state', () => {
      render(<Houses house={mockHouse} error="Server error" onRetry={vi.fn()} {...defaultCallbacks} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // retry ────────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('calls onRetry when the Retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<Houses house={mockHouse} error="Server error" onRetry={onRetry} {...defaultCallbacks} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render a Retry button when onRetry is not provided', () => {
      render(<Houses house={mockHouse} error="Server error" {...defaultCallbacks} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  // offline ──────────────────────────────────────────────────────────────────

  describe('offline', () => {
    it('shows an offline state for ERR_INTERNET_DISCONNECTED errors', () => {
      render(
        <Houses
          house={mockHouse}
          error="net::ERR_INTERNET_DISCONNECTED"
          onRetry={vi.fn()}
          {...defaultCallbacks}
        />,
      );
      expect(screen.getByTestId('houses-offline')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/i)).toBeInTheDocument();
    });

    it('shows an offline state for Firestore unavailable errors', () => {
      render(
        <Houses
          house={mockHouse}
          error="The service is currently unavailable"
          onRetry={vi.fn()}
          {...defaultCallbacks}
        />,
      );
      expect(screen.getByTestId('houses-offline')).toBeInTheDocument();
    });

    it('shows a Retry button in the offline state', () => {
      const onRetry = vi.fn();
      render(
        <Houses
          house={mockHouse}
          error="net::ERR_INTERNET_DISCONNECTED"
          onRetry={onRetry}
          {...defaultCallbacks}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
