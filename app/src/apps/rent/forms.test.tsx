import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AddHouseDrawer, EditRoomDrawer, AddRentDrawer } from './forms';
import { SEED_HOUSES as HOUSES } from './data';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../ds-vendor/components', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Badge: ({ children }: any) => <span>{children}</span>,
  Input: ({ label, value, onChange, onBlur, error, placeholder }: any) => (
    <div>
      {label}
      <input
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder ?? ''}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  Select: ({ value, options, onChange }: any) => (
    <select value={value ?? ''} onChange={onChange}>
      {(options ?? []).map((o: string) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  ),
}));

vi.mock('../../components/ui', () => ({
  RightDrawer: ({ open, children, footer }: any) =>
    open ? <div data-testid="drawer">{children}{footer}</div> : null,
}));

vi.mock('../../lib/icon', () => ({
  Icon: () => null,
  di: () => null,
}));

vi.mock('../../lib/currency', () => ({
  getCurrencySymbol: () => '£',
  formatCurrencyDecimal: (n: number) => `£${n.toFixed(2)}`,
}));

// ── Shared mock data ────────────────────────────────────────────────────────
// HOUSES[0] = Maple Court
//   rooms[0]: Marcus Bell  | rent 620 | paid 620 | Paid
//   rooms[1]: Priya Shah   | rent 640 | paid 320 | Partial
//   rooms[2]: Tom Reilly   | rent 600 | paid 0   | Pending
//   rooms[3]: null tenant  | rent 600 | paid 0   | Vacant
const occupiedRoom = HOUSES[0].rooms[0]; // Marcus Bell
const partialRoom  = HOUSES[0].rooms[1]; // Priya Shah
const vacantRoom   = HOUSES[0].rooms[3]; // no tenant

// ── AddHouseDrawer ──────────────────────────────────────────────────────────

describe('AddHouseDrawer', () => {
  const onClose = vi.fn();
  const onSave  = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['setTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when closed', () => {
    render(<AddHouseDrawer open={false} onClose={onClose} onSave={onSave} />);
    expect(screen.queryByTestId('drawer')).toBeNull();
  });

  it('renders the form when open', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 428 Maple Street, Madison WI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error and does not call onSave when rent is zero', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText(/Enter a base rent greater than/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct address, rooms, and rent after the save delay', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    fireEvent.change(
      screen.getByPlaceholderText('e.g. 428 Maple Street, Madison WI'),
      { target: { value: '10 Test Lane, LS1 1AB' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'More' })); // rooms: 3 → 4
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '750' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    act(() => { vi.advanceTimersByTime(850); });

    expect(onSave).toHaveBeenCalledWith({ address: '10 Test Lane, LS1 1AB', rooms: 4, rent: 750 });
  });

  it('defaults address to "New house" when left blank', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    // rent defaults to 600, address blank
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ address: 'New house' }));
  });

  it('strips non-numeric characters from the rent field via sanitizeAmt', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: 'abc500xyz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ rent: 500 }));
  });

  it('Stepper decrements rooms down to the minimum of 1', () => {
    render(<AddHouseDrawer open={true} onClose={onClose} onSave={onSave} />);
    // default rooms = 3; click Fewer twice to reach 1, third click is disabled
    fireEvent.click(screen.getByRole('button', { name: 'Fewer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fewer' }));
    expect(screen.getByRole('button', { name: 'Fewer' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ rooms: 1 }));
  });
});

// ── EditRoomDrawer ──────────────────────────────────────────────────────────

