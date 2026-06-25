/** View model for the signed-in user, derived from Firebase Auth. */
export interface SuiteUser {
  readonly uid: string;
  readonly email: string;
  readonly name: string;
  readonly initials: string;
}

export type AuthStatus = 'resolving' | 'out' | 'in';
