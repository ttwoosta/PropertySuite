import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Expenses } from './Expenses';
import type { ReceiptWithKind } from './entries';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('./data', () => ({
  CATEGORIES: [
    { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
    { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
  ],
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  gbp: (n: number) => `£${n}`,
}));

vi.mock('./charts', () => ({
  Donut: ({ total }: any) => <div data-testid="donut">Total: £{total}</div>,
}));

vi.mock('./entries', () => ({
  KindChip: ({ kind }: any) => <span data-testid={`kind-${kind}`} />,
}));

vi.mock('../../ds-vendor/components', () => ({
  Card: ({ children, style, padding }: any) => <div data-testid="card" style={style}>{children}</div>,
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

const mockReceipt: ReceiptWithKind = {
  id: 'rc1', merchant: 'British Gas', cat: 'maint', date: '2026-05-01', amount: 120, kind: 'pdf',
};

const defaultProps = {
  houseId: 'h1',
  year: 2026,
  links: {},
  receipts: [],
  vals: {},
  onAddEntry: vi.fn(),
  onEditEntry: vi.fn(),
  onAttach: vi.fn(),
  onView: vi.fn(),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Expenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<Expenses {...defaultProps} isLoading />);
      expect(screen.getByTestId('expenses-loading')).toBeInTheDocument();
    });

    it('does not render the donut chart while loading', () => {
      render(<Expenses {...defaultProps} isLoading />);
      expect(screen.queryByTestId('donut')).not.toBeInTheDocument();
    });
  });

  // done ─────────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('renders the heading with the correct year', () => {
      render(<Expenses {...defaultProps} />);
      expect(screen.getByText('Expenses · 2026')).toBeInTheDocument();
    });

    it('renders category rows from CATEGORIES', () => {
      render(<Expenses {...defaultProps} />);
      // Each category name appears in both the donut legend and the accordion header
      expect(screen.getAllByText('Maintenance').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Property Tax').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the Donut chart', () => {
      render(<Expenses {...defaultProps} />);
      expect(screen.getByTestId('donut')).toBeInTheDocument();
    });

    it('calls onAddEntry with the open category when Add entry is clicked', () => {
      render(<Expenses {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /add entry/i }));
      expect(defaultProps.onAddEntry).toHaveBeenCalledWith('maint');
    });

    it('expands a category section when the category header is clicked', () => {
      render(<Expenses {...defaultProps} />);
      // Maintenance is open by default so Jan is already visible; clicking its header closes it
      const maintHeaders = screen.getAllByText('Maintenance');
      // The accordion header button is the one inside a <button> — click it to close
      fireEvent.click(maintHeaders[maintHeaders.length - 1]);
      // Maintenance months should now be hidden
      expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    });

    it('shows formatted amounts for entries present in vals', () => {
      render(<Expenses {...defaultProps} vals={{ 'maint-0': 250 }} />);
      // £250 appears both in the legend YTD total and the expanded Jan row
      expect(screen.getAllByText('£250').length).toBeGreaterThanOrEqual(2);
    });
  });

  // fail ─────────────────────────────────────────────────────────────────────

  describe('fail', () => {
    it('shows an error state when error prop is set', () => {
      render(<Expenses {...defaultProps} error="Failed to load expenses" />);
      expect(screen.getByTestId('expenses-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load expenses/i)).toBeInTheDocument();
    });

    it('does not render category rows in error state', () => {
      render(<Expenses {...defaultProps} error="Server error 500" />);
      expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();
    });

    it('shows a Retry button in the error state', () => {
      render(<Expenses {...defaultProps} error="Server error" onRetry={vi.fn()} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // retry ────────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('calls onRetry when the Retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<Expenses {...defaultProps} error="Server error" onRetry={onRetry} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render a Retry button when onRetry is not provided', () => {
      render(<Expenses {...defaultProps} error="Server error" />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  // offline ──────────────────────────────────────────────────────────────────

  describe('offline', () => {
    it('shows an offline state for ERR_INTERNET_DISCONNECTED errors', () => {
      render(
        <Expenses {...defaultProps} error="net::ERR_INTERNET_DISCONNECTED" onRetry={vi.fn()} />,
      );
      expect(screen.getByTestId('expenses-offline')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/i)).toBeInTheDocument();
    });

    it('shows an offline state for Firestore unavailable errors', () => {
      render(
        <Expenses {...defaultProps} error="The service is currently unavailable" onRetry={vi.fn()} />,
      );
      expect(screen.getByTestId('expenses-offline')).toBeInTheDocument();
    });

    it('shows a Retry button in the offline state', () => {
      const onRetry = vi.fn();
      render(<Expenses {...defaultProps} error="net::ERR_INTERNET_DISCONNECTED" onRetry={onRetry} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
