/* Property Suite — multi-device showcase.
   Shows the real, responsive launcher (Property Suite.html) running inside an
   iPhone bezel (mobile icon-grid layout) and an iPad bezel (two-column cards). */
const { useEffect } = React;

const APP_SRC = 'Property Suite.html';

// Scale a fixed-size device down to fit the showcase layout while its iframe
// still reports its true CSS width (so container queries pick the right layout).
function Scaled({ scale, w, h, children, label }) {
  return (
    <div style={{ width: w * scale, height: h * scale, flex: 'none' }} data-screen-label={label}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

// iPhone — reuse the starter IOSDevice bezel, wrapped in a black aluminium edge.
function Phone() {
  return (
    <div style={{
      padding: 13, background: 'linear-gradient(150deg, #2b2e2d, #0c0d0d)',
      borderRadius: 61, boxShadow: '0 50px 90px -30px rgba(12,16,14,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
    }}>
      <IOSDevice width={390} height={844}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 56, flex: 'none' }} />
          <iframe src={APP_SRC} title="Property Suite on iPhone"
            style={{ flex: 1, width: '100%', border: 0, background: '#fff' }} />
          <div style={{ height: 22, flex: 'none' }} />
        </div>
      </IOSDevice>
    </div>
  );
}

// iPad — custom uniform-bezel tablet (landscape), modern home-button-less.
function IPad() {
  const screenW = 1080, screenH = 808;
  return (
    <div style={{
      position: 'relative',
      padding: 24, background: 'linear-gradient(150deg, #2b2e2d, #0c0d0d)',
      borderRadius: 40, boxShadow: '0 50px 90px -30px rgba(12,16,14,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
    }}>
      {/* front camera */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 7, height: 7, borderRadius: 999, background: '#0a0c0b',
        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08)',
      }} />
      <div style={{
        width: screenW, height: screenH, borderRadius: 16, overflow: 'hidden',
        background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.4) inset',
      }}>
        <iframe src={APP_SRC} title="Property Suite on iPad"
          style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
      </div>
    </div>
  );
}

function Showcase() {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <div className="dev-wrap">
      <header className="dev-top">
        <a className="dev-brand" href={APP_SRC}>
          <img src="assets/logo-mark.svg" width="32" height="32" alt="" />
          <span>Property Suite</span>
        </a>
        <a className="dev-back" href={APP_SRC}>
          <i data-lucide="arrow-left"></i> Open the app
        </a>
      </header>

      <div className="dev-body">
        <div className="dev-stage ps-fade">
          <Scaled scale={0.62} w={1128} h={856} label="iPad"><IPad /></Scaled>
          <Scaled scale={0.62} w={416} h={870} label="iPhone"><Phone /></Scaled>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Showcase />);
