/* TenantBridge — Thread + AI Assistant views (exported to window). */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const TDS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, IconButton, Badge, Avatar, Card } = TDS;
  const { TENANTS, HISTORY } = window.TENANT;

  const CHANNEL_ICON = { sms: 'message-square', email: 'mail', note: 'sticky-note' };

  /* ---------- AI orb ---------- */
  function AiOrb({ size = 18 }) {
    return (
      <span style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', background: 'conic-gradient(from 0deg, var(--green-500), var(--blue-400), var(--amber-400), var(--green-500))',
        animation: 'ai-spin 4s linear infinite', boxShadow: '0 0 10px color-mix(in srgb, var(--brand) 40%, transparent)' }}>
        <span style={{ width: size - 6, height: size - 6, borderRadius: '50%', background: 'var(--surface-card)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
          <span style={{ display: 'inline-flex', width: size - 12, height: size - 12 }}><i data-lucide="sparkles"></i></span>
        </span>
      </span>
    );
  }

  /* ---------- chat composer ---------- */
  function Composer({ channel, onChannel, onSend, disabled, placeholder }) {
    const [text, setText] = useState('');
    const ref = useRef(null);
    useEffect(() => { if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + 'px'; } }, [text]);
    const send = () => { if (!text.trim() || disabled) return; onSend(text.trim()); setText(''); };
    const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

    const CHAN = [
      { id: 'sms', label: 'SMS', icon: 'message-square' },
      { id: 'email', label: 'Email', icon: 'mail' },
      { id: 'note', label: 'Note', icon: 'sticky-note' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: 'var(--surface-card)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        {channel != null && (
          <div style={{ display: 'flex', gap: 6 }}>
            {CHAN.map(c => {
              const on = channel === c.id;
              return (
                <button key={c.id} onClick={() => onChannel(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 11px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
                  background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
                  color: on ? 'var(--brand-on-tint)' : 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', width: 13, height: 13 }}><i data-lucide={c.icon}></i></span>
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <textarea ref={ref} value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey}
            placeholder={placeholder || 'Type a message…'} rows={1}
            style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-heading)',
              minHeight: 22, maxHeight: 180, lineHeight: 1.45 }} />
          <Button variant="primary" size="md" disabled={!text.trim() || disabled} onClick={send}>
            <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide="send"></i></span>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- Thread view ---------- */
  function ThreadView({ tenant, msgs, suggestions, onSend, onApprove, onDismiss, onEditDraft }) {
    const [sub, setSub] = useState('messages');
    const [channel, setChannel] = useState('sms');
    const [notes, setNotes] = useState('');
    const tabs = [
      { value: 'messages', label: 'Messages' },
      { value: 'ai', label: 'AI Suggestions' + (suggestions.length ? ' · ' + suggestions.length : '') },
      { value: 'profile', label: 'Profile' },
    ];

    return (
      <div className="ps-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        {/* header card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Avatar name={tenant.name} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{tenant.name}</span>
                <Badge tone="success" size="sm">Occupied</Badge>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{tenant.unit} · 14 Elm Road</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" leadingIcon={di('message-square')} onClick={() => { setSub('messages'); setChannel('sms'); }}>Text</Button>
              <Button variant="secondary" size="sm" leadingIcon={di('mail')} onClick={() => { setSub('messages'); setChannel('email'); }}>Email</Button>
              <Button variant="secondary" size="sm" leadingIcon={di('sticky-note')} onClick={() => { setSub('messages'); setChannel('note'); }}>Note</Button>
            </div>
          </div>
        </Card>

        <Segmented ariaLabel="Thread sections" value={sub} onChange={setSub} options={tabs} />

        {sub === 'messages' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9, padding: 6 }}>
              {msgs.length === 0
                ? <EmptyState icon="message-circle" title="No messages yet" body="Send a text or write a private note to start the thread." />
                : msgs.map(m => <Bubble key={m.id} m={m} />)}
            </div>
            <Composer channel={channel} onChannel={setChannel}
              onSend={(t) => onSend({ id: 'n' + Date.now(), who: 'you', channel, text: t, when: 'Just now' })}
              placeholder={channel === 'note' ? 'Add a private note (landlord-only)…' : 'Type a message…'} />
          </div>
        )}

        {sub === 'ai' && (
          <div className="ps-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(120deg, color-mix(in srgb, var(--brand) 8%, var(--surface-card)) 0%, var(--surface-card) 60%)',
              border: '1px solid color-mix(in srgb, var(--brand) 22%, var(--border-default))' }}>
              <AiOrb size={22} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>AI is watching {tenant.name.split(' ')[0]}{'\u2019'}s patterns</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{suggestions.length} pending suggestion{suggestions.length === 1 ? '' : 's'}</div>
              </div>
            </div>
            {suggestions.length === 0
              ? <EmptyState icon="sparkles" title="All caught up" body="No outstanding AI suggestions for this tenant." />
              : suggestions.map(s => <SuggestionCard key={s.id} s={s} onApprove={onApprove} onDismiss={onDismiss} onEditDraft={onEditDraft} />)}
          </div>
        )}

        {sub === 'profile' && (
          <div className="ps-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <Card>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 12 }}>Preferences</div>
              {[
                { ic: 'clock', l: 'Preferred contact time', v: tenant.preferTime },
                { ic: 'message-circle', l: 'Communication style', v: tenant.style },
                { ic: 'credit-card', l: 'Payment pattern', v: tenant.payment },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
                  <Icon name={r.ic} size={16} style={{ color: 'var(--text-muted)', marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{r.l}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }}>{r.v}</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 12 }}>Maintenance history</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(HISTORY[tenant.id] || []).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)' }} />
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{h.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{h.when}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>Private notes</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 10 }}>Landlord-only · not sent to tenant.</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this tenant…"
                style={{ width: '100%', minHeight: 100, padding: 10, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
                  background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                  resize: 'vertical', outline: 'none', color: 'var(--text-heading)' }} />
            </Card>
          </div>
        )}
      </div>
    );
  }

  function Bubble({ m }) {
    if (m.who === 'note') {
      return (
        <div style={{ alignSelf: 'center', maxWidth: '80%', padding: '9px 13px', background: 'var(--amber-50)',
          color: 'var(--amber-700)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--amber-400) 28%, transparent)',
          fontSize: 'var(--text-sm)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', fontWeight: 600, marginBottom: 2 }}>
            <Icon name="sticky-note" size={13} /> Note · {m.when}
          </div>
          {m.text}
        </div>
      );
    }
    const me = m.who === 'you';
    return (
      <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '9px 14px', borderRadius: 'var(--radius-md)',
          background: me ? 'var(--brand)' : 'var(--surface-card)',
          color: me ? 'var(--text-on-brand)' : 'var(--text-heading)',
          border: me ? 'none' : '1px solid var(--border-default)',
          fontSize: 'var(--text-sm)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
          alignSelf: me ? 'flex-end' : 'flex-start' }}>
          <Icon name={CHANNEL_ICON[m.channel] || 'message-square'} size={12} />
          {m.when}
          {m.aiDrafted && <Badge tone="brand" size="sm"><span style={{ display: 'inline-flex', width: 10, height: 10, marginRight: 3 }}><i data-lucide="sparkles"></i></span>AI Drafted</Badge>}
        </div>
      </div>
    );
  }

  function SuggestionCard({ s, onApprove, onDismiss, onEditDraft }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(s.draft);
    useEffect(() => { setDraft(s.draft); }, [s.draft]);
    const TONE = { Friendly: 'success', Reminder: 'warning', Informational: 'brand' };
    return (
      <Card style={{ borderColor: 'color-mix(in srgb, var(--brand) 18%, var(--border-default))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <AiOrb size={16} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{s.trigger}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge tone="neutral" size="sm">{s.source}</Badge>
              <Badge tone={TONE[s.tone] || 'neutral'} size="sm">{s.tone}</Badge>
            </div>
          </div>
          <IconButton label="Dismiss" variant="ghost" size="sm" onClick={() => onDismiss(s.id)}>{di('x')}</IconButton>
        </div>
        {editing ? (
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            style={{ width: '100%', minHeight: 100, padding: 11, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
              background: 'var(--surface-card)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-md)',
              resize: 'vertical', outline: 'none', boxShadow: 'var(--ring)', color: 'var(--text-heading)', lineHeight: 1.55 }} />
        ) : (
          <div style={{ padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{draft}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          {editing
            ? <Button variant="secondary" size="sm" onClick={() => { onEditDraft(s.id, draft); setEditing(false); }}>Save edit</Button>
            : <Button variant="ghost" size="sm" leadingIcon={di('pencil')} onClick={() => setEditing(true)}>Edit</Button>}
          <Button variant="primary" size="sm" leadingIcon={di('send')} onClick={() => onApprove(s.id, draft)}>Approve &amp; Send</Button>
        </div>
      </Card>
    );
  }

  /* ---------- AI Assistant (full chat) ---------- */
  const OPENING = "Hi! I'm your TenantBridge assistant. I can draft messages to tenants, summarize what's happening at each property, or help plan visits. What can I help with today?";
  const CHIPS = [
    'Remind Marcus the boiler service is on Thursday',
    'Draft a polite payment reminder to Priya',
    'Summarize this week\u2019s tenant updates',
    'What\u2019s overdue across my portfolio?',
  ];

  function AIAssistant() {
    const [msgs, setMsgs] = useState([{ role: 'assistant', content: OPENING }]);
    const [busy, setBusy] = useState(false);
    const scrollerRef = useRef(null);
    useEffect(() => {
      const s = scrollerRef.current; if (s) s.scrollTop = s.scrollHeight;
    }, [msgs, busy]);

    const send = async (text) => {
      if (!text || busy) return;
      const next = [...msgs, { role: 'user', content: text }];
      setMsgs(next); setBusy(true);
      try {
        const reply = await window.claude.complete({
          messages: [
            { role: 'user', content:
              'You are a calm, practical AI assistant inside TenantBridge — a landlord tool. ' +
              'Help with drafting tenant messages, planning maintenance, and quick summaries. ' +
              'Keep replies short (under 5 sentences), use plain language, no emoji.\n\n' +
              'Conversation so far:\n' +
              next.map(m => (m.role === 'user' ? 'Landlord: ' : 'Assistant: ') + m.content).join('\n\n')
            },
          ],
        });
        setMsgs(m => [...m, { role: 'assistant', content: String(reply || '').trim() || 'Sorry — no reply.' }]);
      } catch (e) {
        setMsgs(m => [...m, { role: 'assistant', content: 'Sorry, I hit an error reaching the model. Try again in a moment.' }]);
      } finally { setBusy(false); }
    };

    const fresh = msgs.length <= 1;
    return (
      <div className="ps-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div ref={scrollerRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, padding: 6 }}>
          {msgs.map((m, i) => m.role === 'assistant'
            ? (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AiOrb size={26} />
                <div style={{ flex: 1, maxWidth: 540, padding: '11px 14px', background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                  color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </div>
            )
            : (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: 540, padding: '11px 14px', background: 'var(--brand)', color: 'var(--text-on-brand)',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </div>
            )
          )}
          {busy && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AiOrb size={26} />
              <div style={{ padding: '13px 16px', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', display: 'flex', gap: 5 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--text-faint)', animation: `ai-dot 1.2s ${i*0.15}s infinite ease-in-out` }} />)}
              </div>
            </div>
          )}
        </div>
        {fresh && (
          <div className="ps-scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            {CHIPS.map(c => (
              <button key={c} onClick={() => send(c)} style={{ flex: 'none', padding: '8px 13px', cursor: 'pointer',
                background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)', color: 'var(--text-body)', whiteSpace: 'nowrap' }}>{c}</button>
            ))}
          </div>
        )}
        <Composer onSend={send} disabled={busy} placeholder="Ask anything about your tenants…" />
      </div>
    );
  }

  /* keyframes — inject once */
  if (!document.getElementById('ai-kf')) {
    const s = document.createElement('style'); s.id = 'ai-kf';
    s.textContent = `@keyframes ai-spin{to{transform:rotate(360deg)}}
      @keyframes ai-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`;
    document.head.appendChild(s);
  }

  Object.assign(window, { ThreadView, AIAssistant, AiOrb });
})();
