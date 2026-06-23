// Pure validation functions for rent forms — no imports, no side effects.

export function validateHouseForm(rent: number): { ok: boolean; error: string | null } {
  if (rent <= 0) return { ok: false, error: 'Rent must be greater than 0.' };
  return { ok: true, error: null };
}

export interface RoomFormErrors {
  name: string | null;
  renter: string | null;
  rent: string | null;
}

export function validateRoomForm(data: {
  name: string;
  renter: string;
  rent: number;
  occupied: boolean;
}): RoomFormErrors {
  return {
    name: data.name.trim() ? null : 'Room name is required.',
    renter: data.occupied && !data.renter.trim() ? 'A renter is required for occupied rooms.' : null,
    rent: data.rent <= 0 ? 'Enter the monthly rent.' : null,
  };
}

export function isRoomFormValid(e: RoomFormErrors): boolean {
  return !e.name && !e.renter && !e.rent;
}

export interface RentEntryFormErrors {
  renter: string | null;
  due: string | null;
}

export function validateRentEntryForm(data: {
  renter: string;
  amountDue: number;
}): RentEntryFormErrors {
  return {
    renter: data.renter.trim() ? null : 'Renter is required.',
    due: data.amountDue <= 0 ? 'Enter the amount due.' : null,
  };
}

export function isRentEntryFormValid(e: RentEntryFormErrors): boolean {
  return !e.renter && !e.due;
}
