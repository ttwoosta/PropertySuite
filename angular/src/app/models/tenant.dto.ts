import { Timestamp } from 'firebase/firestore';

/** Firestore document shape for 'users/{uid}/tenants'. */
export interface TenantDto {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly prop: string;
  readonly score: number;
  readonly lastContact: number;
  readonly style: string;
  readonly payment: string;
  readonly preferTime: string;
}

/** Firestore document shape for 'users/{uid}/tenant_messages'. */
export interface MessageDto {
  readonly id: string;
  readonly tenantId: string;
  readonly who: 'them' | 'you' | 'note';
  readonly channel?: 'sms' | 'email' | 'note';
  readonly text: string;
  readonly sentAt: Timestamp;
  readonly aiDrafted?: boolean;
}
