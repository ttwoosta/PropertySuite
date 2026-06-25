import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { MaintenanceService, PROPERTIES, ICONS, TINTS } from '../../services/maintenance.service';
import { ToastService } from '../../services/toast.service';
import { TaskVm, TaskFormData, PrepItemVm } from '../../models/maintenance.vm';

type MaintView = 'home' | 'prep' | 'schedule' | 'history';

function dueLabel(dueInDays: number): string {
  if (dueInDays === 0) return 'Today';
  if (dueInDays < 0) return `${Math.abs(dueInDays)} days ago`;
  return `in ${dueInDays} days`;
}

function statusTone(status: TaskVm['status']): string {
  switch (status) {
    case 'overdue': return 'var(--danger-bg)';
    case 'soon': return 'var(--warn-bg)';
    case 'done': return 'var(--success-bg)';
    default: return 'var(--surface-sunken)';
  }
}

function statusText(status: TaskVm['status']): string {
  switch (status) {
    case 'overdue': return 'var(--danger-fg)';
    case 'soon': return 'var(--warn-fg)';
    case 'done': return 'var(--success-fg)';
    default: return 'var(--text-muted)';
  }
}

@Component({
  selector: 'ps-maintenance-app',
  standalone: true,
  imports: [RouterLink, FormsModule, NgTemplateOutlet],
  template: `
    <div class="ps-shell" [class.drawer-open]="drawerOpen()" [attr.data-theme]="theme()" style="--sidebar-width:248px;">
      <!-- Scrim for mobile -->
      <div class="ps-scrim" (click)="drawerOpen.set(false)"></div>

      <!-- Sidebar -->
      <aside class="ps-sidebar" style="display:flex;flex-direction:column;">
        <!-- Logo -->
        <div style="padding:20px 20px 16px;border-bottom:1px solid var(--border-default);">
          <a [routerLink]="['/']" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
            <div style="width:32px;height:32px;background:var(--brand);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style="font-weight:700;font-size:var(--text-sm);color:var(--text-heading);">PropertySuite</span>
          </a>
        </div>

        <!-- Property selector -->
        <div style="padding:12px 16px;border-bottom:1px solid var(--border-default);">
          <p class="eyebrow" style="margin:0 0 8px;">Property</p>
          @for (p of properties; track p.id) {
            <button (click)="propId.set(p.id)" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:none;border-radius:var(--radius-md);cursor:pointer;margin-bottom:2px;" [style.background]="propId() === p.id ? 'var(--surface-active-nav)' : 'transparent'" [attr.data-testid]="'prop-btn-' + p.id">
              <span style="width:8px;height:8px;border-radius:50%;flex:none;" [style.background]="p.color"></span>
              <span style="font-size:var(--text-sm);font-weight:500;color:var(--text-heading);">{{ p.name }}</span>
            </button>
          }
        </div>

        <!-- Nav -->
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

        <!-- Bottom: theme toggle -->
        <div style="padding:16px;border-top:1px solid var(--border-default);">
          <button (click)="toggleTheme()" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:none;border-radius:var(--radius-md);background:transparent;cursor:pointer;width:100%;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (theme() === 'light') {
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              } @else {
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              }
            </svg>
            <span style="font-size:var(--text-sm);color:var(--text-muted);">{{ theme() === 'light' ? 'Dark mode' : 'Light mode' }}</span>
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="ps-main">
        <!-- Topbar -->
        <div class="ps-topbar">
          <button class="ps-hamburger" (click)="drawerOpen.set(!drawerOpen())" style="background:none;border:none;padding:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style="flex:1;">
            <p style="margin:0;font-size:var(--text-sm);font-weight:700;color:var(--text-heading);">Maintenance Scheduler</p>
            <p style="margin:0;font-size:var(--text-xs);color:var(--text-muted);">{{ currentPropName() }}</p>
          </div>
          <a [routerLink]="['/profile']" (click)="rememberApp()" style="text-decoration:none;">
            <div style="width:34px;height:34px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:700;color:var(--brand);">{{ initials() }}</div>
          </a>
        </div>

        <!-- Content -->
        <div class="ps-content">
          <div class="ps-content-inner ps-fade">
            @if (loading()) {
              <div style="display:flex;justify-content:center;padding:60px;"><div class="ps-spin"></div></div>
            } @else if (view() === 'home') {
              <ng-container [ngTemplateOutlet]="homeView"></ng-container>
            } @else if (view() === 'prep') {
              <ng-container [ngTemplateOutlet]="prepView"></ng-container>
            } @else if (view() === 'schedule') {
              <ng-container [ngTemplateOutlet]="scheduleView"></ng-container>
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

    <!-- Task editor modal -->
    @if (editing()) {
      <div style="position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;" (click)="editing.set(null)">
        <div style="background:var(--surface-card);border-radius:var(--radius-lg);padding:28px;width:520px;max-width:calc(100vw - 32px);box-shadow:var(--shadow-pop);" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">{{ editing() === 'new' ? 'Add task' : 'Edit task' }}</h2>
            <button (click)="editing.set(null)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);">✕</button>
          </div>
          <form (ngSubmit)="saveTask()" style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Task name</label>
              <input class="ps-input" [(ngModel)]="editForm.name" name="name" placeholder="e.g. Boiler service" required data-testid="task-name-input"/>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Property</label>
              <select class="ps-select" [(ngModel)]="editForm.property" name="property">
                @for (p of properties; track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div style="display:flex;gap:12px;">
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Frequency</label>
                <select class="ps-select" [(ngModel)]="editForm.recurrence" name="recurrence">
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Type</label>
                <select class="ps-select" [(ngModel)]="editForm.bucket" name="bucket">
                  <option value="Quick">Quick</option>
                  <option value="Long">Long</option>
                </select>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Due in days</label>
              <input type="number" class="ps-input" [(ngModel)]="editForm.dueInDays" name="dueInDays"/>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
              @if (editing() !== 'new') {
                <button type="button" (click)="deleteTask()" class="ps-btn" style="background:var(--danger-bg);color:var(--danger-fg);border:none;" data-testid="btn-delete-task">Delete</button>
              }
              <button type="button" (click)="editing.set(null)" class="ps-btn ps-btn-ghost">Cancel</button>
              <button type="submit" class="ps-btn ps-btn-primary" [disabled]="saveBusy()" data-testid="btn-save-task">
                @if (saveBusy()) { Saving… } @else { Save }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Templates for views -->
    <ng-template #homeView>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <p class="eyebrow" style="margin:0 0 2px;">{{ currentPropName() }}</p>
          <h2 style="margin:0;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Overview</h2>
        </div>
        <button (click)="openNew()" class="ps-btn ps-btn-primary" data-testid="btn-add-task">+ Add task</button>
      </div>

      @if (overdueItems().length) {
        <div style="margin-bottom:20px;">
          <p class="eyebrow" style="margin:0 0 10px;color:var(--danger-fg);">Overdue</p>
          @for (task of overdueItems(); track task.id) {
            <ng-container [ngTemplateOutlet]="taskRow" [ngTemplateOutletContext]="{ $implicit: task }"></ng-container>
          }
        </div>
      }
      @if (soonItems().length) {
        <div style="margin-bottom:20px;">
          <p class="eyebrow" style="margin:0 0 10px;color:var(--warn-fg);">Due soon</p>
          @for (task of soonItems(); track task.id) {
            <ng-container [ngTemplateOutlet]="taskRow" [ngTemplateOutletContext]="{ $implicit: task }"></ng-container>
          }
        </div>
      }
      @if (upcomingItems().length) {
        <div style="margin-bottom:20px;">
          <p class="eyebrow" style="margin:0 0 10px;">Upcoming</p>
          @for (task of upcomingItems(); track task.id) {
            <ng-container [ngTemplateOutlet]="taskRow" [ngTemplateOutletContext]="{ $implicit: task }"></ng-container>
          }
        </div>
      }
      @if (doneItems().length) {
        <div>
          <p class="eyebrow" style="margin:0 0 10px;color:var(--text-muted);">Done</p>
          @for (task of doneItems(); track task.id) {
            <ng-container [ngTemplateOutlet]="taskRow" [ngTemplateOutletContext]="{ $implicit: task }"></ng-container>
          }
        </div>
      }
      @if (!filteredTasks().length) {
        <div style="text-align:center;padding:60px;color:var(--text-muted);">
          <p style="font-size:var(--text-lg);margin:0 0 8px;">No tasks for this property</p>
          <p style="font-size:var(--text-sm);margin:0;">Add a task to get started.</p>
        </div>
      }
    </ng-template>

    <ng-template #taskRow let-task>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);margin-bottom:8px;" data-testid="task-row">
        <input type="checkbox" [checked]="task.done" (change)="toggleDone(task)" style="width:18px;height:18px;accent-color:var(--brand);cursor:pointer;flex:none;"/>
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);" [style.text-decoration]="task.done ? 'line-through' : 'none'">{{ task.name }}</p>
          <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ task.recurrence }} · {{ task.durationMin }} min</p>
        </div>
        <span style="font-size:var(--text-xs);font-weight:600;padding:3px 8px;border-radius:var(--radius-pill);" [style.background]="statusTone(task.status)" [style.color]="statusText(task.status)">{{ dueLabel(task.dueInDays) }}</span>
        <button (click)="openEdit(task)" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);" data-testid="btn-edit-task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
        </button>
      </div>
    </ng-template>

    <ng-template #prepView>
      <h2 style="margin:0 0 20px;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Prep Checklists</h2>
      @for (task of filteredTasks(); track task.id) {
        @if (task.prep.length > 0) {
          <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;">
            <p style="margin:0 0 10px;font-weight:600;color:var(--text-heading);">{{ task.name }}</p>
            @for (p of task.prep; track p.id) {
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border-subtle);">
                <input type="checkbox" [checked]="p.done" (change)="togglePrep(task, p)" style="accent-color:var(--brand);cursor:pointer;"/>
                <span style="font-size:var(--text-sm);color:var(--text-body);" [style.text-decoration]="p.done ? 'line-through' : 'none'">{{ p.label }}</span>
              </div>
            }
          </div>
        }
      }
      @if (!filteredTasks().some(t => t.prep.length > 0)) {
        <div style="text-align:center;padding:60px;color:var(--text-muted);">No prep items for this property.</div>
      }
    </ng-template>

    <ng-template #scheduleView>
      <h2 style="margin:0 0 20px;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Schedule</h2>
      @for (task of sortedByDue(); track task.id) {
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);margin-bottom:8px;">
          <div style="flex:1;">
            <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ task.name }}</p>
            <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ task.recurrence }} · {{ task.durationMin }} min</p>
          </div>
          <span style="font-size:var(--text-xs);font-weight:600;padding:3px 8px;border-radius:var(--radius-pill);" [style.background]="statusTone(task.status)" [style.color]="statusText(task.status)">{{ dueLabel(task.dueInDays) }}</span>
        </div>
      }
    </ng-template>
  `,
})
export class MaintenanceAppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private maintService = inject(MaintenanceService);
  private navService = inject(NavService);
  readonly toastService = inject(ToastService);

  readonly properties = PROPERTIES;
  readonly propId = signal('elm');
  readonly view = signal<MaintView>('home');
  readonly theme = signal<'light' | 'dark'>('light');
  readonly drawerOpen = signal(false);
  readonly loading = signal(true);
  readonly saveBusy = signal(false);
  readonly editing = signal<TaskVm | 'new' | null>(null);

  readonly editForm: TaskFormData = {
    name: '', icon: 'wrench', tint: '#2D6A4F',
    durationMin: 60, bucket: 'Quick',
    recurrence: 'Monthly', property: 'elm', dueInDays: 7,
  };

  private tasks = signal<TaskVm[]>([]);
  private sub?: Subscription;

  readonly navItems = [
    { view: 'home' as MaintView, label: 'Home', iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { view: 'prep' as MaintView, label: 'Prep',     iconPath: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { view: 'schedule' as MaintView, label: 'Schedule', iconPath: 'M8 2v4 M16 2v4 M3 10h18 M21 8H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z' },
  ];

  readonly filteredTasks = computed(() =>
    this.tasks().filter((t) => t.property === this.propId())
  );
  readonly overdueItems = computed(() => this.filteredTasks().filter((t) => t.status === 'overdue'));
  readonly soonItems    = computed(() => this.filteredTasks().filter((t) => t.status === 'soon'));
  readonly upcomingItems = computed(() => this.filteredTasks().filter((t) => t.status === 'upcoming'));
  readonly doneItems    = computed(() => this.filteredTasks().filter((t) => t.status === 'done'));
  readonly sortedByDue  = computed(() => [...this.filteredTasks()].sort((a, b) => a.dueInDays - b.dueInDays));

  currentPropName = computed(() => PROPERTIES.find((p) => p.id === this.propId())?.name ?? '');
  initials = () => this.authService.user()?.initials ?? '?';

  readonly dueLabel = dueLabel;
  readonly statusTone = statusTone;
  readonly statusText = statusText;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('ps_theme_maintenance') ?? 'light';
    this.theme.set(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    const uid = this.authService.user()?.uid;
    if (uid) {
      this.sub = this.maintService.getTasks(uid).subscribe({
        next: (tasks) => { this.tasks.set(tasks); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
      this.maintService.seedIfEmpty(uid).catch(console.error);
    } else {
      this.loading.set(false);
    }

    this.navService.rememberApp('/maintenance', 'Maintenance');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setView(v: MaintView): void {
    this.view.set(v);
    this.drawerOpen.set(false);
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('ps_theme_maintenance', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  rememberApp(): void {
    this.navService.rememberApp('/maintenance', 'Maintenance');
  }

  openNew(): void {
    Object.assign(this.editForm, {
      name: '', icon: 'wrench', tint: '#2D6A4F',
      durationMin: 60, bucket: 'Quick',
      recurrence: 'Monthly', property: this.propId(), dueInDays: 7,
      id: undefined,
    });
    this.editing.set('new');
  }

  openEdit(task: TaskVm): void {
    Object.assign(this.editForm, {
      id: task.id, name: task.name, icon: task.icon, tint: task.tint,
      durationMin: task.durationMin, bucket: task.bucket,
      recurrence: task.recurrence, property: task.property, dueInDays: task.dueInDays,
    });
    this.editing.set(task);
  }

  async saveTask(): Promise<void> {
    const uid = this.authService.user()?.uid;
    if (!uid || !this.editForm.name.trim()) return;
    this.saveBusy.set(true);
    try {
      await this.maintService.saveTask(uid, { ...this.editForm });
      this.editing.set(null);
      this.toastService.show('Task saved');
    } catch {
      this.toastService.show('Failed to save task', 'error');
    } finally {
      this.saveBusy.set(false);
    }
  }

  async deleteTask(): Promise<void> {
    const uid = this.authService.user()?.uid;
    const t = this.editing();
    if (!uid || !t || t === 'new' || !t.id) return;
    this.saveBusy.set(true);
    try {
      await this.maintService.deleteTask(uid, t.id);
      this.editing.set(null);
      this.toastService.show('Task deleted');
    } catch {
      this.toastService.show('Failed to delete task', 'error');
    } finally {
      this.saveBusy.set(false);
    }
  }

  async toggleDone(task: TaskVm): Promise<void> {
    const uid = this.authService.user()?.uid;
    if (!uid) return;
    await this.maintService.toggleDone(uid, task.id, !task.done);
  }

  async togglePrep(task: TaskVm, prep: PrepItemVm): Promise<void> {
    const uid = this.authService.user()?.uid;
    if (!uid) return;
    const updated = task.prep.map((p) => p.id === prep.id ? { ...p, done: !p.done } : p);
    await this.maintService.updatePrepItem(uid, task.id, updated);
  }
}
