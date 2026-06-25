import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { ToastService } from '../../services/toast.service';
import { TenantVm, MessageVm, Suggestion, QueueItem, TenantProp, Channel } from '../../models/tenant.vm';

const PROPS: TenantProp[] = [
  { id: 'elm',  name: 'Elm Road',   color: '#4FAE86' },
  { id: 'birch', name: 'Birch Lane', color: '#3E78B8' },
];

const TENANTS: TenantVm[] = [
  { id: 'marcus', name: 'Marcus Chen',  unit: 'Elm Rd · Room 2', prop: 'elm',  score: 4.8, lastContact: 2,  style: 'Direct',   payment: 'On time', preferTime: 'Evenings' },
  { id: 'sara',   name: 'Sara Mitchell',unit: 'Elm Rd · Room 3', prop: 'elm',  score: 3.9, lastContact: 8,  style: 'Formal',   payment: 'Late',    preferTime: 'Mornings' },
  { id: 'james',  name: 'James O.',     unit: 'Birch · Room 1',  prop: 'birch', score: 5.0, lastContact: 1,  style: 'Friendly', payment: 'On time', preferTime: 'Anytime' },
  { id: 'priya',  name: 'Priya S.',     unit: 'Birch · Room 2',  prop: 'birch', score: 4.2, lastContact: 14, style: 'Concise',  payment: 'On time', preferTime: 'Mornings' },
];

const SEED_THREADS: Record<string, MessageVm[]> = {
  marcus: [
    { id: 'm1', tenantId: 'marcus', who: 'them', text: 'Hi, the boiler is making a strange noise again.', when: new Date(Date.now() - 2 * 86400000) },
    { id: 'm2', tenantId: 'marcus', who: 'you',  text: "Thanks for letting me know. I'll arrange an engineer visit.", when: new Date(Date.now() - 86400000) },
  ],
  sara: [
    { id: 's1', tenantId: 'sara', who: 'them', text: 'When is the rent due this month?', when: new Date(Date.now() - 8 * 86400000) },
  ],
};

const SUGGESTIONS: Suggestion[] = [
  { id: 'sg1', tenant: 'Sara Mitchell', source: 'Rent overdue 8 days', tone: 'Reminder', trigger: 'Rent overdue', draft: 'Hi Sara, a gentle reminder that this month\'s rent is now 8 days overdue. Please arrange payment at your earliest convenience.' },
  { id: 'sg2', tenant: 'Priya S.',      source: 'No contact 14 days',  tone: 'Friendly', trigger: 'No contact',   draft: 'Hi Priya, just checking in to see how you\'re settling in. Let me know if there\'s anything I can help with.' },
];

type TenantView = 'tenants' | 'thread' | 'ai' | 'queue';

