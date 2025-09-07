// Simple live-reload client that polls a version file
(function () {
  const FILE = 'live-reload.json';
  const INTERVAL = 1000;
  let current = null;
  let timer = null;

  async function fetchVersion() {
    try {
      const res = await fetch(`${FILE}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.version ? String(data.version) : null;
    } catch {
      return null;
    }
  }

  async function tick() {
    const v = await fetchVersion();
    if (v == null) return; // likely prod or offline; keep trying silently
    if (current == null) {
      current = v;
      return;
    }
    if (v !== current) {
      console.log('[live-reload] change detected -> reloading');
      window.location.reload();
    }
  }

  function start() {
    // Run once soon after load, then every INTERVAL
    tick();
    timer = setInterval(tick, INTERVAL);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      // When tab regains focus, check immediately
      tick();
    });
    console.log('[live-reload] client active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

