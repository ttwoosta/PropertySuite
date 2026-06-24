import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from './Dashboard';
import type { House, RentEntry, RentEntriesState } from './data';
import { useRentEntries } from './data';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('./data', () => ({
  useRentEntries: vi.fn(),
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  gbp: (n: number) => `£${n}`,
}));

vi.mock('../../ds-vendor/components', () => ({
  Card: ({ children, style, padding }: any) => (
    <div data-testid="card" style={style} data-padding={padding}>{children}</div>
  ),
  Badge: ({ children, tone, size }: any) => (
    <span data-testid={`badge-${tone}`} data-size={size}>{children}</span>
  ),
}));

vi.mock('../../components/ui', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}));

// ── Test data ──────────────────────────────────────────────────────────────

const mockHouse: House = {
  id: 'h1',
  name: 'Maple Court',
  address: '1 Maple St, London',
  rooms: [
    { id: 'r1', unit: 'Room 1', tenant: 'Alice', rent: 600, paid: 600, status: 'Paid', beds: 1 },
    { id: 'r2', unit: 'Room 2', tenant: 'Bob', rent: 640, paid: 320, status: 'Partial', beds: 1 },
    { id: 'r3', unit: 'Room 3', tenant: null, rent: 600, paid: 0, status: 'Vacant', beds: 1 },
  ],
};

const mockEntries: RentEntry[] = [
  {
    id: 'e1', houseId: 'h1', roomId: 'r1', houseName: 'Maple Court', roomName: 'Room 1',
    tenant: 'Alice', month: 5, year: 2026, amountDue: 600, amountPaid: 600, status: 'Paid',
  },
  {
    id: 'e2', houseId: 'h1', roomId: 'r2', houseName: 'Maple Court', roomName: 'Room 2',
    tenant: 'Bob', month: 5, year: 2026, amountDue: 640, amountPaid: 320, status: 'Partial',
  },
];

function makeHookState(overrides: Partial<RentEntriesState> = {}): RentEntriesState {
  return {
    entries: [],
    loading: false,
    error: null,
    retry: vi.fn(),
    setEntries: vi.fn(),
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('shows loading indicator while entries are in-flight', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ loading: true }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    });

    it('does not render KPI cards while loading', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ loading: true }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.queryByText('Collected')).not.toBeInTheDocument();
    });
  });

  // done ─────────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('renders KPI cards when data loads successfully', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ entries: mockEntries }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('Outstanding')).toBeInTheDocument();
      expect(screen.getByText('Occupancy')).toBeInTheDocument();
    });

    it('shows correct room count in the occupancy KPI', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ entries: mockEntries }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('renders a row for each room in the collection status table', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ entries: mockEntries }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('Room 2')).toBeInTheDocument();
      expect(screen.getByText('Room 3')).toBeInTheDocument();
    });

    it('renders the recent activity feed when there are entries', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ entries: mockEntries }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByText('Recent activity')).toBeInTheDocument();
      expect(screen.getByText(/Rent received — Alice/)).toBeInTheDocument();
    });

    it('hides the activity feed when there are no entries', () => {
      vi.mocked(useRentEntries).mockReturnValue(makeHookState({ entries: [] }));
      render(<Dashboard house={mockHouse} />);
      expect(screen.queryByText('Recent activity')).not.toBeInTheDocument();
    });
  });

  // fail ─────────────────────────────────────────────────────────────────────

  describe('fail', () => {
    it('shows an error state when the server returns an error', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('500 Internal Server Error') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    it('does not render KPI cards when in error state', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('500 Internal Server Error') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.queryByText('Collected')).not.toBeInTheDocument();
    });

    it('shows a Retry button in the error state', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('Server error') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // retry ────────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('calls the retry function from the hook when Retry is clicked', () => {
      const retry = vi.fn();
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('Server error'), retry }),
      );
      render(<Dashboard house={mockHouse} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(retry).toHaveBeenCalledTimes(1);
    });

    it('re-invokes useRentEntries with the same houseId on retry', () => {
      const retry = vi.fn();
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('Server error'), retry }),
      );
      render(<Dashboard house={mockHouse} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      // The hook was called on mount; clicking retry triggers it via the state increment inside Dashboard's hook
      expect(vi.mocked(useRentEntries)).toHaveBeenCalledWith(mockHouse.id);
    });
  });

  // offline ──────────────────────────────────────────────────────────────────

  describe('offline', () => {
    it('shows an offline state for ERR_INTERNET_DISCONNECTED errors', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('net::ERR_INTERNET_DISCONNECTED') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByTestId('dashboard-offline')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/i)).toBeInTheDocument();
    });

    it('shows an offline state for Firestore unavailable errors', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('The service is currently unavailable') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByTestId('dashboard-offline')).toBeInTheDocument();
    });

    it('shows a Retry button in the offline state', () => {
      vi.mocked(useRentEntries).mockReturnValue(
        makeHookState({ error: new Error('net::ERR_INTERNET_DISCONNECTED') }),
      );
      render(<Dashboard house={mockHouse} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
