import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { RentService, CATEGORIES, MONTH_NAMES, MONTHS } from '../../services/rent.service';
import { ToastService } from '../../services/toast.service';
import { CurrencyService } from '../../services/currency.service';
import { HouseVm, RoomVm, ReceiptVm, RentEntryVm } from '../../models/rent.vm';

type RentView = 'home' | 'grid' | 'houses' | 'expenses' | 'receipts';

const SEED_HOUSES: Omit<HouseVm, 'id'>[] = [
  {
    name: 'Maple House', address: '12 Maple Street, London',
    rooms: [
      { id: 'r1', unit: 'Room 1', tenant: 'James T.', rent: 850, paid: 850, status: 'Paid', beds: 1 },
      { id: 'r2', unit: 'Room 2', tenant: 'Sara M.',  rent: 750, paid: 375, status: 'Partial', beds: 1 },
      { id: 'r3', unit: 'Room 3', tenant: '',         rent: 700, paid: 0,   status: 'Vacant',  beds: 1 },
    ],
  },
];

@Component({
  selector: 'ps-rent-app',
  standalone: true,
  imports: [RouterLink, FormsModule, NgTemplateOutlet],
  template: `
    <div class="ps-shell" [class.drawer-open]="drawerOpen()" [attr.data-theme]="theme()">
      <div class="ps-scrim" (click)="drawerOpen.set(false)"></div>

      <!-- Sidebar -->
      <aside class="ps-sidebar">
        <div style="padding:20px 20px 16px;border-bottom:1px solid var(--border-default);">
          <a [routerLink]="['/']" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
            <div style="width:32px;height:32px;background:var(--brand);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style="font-weight:700;font-size:var(--text-sm);color:var(--text-heading);">PropertySuite</span>
          </a>
        </div>
        <nav style="flex:1;padding:12px 16px;">
          @for (item of navItems; track item.view) {
            <button (click)="setView(item.view)" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;border-radius:var(--radius-md);cursor:pointer;margin-bottom:2px;" [style.background]="view() === item.view ? 'var(--surface-active-nav)' : 'transparent'" [attr.data-testid]="'nav-' + item.view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="view() === item.view ? 'var(--brand)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="item.iconPath"/>
              </svg>
              <span style="font-size:var(--text-sm);font-weight:500;" [style.color]="view() === item.view ? 'var(--brand)' : 'var(--text-body)'">{{ item.label }}</span>
            </button>
          }
        </nav>
        <!-- Stats footer -->
        <div style="padding:16px;border-top:1px solid var(--border-default);">
          <p style="margin:0 0 4px;font-size:var(--text-xs);color:var(--text-muted);">Total collected</p>
          <p class="ps-mono" style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">{{ totalCollected() }}</p>
        </div>
      </aside>

      <!-- Main -->
      <div class="ps-main">
        <div class="ps-topbar">
          <button class="ps-hamburger" (click)="drawerOpen.set(!drawerOpen())" style="background:none;border:none;padding:8px;cursor:pointer;display:inline-flex;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <!-- House selector -->
          <div style="position:relative;">
            <button (click)="houseOpen.set(!houseOpen())" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);cursor:pointer;font-size:var(--text-sm);font-weight:500;color:var(--text-heading);" data-testid="house-selector">
              {{ currentHouse()?.name ?? 'Select house' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            @if (houseOpen()) {
              <div style="position:absolute;top:calc(100% + 6px);left:0;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);box-shadow:var(--shadow-md);z-index:100;min-width:200px;padding:6px;">
                @for (h of houses(); track h.id) {
                  <button (click)="selectHouse(h.id)" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;border-radius:var(--radius-sm);background:transparent;cursor:pointer;font-size:var(--text-sm);color:var(--text-heading);" data-testid="house-option">{{ h.name }}</button>
                }
                <button (click)="openAddHouse()" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;border-radius:var(--radius-sm);background:transparent;cursor:pointer;font-size:var(--text-sm);color:var(--brand);font-weight:600;">+ Add house</button>
              </div>
            }
          </div>
          <div style="flex:1;"></div>
          <a [routerLink]="['/profile']" style="text-decoration:none;">
            <div style="width:34px;height:34px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:700;color:var(--brand);">{{ initials() }}</div>
          </a>
        </div>

        <div class="ps-content">
          <div class="ps-content-inner ps-fade">
            @if (loading()) {
              <div style="display:flex;justify-content:center;padding:60px;"><div class="ps-spin"></div></div>
            } @else if (view() === 'home') {
              <ng-container [ngTemplateOutlet]="dashboardView"></ng-container>
            } @else if (view() === 'houses') {
              <ng-container [ngTemplateOutlet]="housesView"></ng-container>
            } @else if (view() === 'receipts') {
              <ng-container [ngTemplateOutlet]="receiptsView"></ng-container>
            } @else if (view() === 'expenses') {
              <ng-container [ngTemplateOutlet]="expensesView"></ng-container>
            } @else if (view() === 'grid') {
              <ng-container [ngTemplateOutlet]="gridView"></ng-container>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Toast host -->
    <div style="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;">
      @for (t of toastService.toasts(); track t.id) {
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:12px 16px;box-shadow:var(--shadow-lg);font-size:var(--text-sm);color:var(--text-heading);max-width:320px;display:flex;align-items:center;gap:8px;">
          <span style="flex:1;">{{ t.message }}</span>
          <button (click)="toastService.dismiss(t.id)" style="background:none;border:none;cursor:pointer;padding:0;color:var(--text-muted);">✕</button>
        </div>
      }
    </div>

    <!-- Add house drawer -->
    @if (addHouseOpen()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="addHouseOpen.set(false)">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div style="width:480px;background:var(--surface-card);height:100%;padding:28px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">Add house</h2>
            <button (click)="addHouseOpen.set(false)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);">✕</button>
          </div>
          <form (ngSubmit)="submitAddHouse()" style="display:flex;flex-direction:column;gap:14px;flex:1;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Address</label>
              <input class="ps-input" [(ngModel)]="houseForm.address" name="address" placeholder="e.g. 12 Maple Street, London" required data-testid="input-house-address"/>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Number of rooms</label>
              <input type="number" class="ps-input" [(ngModel)]="houseForm.rooms" name="rooms" min="1" max="20" data-testid="input-house-rooms"/>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Base rent ({{ currencyService.getSymbol() }}/room)</label>
              <input type="number" class="ps-input" [(ngModel)]="houseForm.rent" name="rent" min="0" placeholder="0" data-testid="input-house-rent"/>
            </div>
            <div style="margin-top:auto;display:flex;gap:10px;justify-content:flex-end;">
              <button type="button" (click)="addHouseOpen.set(false)" class="ps-btn ps-btn-ghost">Cancel</button>
              <button type="submit" class="ps-btn ps-btn-primary" [disabled]="saveBusy()" data-testid="btn-save-house">
                @if (saveBusy()) { Saving… } @else { Add house }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Edit room drawer -->
    @if (editRoomTarget()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="editRoomTarget.set(null)">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div style="width:480px;background:var(--surface-card);height:100%;padding:28px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">Edit room</h2>
            <button (click)="editRoomTarget.set(null)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);">✕</button>
          </div>
          <form (ngSubmit)="submitEditRoom()" style="display:flex;flex-direction:column;gap:14px;flex:1;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Room name</label>
              <input class="ps-input" [(ngModel)]="roomForm.unit" name="unit" required data-testid="input-room-name"/>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Status</label>
              <select class="ps-select" [(ngModel)]="roomForm.status" name="status">
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
                <option value="Vacant">Vacant</option>
              </select>
            </div>
            @if (roomForm.status !== 'Vacant') {
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Tenant name</label>
                <input class="ps-input" [(ngModel)]="roomForm.tenant" name="tenant" data-testid="input-room-tenant"/>
              </div>
            }
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Monthly rent ({{ currencyService.getSymbol() }})</label>
              <input type="number" class="ps-input" [(ngModel)]="roomForm.rent" name="rent" min="0" data-testid="input-room-rent"/>
            </div>
            <div style="margin-top:auto;display:flex;gap:10px;justify-content:flex-end;">
              <button type="button" (click)="editRoomTarget.set(null)" class="ps-btn ps-btn-ghost">Cancel</button>
              <button type="submit" class="ps-btn ps-btn-primary" [disabled]="saveBusy()" data-testid="btn-save-room">
                @if (saveBusy()) { Saving… } @else { Save room }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Add rent entry drawer -->
    @if (addRentTarget()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="addRentTarget.set(null)">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div style="width:480px;background:var(--surface-card);height:100%;padding:28px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">Add rent entry</h2>
            <button (click)="addRentTarget.set(null)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);">✕</button>
          </div>
          <form (ngSubmit)="submitAddRent()" style="display:flex;flex-direction:column;gap:14px;flex:1;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Renter</label>
              <input class="ps-input" [(ngModel)]="rentForm.tenant" name="tenant" required data-testid="input-rent-tenant"/>
            </div>
            <div style="display:flex;gap:12px;">
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Amount due</label>
                <input type="number" class="ps-input" [(ngModel)]="rentForm.amountDue" name="amountDue" required data-testid="input-rent-due"/>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Amount received</label>
                <input type="number" class="ps-input" [(ngModel)]="rentForm.amountPaid" name="amountPaid" data-testid="input-rent-paid"/>
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Month</label>
                <select class="ps-select" [(ngModel)]="rentForm.month" name="month">
                  @for (m of monthNames; track $index) {
                    <option [value]="$index + 1">{{ m }}</option>
                  }
                </select>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Year</label>
                <input type="number" class="ps-input" [(ngModel)]="rentForm.year" name="year"/>
              </div>
            </div>
            <div style="margin-top:auto;display:flex;gap:10px;justify-content:flex-end;">
              <button type="button" (click)="addRentTarget.set(null)" class="ps-btn ps-btn-ghost">Cancel</button>
              <button type="submit" class="ps-btn ps-btn-primary" [disabled]="saveBusy()" data-testid="btn-save-rent">
                @if (saveBusy()) { Saving… } @else { Add entry }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- View templates -->
    <ng-template #dashboardView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <p class="eyebrow" style="margin:0 0 2px;">{{ currentHouse()?.name ?? '—' }}</p>
          <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Dashboard</h2>
        </div>
      </div>
      <!-- KPI cards -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;" data-testid="kpi-grid">
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:20px;">
          <p class="eyebrow" style="margin:0 0 8px;">Collected</p>
          <p class="ps-mono" style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">{{ fmt(totalPaid()) }}</p>
          <p style="margin:4px 0 0;font-size:var(--text-xs);color:var(--text-muted);">of {{ fmt(totalDue()) }}</p>
        </div>
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:20px;">
          <p class="eyebrow" style="margin:0 0 8px;">Outstanding</p>
          <p class="ps-mono" style="margin:0;font-size:var(--text-2xl);font-weight:700;" [style.color]="outstanding() > 0 ? 'var(--danger-fg)' : 'var(--success-fg)'">{{ fmt(outstanding()) }}</p>
        </div>
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:20px;">
          <p class="eyebrow" style="margin:0 0 8px;">Occupancy</p>
          <p class="ps-mono" style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">{{ occupiedCount() }}/{{ totalRooms() }}</p>
          <p style="margin:4px 0 0;font-size:var(--text-xs);color:var(--text-muted);">rooms occupied</p>
        </div>
      </div>
      <!-- Room status table -->
      <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;" data-testid="room-status-table">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border-default);">
          <p style="margin:0;font-size:var(--text-md);font-weight:600;color:var(--text-heading);">Collection status</p>
        </div>
        @for (room of currentHouse()?.rooms ?? []; track room.id) {
          <div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border-subtle);" data-testid="room-row">
            <div style="flex:1;">
              <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ room.unit }}</p>
              <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ room.tenant || 'Vacant' }}</p>
            </div>
            <div style="width:100px;height:6px;background:var(--border-default);border-radius:999px;overflow:hidden;">
              <div style="height:100%;border-radius:999px;transition:width 0.3s;" [style.width]="pctWidth(room)" [style.background]="statusColor(room.status)"></div>
            </div>
            <p class="ps-mono" style="margin:0;font-size:var(--text-sm);font-weight:600;width:72px;text-align:right;color:var(--text-heading);">{{ fmt(room.paid) }}</p>
            <span style="font-size:var(--text-xs);font-weight:600;padding:3px 8px;border-radius:var(--radius-pill);" [style.background]="statusBg(room.status)" [style.color]="statusFg(room.status)">{{ room.status }}</span>
          </div>
        }
      </div>
    </ng-template>

    <ng-template #housesView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">{{ currentHouse()?.name ?? 'Houses' }}</h2>
        <button (click)="openAddHouse()" class="ps-btn ps-btn-primary" data-testid="btn-add-house">+ Add house</button>
      </div>
      @if (currentHouse()) {
        <p style="margin:0 0 20px;color:var(--text-muted);font-size:var(--text-sm);">{{ currentHouse()!.address }}</p>
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;" data-testid="rooms-table">
          @for (room of currentHouse()!.rooms; track room.id) {
            <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border-subtle);" data-testid="room-row">
              <div style="flex:1;">
                <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ room.unit }}</p>
                <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ room.tenant || 'Vacant' }}</p>
              </div>
              <p class="ps-mono" style="margin:0;font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">{{ fmt(room.rent) }}/mo</p>
              <span style="font-size:var(--text-xs);font-weight:600;padding:3px 8px;border-radius:var(--radius-pill);" [style.background]="statusBg(room.status)" [style.color]="statusFg(room.status)">{{ room.status }}</span>
              <div style="display:flex;gap:6px;">
                <button (click)="openAddRent(room)" class="ps-btn ps-btn-ghost" style="padding:6px 10px;font-size:var(--text-xs);" data-testid="btn-add-rent">+ Rent</button>
                <button (click)="openEditRoom(room)" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);" data-testid="btn-edit-room">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div style="text-align:center;padding:60px;color:var(--text-muted);">
          <p style="font-size:var(--text-lg);margin:0 0 8px;">No houses yet</p>
          <button (click)="openAddHouse()" class="ps-btn ps-btn-primary" style="margin-top:12px;">Add your first house</button>
        </div>
      }
    </ng-template>

    <ng-template #receiptsView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Receipts</h2>
      </div>
      @if (receipts().length === 0) {
        <div style="text-align:center;padding:60px;color:var(--text-muted);">
          <p style="font-size:var(--text-lg);margin:0 0 8px;">No receipts yet</p>
          <p style="font-size:var(--text-sm);margin:0;">Upload receipts to track expenses.</p>
        </div>
      } @else {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;" data-testid="receipts-grid">
          @for (r of receipts(); track r.id) {
            <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;cursor:pointer;" data-testid="receipt-card">
              <div style="height:80px;display:flex;align-items:center;justify-content:center;" [style.background]="catColor(r.category)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/></svg>
              </div>
              <div style="padding:12px;">
                <p style="margin:0 0 2px;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ r.merchant }}</p>
                <p style="margin:0;font-size:var(--text-xs);color:var(--text-muted);">{{ r.date }}</p>
                <p class="ps-mono" style="margin:4px 0 0;font-size:var(--text-sm);font-weight:700;color:var(--text-heading);">{{ fmt(r.amount) }}</p>
              </div>
            </div>
          }
        </div>
      }
    </ng-template>

    <ng-template #expensesView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Expenses</h2>
      </div>
      <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;" data-testid="expenses-list">
        @for (cat of categories; track cat.id) {
          <div style="border-bottom:1px solid var(--border-subtle);">
            <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;">
              <div style="width:36px;height:36px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;" [style.background]="cat.color + '22'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="cat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/></svg>
              </div>
              <div style="flex:1;">
                <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ cat.label }}</p>
              </div>
              <p class="ps-mono" style="margin:0;font-size:var(--text-sm);font-weight:600;color:var(--text-muted);">YTD: {{ fmt(0) }}</p>
            </div>
          </div>
        }
      </div>
    </ng-template>

    <ng-template #gridView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Year Grid — {{ year() }}</h2>
      </div>
      <div class="ps-scroll-x" data-testid="year-grid">
        <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:10px 14px;color:var(--text-muted);font-weight:600;white-space:nowrap;">Month</th>
              @for (room of currentHouse()?.rooms ?? []; track room.id) {
                <th style="text-align:right;padding:10px 14px;color:var(--text-muted);font-weight:600;white-space:nowrap;">{{ room.unit }}</th>
              }
              <th style="text-align:right;padding:10px 14px;color:var(--text-muted);font-weight:600;">Net</th>
            </tr>
          </thead>
          <tbody>
            @for (m of monthsArr; track $index; let i = $index) {
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:10px 14px;font-weight:500;color:var(--text-body);">{{ m }}</td>
                @for (room of currentHouse()?.rooms ?? []; track room.id) {
                  <td class="ps-mono" style="text-align:right;padding:10px 14px;color:var(--text-muted);">—</td>
                }
                <td class="ps-mono" style="text-align:right;padding:10px 14px;font-weight:600;color:var(--text-heading);">—</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </ng-template>
  `,
})
export class RentAppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private rentService = inject(RentService);
  private navService = inject(NavService);
  readonly toastService = inject(ToastService);
  readonly currencyService = inject(CurrencyService);

  readonly view = signal<RentView>('home');
  readonly drawerOpen = signal(false);
  readonly loading = signal(true);
  readonly saveBusy = signal(false);
  readonly houseOpen = signal(false);
  readonly addHouseOpen = signal(false);
  readonly houses = signal<HouseVm[]>([]);
  readonly receipts = signal<ReceiptVm[]>([]);
  readonly houseId = signal<string>('');
  readonly year = signal(new Date().getFullYear());
  readonly editRoomTarget = signal<RoomVm | null>(null);
  readonly addRentTarget = signal<RoomVm | null>(null);
  readonly theme = signal<'light' | 'dark'>('light');

  readonly categories = CATEGORIES;
  readonly monthNames = MONTH_NAMES;
  readonly monthsArr = MONTHS;

  readonly houseForm = { address: '', rooms: 4, rent: 750 };
  readonly roomForm: Partial<RoomVm> & { status: string } = { unit: '', tenant: '', rent: 750, status: 'Vacant' };
  readonly rentForm = { tenant: '', amountDue: 0, amountPaid: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  readonly navItems = [
    { view: 'home' as RentView,     label: 'Dashboard', iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { view: 'grid' as RentView,     label: 'Year Grid', iconPath: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
    { view: 'houses' as RentView,   label: 'Houses',    iconPath: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4' },
    { view: 'expenses' as RentView, label: 'Expenses',  iconPath: 'M18 20V10 M12 20V4 M6 20v-6' },
    { view: 'receipts' as RentView, label: 'Receipts',  iconPath: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z M16 8H8m8 4H8m8 4H8' },
  ];

  readonly currentHouse = computed(() => this.houses().find((h) => h.id === this.houseId()));
  readonly totalPaid = computed(() => this.currentHouse()?.rooms.reduce((s, r) => s + r.paid, 0) ?? 0);
  readonly totalDue  = computed(() => this.currentHouse()?.rooms.reduce((s, r) => s + r.rent, 0) ?? 0);
  readonly outstanding = computed(() => Math.max(0, this.totalDue() - this.totalPaid()));
  readonly occupiedCount = computed(() => this.currentHouse()?.rooms.filter((r) => r.status !== 'Vacant').length ?? 0);
  readonly totalRooms   = computed(() => this.currentHouse()?.rooms.length ?? 0);
  readonly totalCollected = computed(() => this.currencyService.format(this.totalPaid()));

  initials = () => this.authService.user()?.initials ?? '?';
  fmt = (n: number) => this.currencyService.format(n);

  private subs: Subscription[] = [];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('ps_theme_rent') ?? 'light';
    this.theme.set(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    const uid = this.authService.user()?.uid;
    if (uid) {
      const s1 = this.rentService.getHouses(uid).subscribe({
        next: (h) => {
          if (h.length > 0 && !this.houseId()) this.houseId.set(h[0].id);
          this.houses.set(h);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      const s2 = this.rentService.getReceipts(uid).subscribe((r) => this.receipts.set(r));
      this.subs.push(s1, s2);
    } else {
      // Demo mode: seed local state
      this.houses.set(SEED_HOUSES.map((h, i) => ({ ...h, id: `house-${i}` })));
      if (this.houses().length) this.houseId.set(this.houses()[0].id);
      this.loading.set(false);
    }

    this.navService.rememberApp('/rent', 'Rent Tracker');
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  setView(v: RentView): void { this.view.set(v); this.drawerOpen.set(false); }
  selectHouse(id: string): void { this.houseId.set(id); this.houseOpen.set(false); }
  openAddHouse(): void { this.houseOpen.set(false); Object.assign(this.houseForm, { address: '', rooms: 4, rent: 750 }); this.addHouseOpen.set(true); }
  openEditRoom(room: RoomVm): void { Object.assign(this.roomForm, { ...room }); this.editRoomTarget.set(room); }
  openAddRent(room: RoomVm): void { Object.assign(this.rentForm, { tenant: room.tenant, amountDue: room.rent, amountPaid: 0, month: new Date().getMonth() + 1, year: this.year() }); this.addRentTarget.set(room); }

  async submitAddHouse(): Promise<void> {
    const uid = this.authService.user()?.uid;
    if (!uid || !this.houseForm.address.trim()) return;
    this.saveBusy.set(true);
    try {
      const rooms = Array.from({ length: this.houseForm.rooms }, (_, i) => ({
        id: `r${i + 1}`, unit: `Room ${i + 1}`, tenant: '', rent: this.houseForm.rent, paid: 0, status: 'Vacant' as const, beds: 1,
      }));
      await this.rentService.addHouse(uid, { name: this.houseForm.address.split(',')[0], address: this.houseForm.address, rooms });
      this.addHouseOpen.set(false);
      this.toastService.show('House added');
    } catch {
      this.toastService.show('Failed to add house', 'error');
    } finally {
      this.saveBusy.set(false);
    }
  }

  async submitEditRoom(): Promise<void> {
    const uid = this.authService.user()?.uid;
    const house = this.currentHouse();
    const target = this.editRoomTarget();
    if (!uid || !house || !target) return;
    this.saveBusy.set(true);
    try {
      const updated = house.rooms.map((r) => r.id === target.id ? { ...r, ...this.roomForm } as RoomVm : r);
      await this.rentService.saveRooms(uid, house.id, updated);
      this.editRoomTarget.set(null);
      this.toastService.show('Room updated');
    } catch {
      this.toastService.show('Failed to update room', 'error');
    } finally {
      this.saveBusy.set(false);
    }
  }

  async submitAddRent(): Promise<void> {
    const uid = this.authService.user()?.uid;
    const house = this.currentHouse();
    const room = this.addRentTarget();
    if (!uid || !house || !room) return;
    this.saveBusy.set(true);
    try {
      const status = this.rentForm.amountPaid >= this.rentForm.amountDue ? 'Paid' : this.rentForm.amountPaid > 0 ? 'Partial' : 'Pending';
      await this.rentService.addRentEntry(uid, {
        houseId: house.id, roomId: room.id,
        houseName: house.name, roomName: room.unit,
        tenant: this.rentForm.tenant,
        month: this.rentForm.month, year: this.rentForm.year,
        amountDue: this.rentForm.amountDue, amountPaid: this.rentForm.amountPaid,
        status,
      });
      this.addRentTarget.set(null);
      this.toastService.show('Rent entry added');
    } catch {
      this.toastService.show('Failed to add entry', 'error');
    } finally {
      this.saveBusy.set(false);
    }
  }

  statusColor(s: string): string {
    switch (s) { case 'Paid': return 'var(--success-solid)'; case 'Partial': return 'var(--warn-solid)'; case 'Pending': return 'var(--danger-solid)'; default: return 'var(--border-default)'; }
  }
  statusBg(s: string): string {
    switch (s) { case 'Paid': return 'var(--success-bg)'; case 'Partial': return 'var(--warn-bg)'; case 'Pending': return 'var(--danger-bg)'; default: return 'var(--surface-sunken)'; }
  }
  statusFg(s: string): string {
    switch (s) { case 'Paid': return 'var(--success-fg)'; case 'Partial': return 'var(--warn-fg)'; case 'Pending': return 'var(--danger-fg)'; default: return 'var(--text-muted)'; }
  }
  pctWidth(room: RoomVm): string {
    if (room.rent <= 0) return '0%';
    return `${Math.min(100, Math.round((room.paid / room.rent) * 100))}%`;
  }
  catColor(catId: string): string {
    return CATEGORIES.find((c) => c.id === catId)?.color ?? '#6E7773';
  }
}
