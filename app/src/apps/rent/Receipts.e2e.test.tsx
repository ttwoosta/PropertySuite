import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Receipts } from './Receipts';
import type { ReceiptWithKind } from './entries';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('./data', () => ({
  catById: {
    maint: { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
    tax: { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
  },
  gbp: (n: number) => `£${n}`,
}));

vi.mock('./entries', () => ({
  KindChip: ({ kind }: any) => <span data-testid={`kind-${kind}`} />,
}));

vi.mock('../../ds-vendor/components', () => ({
  Card: ({ children, style, padding, onClick, interactive }: any) => (
    <div data-testid="card" style={style} onClick={onClick} data-interactive={interactive}>{children}</div>
  ),
  Button: ({ children, onClick, variant, leadingIcon }: any) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  ),
}));

vi.mock('../../components/ui', () => ({
  di: () => null,
}));

// ── Test data ──────────────────────────────────────────────────────────────

const mockReceipts: ReceiptWithKind[] = [
  { id: 'rc1', merchant: 'British Gas', cat: 'maint', date: '2026-05-01', amount: 120, kind: 'pdf' },
  { id: 'rc2', merchant: 'Thames Water', cat: 'tax', date: '2026-04-15', amount: 80, kind: 'img', url: 'http://example.com/r2.png' },
];

const defaultCallbacks = {
  onUpload: vi.fn(),
  onView: vi.fn(),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Receipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<Receipts receipts={[]} isLoading {...defaultCallbacks} />);
      expect(screen.getByTestId('receipts-loading')).toBeInTheDocument();
    });

    it('does not render receipt cards while loading', () => {
      render(<Receipts receipts={mockReceipts} isLoading {...defaultCallbacks} />);
      expect(screen.queryByText('British Gas')).not.toBeInTheDocument();
    });
  });

  // done ─────────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('renders the heading with the receipt count', () => {
      render(<Receipts receipts={mockReceipts} {...defaultCallbacks} />);
      expect(screen.getByText('Receipts · 2026')).toBeInTheDocument();
      expect(screen.getByText('2 receipts on file')).toBeInTheDocument();
    });

    it('renders a card for each receipt', () => {
      render(<Receipts receipts={mockReceipts} {...defaultCallbacks} />);
      expect(screen.getByText('British Gas')).toBeInTheDocument();
      expect(screen.getByText('Thames Water')).toBeInTheDocument();
    });

    it('renders the formatted amount for each receipt', () => {
      render(<Receipts receipts={mockReceipts} {...defaultCallbacks} />);
      expect(screen.getByText('£120')).toBeInTheDocument();
      expect(screen.getByText('£80')).toBeInTheDocument();
    });

    it('calls onView with the correct receipt when a card is clicked', () => {
      render(<Receipts receipts={mockReceipts} {...defaultCallbacks} />);
      const cards = screen.getAllByTestId('card');
      // First card in the grid is the first receipt card
      fireEvent.click(cards[0]);
      expect(defaultCallbacks.onView).toHaveBeenCalledWith(mockReceipts[0]);
    });

    it('calls onUpload when the Upload receipt button is clicked', () => {
      render(<Receipts receipts={[]} {...defaultCallbacks} />);
      fireEvent.click(screen.getByRole('button', { name: /upload receipt/i }));
      expect(defaultCallbacks.onUpload).toHaveBeenCalledTimes(1);
    });

    it('shows "0 receipts on file" when the list is empty', () => {
      render(<Receipts receipts={[]} {...defaultCallbacks} />);
      expect(screen.getByText('0 receipts on file')).toBeInTheDocument();
    });
  });

  // fail ─────────────────────────────────────────────────────────────────────

  describe('fail', () => {
    it('shows an error state when error prop is set', () => {
      render(<Receipts receipts={[]} error="Failed to load receipts" {...defaultCallbacks} />);
      expect(screen.getByTestId('receipts-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load receipts/i)).toBeInTheDocument();
    });

    it('does not render receipt cards in error state', () => {
      render(<Receipts receipts={mockReceipts} error="Server error 500" {...defaultCallbacks} />);
      expect(screen.queryByText('British Gas')).not.toBeInTheDocument();
    });

    it('shows a Retry button in the error state', () => {
      render(<Receipts receipts={[]} error="Server error" onRetry={vi.fn()} {...defaultCallbacks} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // retry ────────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('calls onRetry when the Retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<Receipts receipts={[]} error="Server error" onRetry={onRetry} {...defaultCallbacks} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render a Retry button when onRetry is not provided', () => {
      render(<Receipts receipts={[]} error="Server error" {...defaultCallbacks} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  // offline ──────────────────────────────────────────────────────────────────

  describe('offline', () => {
    it('shows an offline state for ERR_INTERNET_DISCONNECTED errors', () => {
      render(
        <Receipts receipts={[]} error="net::ERR_INTERNET_DISCONNECTED" onRetry={vi.fn()} {...defaultCallbacks} />,
      );
      expect(screen.getByTestId('receipts-offline')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/i)).toBeInTheDocument();
    });

    it('shows an offline state for Firestore unavailable errors', () => {
      render(
        <Receipts receipts={[]} error="The service is currently unavailable" onRetry={vi.fn()} {...defaultCallbacks} />,
      );
      expect(screen.getByTestId('receipts-offline')).toBeInTheDocument();
    });

    it('shows a Retry button in the offline state', () => {
      const onRetry = vi.fn();
      render(
        <Receipts receipts={[]} error="net::ERR_INTERNET_DISCONNECTED" onRetry={onRetry} {...defaultCallbacks} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
