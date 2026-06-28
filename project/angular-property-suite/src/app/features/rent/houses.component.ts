import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CardComponent } from '../../components/shared/card/card.component';
import { BadgeComponent, BadgeTone } from '../../components/shared/badge/badge.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconButtonComponent } from '../../components/shared/icon-button/icon-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { Room, RoomStatus } from '../../models/rent.vm';

const STATUS_BADGE: Record<RoomStatus, BadgeTone> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'neutral',
  Vacant: 'neutral',
};

/**
 * Houses view, ported from `Houses`: header (name/address, occupied badge,
 * Add house) and a rooms list with tenant, base rent, paid button, status
 * badge, and edit/add-rent icon buttons.
 */
@Component({
  selector: 'app-houses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, UiButtonComponent, IconButtonComponent, IconComponent],
  template: `
    <div class="ps-fade">
      <div class="houses__head">
        <div class="houses__title-wrap">
          <div class="houses__title">{{ house().name }}</div>
          <div class="houses__addr">{{ house().address }}</div>
        </div>
        <ps-badge [tone]="occupied() === house().rooms.length ? 'success' : 'warning'">
          {{ occupied() }}/{{ house().rooms.length }} occupied
        </ps-badge>
        <ps-button variant="primary" (clicked)="rent.openAddHouse()">
          <ps-icon name="plus" [size]="16"></ps-icon>Add house
        </ps-button>
      </div>

      <ps-card padding="0">
        @for (r of house().rooms; track r.id; let i = $index) {
          <div class="room" [class.room--divided]="i > 0">
            <div class="room__unit">{{ r.unit }}</div>
            <div class="room__tenant" [class.room__tenant--vacant]="!r.tenant">{{ r.tenant || 'Vacant' }}</div>
            <div class="ps-mono room__rent">{{ currency.format(r.rent) }}</div>
            <button class="ps-mono room__paid" [class.room__paid--zero]="!r.paid" title="Record rent" (click)="rent.openAddRent(r)">
              {{ r.paid ? currency.format(r.paid) : 'Add +' }}
            </button>
            <div class="room__status">
              <ps-badge [tone]="badge(r.status)" size="sm">{{ r.status }}</ps-badge>
            </div>
            <div class="room__actions">
              <ps-icon-button label="Edit room" variant="ghost" size="sm" (clicked)="rent.openEditRoom(r)">
                <ps-icon name="pencil" [size]="16"></ps-icon>
              </ps-icon-button>
              <ps-icon-button label="Add rent" variant="ghost" size="sm" (clicked)="rent.openAddRent(r)">
                <ps-icon name="plus-circle" [size]="16"></ps-icon>
              </ps-icon-button>
            </div>
          </div>
        }
      </ps-card>
    </div>
  `,
  styleUrl: './houses.component.scss',
})
export class HousesComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  readonly house = this.rent.house;
  readonly occupied = computed(() => this.house().rooms.filter((r) => r.tenant).length);

  badge(status: RoomStatus): BadgeTone {
    return STATUS_BADGE[status];
  }

  // exposes the Room type for the template tracker
  protected trackRoom(_i: number, r: Room): string {
    return r.id;
  }
}
