import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YearGrid } from './YearGrid';
import type { House } from './data';
import { subscribeGridCells } from '../../lib/rentService';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../lib/firebase', () => ({ firebaseConfigured: true }));

vi.mock('../../lib/rentService', () => ({
  subscribeGridCells: vi.fn(),
  saveGridCell: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./data', () => ({
  emptyGrid: vi.fn((cols: any[]) =>
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ({
      month,
      tax: null, water: null, elec: null, gas: null, maint: null, loan: null,
      rent: Object.fromEntries(cols.map((c: any) => [c.id, null])),
      rentTotal: 0,
      net: 0,
    })),
  ),
  gbp: (n: number) => `£${n}`,
}));

vi.mock('../../ds-vendor/components', () => ({
  Card: ({ children, style, padding }: any) => <div data-testid="card" style={style}>{children}</div>,
  Button: ({ children, onClick, size, variant, leadingIcon }: any) => (
    <button onClick={onClick} data-size={size} data-variant={variant}>{children}</button>
  ),
}));

vi.mock('../../components/ui', () => ({
  Segmented: ({ value, onChange, options, ariaLabel }: any) => (
    <div aria-label={ariaLabel}>
      {options.map((o: any) => (
        <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={value === o.value}>
          {o.label}
        </button>
      ))}
    </div>
  ),
  di: () => null,
}));

// ── Test data ──────────────────────────────────────────────────────────────

const mockHouse: House = {
  id: 'h1',
  name: 'Maple Court',
  address: '1 Maple St',
  rooms: [
    { id: 'r1', unit: 'Room 1', tenant: 'Alice', rent: 600, paid: 600, status: 'Paid', beds: 1 },
    { id: 'r2', unit: 'Room 2', tenant: null, rent: 600, paid: 0, status: 'Vacant', beds: 1 },
  ],
};

const defaultProps = { house: mockHouse, year: 2026, toast: vi.fn(), uid: 'user1' };

// ── Tests ──────────────────────────────────────────────────────────────────

describe('YearGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('shows loading indicator while waiting for the first snapshot', () => {
      vi.mocked(subscribeGridCells).mockImplementation(() => vi.fn()); // never resolves
      render(<YearGrid {...defaultProps} />);
      expect(screen.getByTestId('yeargrid-loading')).toBeInTheDocument();
    });

    it('does not render the data table while loading', () => {
      vi.mocked(subscribeGridCells).mockImplementation(() => vi.fn());
      render(<YearGrid {...defaultProps} />);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  // done ─────────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('renders the grid table after the snapshot arrives', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, onData) => {
        onData([]);
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('hides the loading indicator after data arrives', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, onData) => {
        onData([]);
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.queryByTestId('yeargrid-loading')).not.toBeInTheDocument();
    });

    it('calls subscribeGridCells with the correct uid, houseId, and year', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, onData) => {
        onData([]);
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(vi.mocked(subscribeGridCells)).toHaveBeenCalledWith('user1', 'h1', 2026, expect.any(Function), expect.any(Function));
    });

    it('renders month rows in the table', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, onData) => {
        onData([]);
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('Dec')).toBeInTheDocument();
    });
  });

  // fail ─────────────────────────────────────────────────────────────────────

  describe('fail', () => {
    it('shows an error state when the subscription returns a server error', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('500 Internal Server Error'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByTestId('yeargrid-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load grid data/i)).toBeInTheDocument();
    });

    it('does not render the table when in error state', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('500 Internal Server Error'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows a Retry button in the error state', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('Server error'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // retry ────────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('re-calls subscribeGridCells after the user clicks Retry', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('Server error'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(vi.mocked(subscribeGridCells)).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      await act(async () => {});
      expect(vi.mocked(subscribeGridCells)).toHaveBeenCalledTimes(2);
    });

    it('clears the error state after a successful retry', async () => {
      let callCount = 0;
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, onData, onError) => {
        callCount++;
        if (callCount === 1) onError!(new Error('Server error'));
        else onData([]);
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByTestId('yeargrid-error')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      await act(async () => {});
      expect(screen.queryByTestId('yeargrid-error')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  // offline ──────────────────────────────────────────────────────────────────

  describe('offline', () => {
    it('shows an offline state for ERR_INTERNET_DISCONNECTED errors', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('net::ERR_INTERNET_DISCONNECTED'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByTestId('yeargrid-offline')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/i)).toBeInTheDocument();
    });

    it('shows an offline state for Firestore unavailable errors', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('The service is currently unavailable'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByTestId('yeargrid-offline')).toBeInTheDocument();
    });

    it('shows a Retry button in the offline state', async () => {
      vi.mocked(subscribeGridCells).mockImplementation((_uid, _houseId, _year, _onData, onError) => {
        onError!(new Error('net::ERR_INTERNET_DISCONNECTED'));
        return vi.fn();
      });
      render(<YearGrid {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('does not call subscribeGridCells when uid is null (no auth)', () => {
      render(<YearGrid {...defaultProps} uid={null} />);
      expect(vi.mocked(subscribeGridCells)).not.toHaveBeenCalled();
    });
  });
});
