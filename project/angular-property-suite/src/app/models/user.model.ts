/**
 * An authenticated landlord. Derived from the sign-in email — the demo
 * auth has no backend; any email/password is accepted.
 */
export interface User {
  /** Email used to sign in. */
  email: string;
  /** Display name derived from the email local-part (e.g. "Dana Reyes"). */
  name: string;
  /** Up to two uppercase initials for the avatar (e.g. "DR"). */
  initials: string;
}