describe('EditRoomDrawer', () => {
  const onClose = vi.fn();
  const onSave  = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['setTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when room is null', () => {
    render(<EditRoomDrawer room={null} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    expect(screen.queryByTestId('drawer')).toBeNull();
  });

  it('pre-fills all fields from the room prop', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    expect(screen.getByDisplayValue('Room 1')).toBeInTheDocument();       // unit
    expect(screen.getByDisplayValue('Marcus Bell')).toBeInTheDocument();  // tenant
    expect(screen.getByDisplayValue('620')).toBeInTheDocument();          // rent
    expect(screen.getByDisplayValue('Occupied')).toBeInTheDocument();     // status
  });

  it('shows a name-required error on submit with an empty room name', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('Room 1'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    expect(screen.getByText('Room name is required.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows a renter-required error when status is Occupied and renter is blank', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('Marcus Bell'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    expect(screen.getByText('A renter is required for occupied rooms.')).toBeInTheDocument();
  });

  it('shows a rent-required error when rent is zero', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('620'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    expect(screen.getByText('Enter the monthly rent.')).toBeInTheDocument();
  });

  it('does not require a renter when status is changed to Vacant', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Vacant' } });
    // Renter field now blank — should save without error
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalled();
  });

  it('sets tenant to null when status is Vacant', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Vacant' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tenant: null }));
  });

  it('calls onSave with updated unit and rent values', () => {
    render(<EditRoomDrawer room={occupiedRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('Room 1'), { target: { value: 'Room 1A' } });
    fireEvent.change(screen.getByDisplayValue('620'), { target: { value: '650' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ unit: 'Room 1A', tenant: 'Marcus Bell', rent: 650 }),
    );
  });

  it('pre-fills a vacant room with no tenant', () => {
    render(<EditRoomDrawer room={vacantRoom} houseName="Maple Court" onClose={onClose} onSave={onSave} />);
    expect(screen.getByDisplayValue('Vacant')).toBeInTheDocument();
  });
});

// ── AddRentDrawer ───────────────────────────────────────────────────────────

describe('AddRentDrawer', () => {
  const ctx = { room: partialRoom, houseName: 'Maple Court', period: 'June 2026' };
  const onClose = vi.fn();
  const onSave  = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['setTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when ctx is null', () => {
    render(<AddRentDrawer ctx={null} onClose={onClose} onSave={onSave} />);
    expect(screen.queryByTestId('drawer')).toBeNull();
  });

  it('pre-fills renter, amount due, and amount received from ctx', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    expect(screen.getByDisplayValue('Priya Shah')).toBeInTheDocument(); // tenant
    expect(screen.getByDisplayValue('640')).toBeInTheDocument();        // rent (due)
    expect(screen.getByDisplayValue('320')).toBeInTheDocument();        // paid (received)
  });

  it('shows a renter-required error and does not call onSave when renter is blank', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('Priya Shah'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add rent' }));
    expect(screen.getByText('Renter is required.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows an amount-required error when due is zero', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('640'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add rent' }));
    expect(screen.getByText('Enter the amount due.')).toBeInTheDocument();
  });

  it('clicking "Mark as paid" fills received with the full due amount', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    // initial: due=640, recv=320 → not fully paid
    fireEvent.click(screen.getByText('Mark as paid').closest('button')!);
    // both due and received now show 640
    expect(screen.getAllByDisplayValue('640')).toHaveLength(2);
  });

  it('clicking "Mark as paid" a second time clears received back to 0', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    const btn = screen.getByText('Mark as paid').closest('button')!;
    fireEvent.click(btn); // recv → 640 (paid full)
    fireEvent.click(btn); // recv → 0   (toggle off)
    // due is still 640; received is now 0
    expect(screen.getAllByDisplayValue('640')).toHaveLength(1);
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('shows Partial status when received is between 0 and due (initial state)', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    // recv=320, due=640 → Partial
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('shows Paid status when received equals due', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('320'), { target: { value: '640' } });
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('shows Pending status when received is 0', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByDisplayValue('320'), { target: { value: '0' } });
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('calls onSave with correct rent, paid, and derived status', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    // pay in full
    fireEvent.change(screen.getByDisplayValue('320'), { target: { value: '640' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add rent' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rent: 640, paid: 640, status: 'Paid' }),
    );
  });

  it('calls onSave with Partial status when partially paid', () => {
    render(<AddRentDrawer ctx={ctx} onClose={onClose} onSave={onSave} />);
    // recv=320, due=640 → Partial (initial defaults)
    fireEvent.click(screen.getByRole('button', { name: 'Add rent' }));
    act(() => { vi.advanceTimersByTime(850); });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rent: 640, paid: 320, status: 'Partial' }),
    );
  });
});