@Component({
  selector: 'ps-tenant-app',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="ps-shell" [class.drawer-open]="drawerOpen()" [attr.data-theme]="theme()">
      <div class="ps-scrim" (click)="drawerOpen.set(false)"></div>

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
              @if (item.badge && item.badge > 0) {
                <span style="margin-left:auto;background:var(--danger-solid);color:#fff;font-size:10px;font-weight:700;border-radius:999px;padding:2px 6px;">{{ item.badge }}</span>
              }
            </button>
          }
        </nav>
        <div style="padding:16px;border-top:1px solid var(--border-default);">
          <button (click)="toggleTheme()" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:none;border-radius:var(--radius-md);background:transparent;cursor:pointer;width:100%;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (theme() === 'light') {
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              } @else {
                <circle cx="12" cy="12" r="5"/>
              }
            </svg>
            <span style="font-size:var(--text-sm);color:var(--text-muted);">{{ theme() === 'light' ? 'Dark mode' : 'Light mode' }}</span>
          </button>
        </div>
      </aside>

      <div class="ps-main">
        <div class="ps-topbar">
          <button class="ps-hamburger" (click)="drawerOpen.set(!drawerOpen())" style="background:none;border:none;padding:8px;cursor:pointer;display:inline-flex;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style="flex:1;">
            <p style="margin:0;font-size:var(--text-sm);font-weight:700;color:var(--text-heading);">TenantBridge</p>
            <p style="margin:0;font-size:var(--text-xs);color:var(--text-muted);">{{ viewLabel() }}</p>
          </div>
          <a [routerLink]="['/profile']" style="text-decoration:none;">
            <div style="width:34px;height:34px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:700;color:var(--brand);">{{ initials() }}</div>
          </a>
        </div>

        <div class="ps-content">
          <div class="ps-fade" style="height:100%;display:flex;flex-direction:column;">
            @if (view() === 'tenants') {
              <div class="ps-content-inner" data-testid="tenants-view">
                <h2 style="margin:0 0 20px;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Tenants</h2>
                @for (prop of props; track prop.id) {
                  <div style="margin-bottom:28px;">
                    <p class="eyebrow" style="margin:0 0 12px;" [style.color]="prop.color">{{ prop.name }}</p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
                      @for (t of tenantsByProp(prop.id); track t.id) {
                        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:16px;cursor:pointer;" (click)="openThread(t.id)" data-testid="tenant-card">
                          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                            <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-sm);font-weight:700;color:var(--brand);">{{ initials2(t.name) }}</div>
                            <div>
                              <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ t.name }}</p>
                              <p style="margin:0;font-size:var(--text-xs);color:var(--text-muted);">{{ t.unit }}</p>
                            </div>
                          </div>
                          <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:var(--text-xs);color:var(--text-muted);">Score: <strong style="color:var(--text-body);">{{ t.score }}/5</strong></span>
                            <span style="font-size:var(--text-xs);" [style.color]="t.lastContact > 7 ? 'var(--warn-fg)' : 'var(--text-muted)'">{{ t.lastContact }}d ago</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else if (view() === 'thread') {
              <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;" data-testid="thread-view">
                <div style="padding:16px 24px;border-bottom:1px solid var(--border-default);">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <button (click)="setView('tenants')" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div style="width:34px;height:34px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:700;color:var(--brand);">{{ initials2(activeTenant()?.name ?? '') }}</div>
                    <div>
                      <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ activeTenant()?.name }}</p>
                      <p style="margin:0;font-size:var(--text-xs);color:var(--text-muted);">{{ activeTenant()?.unit }}</p>
                    </div>
                  </div>
                </div>
                <div style="flex:1;overflow-y:auto;padding:16px 24px;display:flex;flex-direction:column;gap:10px;" data-testid="messages-list">
                  @for (msg of activeMessages(); track msg.id) {
                    <div style="display:flex;" [style.justify-content]="msg.who === 'you' ? 'flex-end' : 'flex-start'">
                      <div style="max-width:70%;padding:10px 14px;border-radius:var(--radius-lg);font-size:var(--text-sm);"
                        [style.background]="msg.who === 'you' ? 'var(--brand)' : 'var(--surface-card)'"
                        [style.color]="msg.who === 'you' ? '#fff' : 'var(--text-heading)'"
                        [style.border]="msg.who !== 'you' ? '1px solid var(--border-default)' : 'none'"
                        data-testid="message-bubble">
                        {{ msg.text }}
                      </div>
                    </div>
                  }
                </div>
                <div style="padding:16px 24px;border-top:1px solid var(--border-default);display:flex;gap:10px;">
                  <input class="ps-input" [(ngModel)]="composerText" name="msg" placeholder="Type a message…" (keydown.enter)="sendMsg()" data-testid="composer-input" style="flex:1;"/>
                  <button (click)="sendMsg()" class="ps-btn ps-btn-primary" [disabled]="!composerText.trim()" data-testid="btn-send">Send</button>
                </div>
              </div>
            } @else if (view() === 'ai') {
              <div class="ps-content-inner" data-testid="ai-suggestions-view">
                <h2 style="margin:0 0 20px;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">AI Suggestions</h2>
                @for (s of suggestions(); track s.id) {
                  <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:20px;margin-bottom:14px;" data-testid="suggestion-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                      <div>
                        <p style="margin:0;font-weight:600;font-size:var(--text-sm);color:var(--text-heading);">{{ s.tenant }}</p>
                        <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ s.trigger }}</p>
                      </div>
                      <div style="display:flex;gap:6px;">
                        <span style="font-size:var(--text-xs);font-weight:600;padding:3px 8px;border-radius:var(--radius-pill);background:var(--brand-tint);color:var(--brand);">{{ s.tone }}</span>
                        <button (click)="dismissSugg(s.id)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;" data-testid="btn-dismiss">✕</button>
                      </div>
                    </div>
                    <textarea class="ps-ta" [(ngModel)]="s.draft" [name]="'draft-' + s.id" rows="3" data-testid="suggestion-draft"></textarea>
                    <div style="display:flex;justify-content:flex-end;margin-top:10px;">
                      <button (click)="approveSugg(s)" class="ps-btn ps-btn-primary" data-testid="btn-approve">Approve &amp; send</button>
                    </div>
                  </div>
                }
                @if (suggestions().length === 0) {
                  <div style="text-align:center;padding:60px;color:var(--text-muted);">No suggestions right now.</div>
                }
              </div>
            } @else if (view() === 'queue') {
              <div class="ps-content-inner" data-testid="queue-view">
                <h2 style="margin:0 0 20px;font-size:var(--text-2xl);font-weight:700;color:var(--text-heading);">Scheduled sends</h2>
                <div style="text-align:center;padding:60px;color:var(--text-muted);">Queue is empty.</div>
              </div>
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
  `,
})
export class TenantAppComponent implements OnInit {
  private authService = inject(AuthService);
  private navService = inject(NavService);
  readonly toastService = inject(ToastService);

  readonly view = signal<TenantView>('tenants');
  readonly tenantId = signal<string>('marcus');
  readonly drawerOpen = signal(false);
  readonly theme = signal<'light' | 'dark'>('light');
  readonly suggestions = signal<Suggestion[]>(SEED_SUGGESTIONS());
  readonly threads = signal<Record<string, MessageVm[]>>({ ...SEED_THREADS });

  composerText = '';

  readonly props = PROPS;

  readonly navItems = [
    { view: 'tenants' as TenantView, label: 'Tenants', iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', badge: 0 },
    { view: 'ai' as TenantView,      label: 'AI Suggestions', iconPath: 'M12 3l1.09 3.26L16.5 7.5l-3.41 1.24L12 12l-1.09-3.26L7.5 7.5l3.41-1.24L12 3z', badge: 2 },
    { view: 'queue' as TenantView,   label: 'Queue', iconPath: 'M8 2v4 M16 2v4 M3 10h18 M21 8H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z', badge: 0 },
  ];

  readonly activeTenant = () => TENANTS.find((t) => t.id === this.tenantId());
  readonly activeMessages = () => this.threads()[this.tenantId()] ?? [];
  readonly viewLabel = () => {
    if (this.view() === 'thread') return this.activeTenant()?.name ?? 'Thread';
    return this.navItems.find((n) => n.view === this.view())?.label ?? '';
  };

  initials = () => this.authService.user()?.initials ?? '?';
  initials2 = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  tenantsByProp = (propId: string) => TENANTS.filter((t) => t.prop === propId);

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('ps_theme_tenant') ?? 'light';
    this.theme.set(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.navService.rememberApp('/tenant-bridge', 'TenantBridge');
  }

  setView(v: TenantView): void { this.view.set(v); this.drawerOpen.set(false); }
  openThread(id: string): void { this.tenantId.set(id); this.view.set('thread'); }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('ps_theme_tenant', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  sendMsg(): void {
    const text = this.composerText.trim();
    if (!text) return;
    const msg: MessageVm = { id: `m${Date.now()}`, tenantId: this.tenantId(), who: 'you', text, when: new Date() };
    this.threads.update((t) => ({ ...t, [this.tenantId()]: [...(t[this.tenantId()] ?? []), msg] }));
    this.composerText = '';
  }

  dismissSugg(id: string): void {
    this.suggestions.update((s) => s.filter((sg) => sg.id !== id));
  }

  approveSugg(s: Suggestion): void {
    this.sendMsg();
    const tenantId = TENANTS.find((t) => t.name === s.tenant)?.id ?? this.tenantId();
    const msg: MessageVm = { id: `m${Date.now()}`, tenantId, who: 'you', text: s.draft, when: new Date(), aiDrafted: true };
    this.threads.update((t) => ({ ...t, [tenantId]: [...(t[tenantId] ?? []), msg] }));
    this.dismissSugg(s.id);
    this.toastService.show('Message sent');
  }
}

function SEED_SUGGESTIONS(): Suggestion[] {
  return SUGGESTIONS.map((s) => ({ ...s }));
}
