/* ============================================================
   loader.js — Pixel loading bar + "Absolute Bumfuckery" fill
   ============================================================ */
(function () {

  const style = document.createElement('style');
  style.textContent = `
    #lt-loader {
      position: fixed;
      inset: 0;
      background: #121212;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      overflow: hidden;
      font-family: 'JSL Blackletter', serif;
    }

    /* scanlines */
    #lt-loader::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(255,255,255,0.03) 3px,
        rgba(255,255,255,0.03) 4px
      );
      pointer-events: none;
      z-index: 1;
    }

    #lt-loader > * { position: relative; z-index: 2; }

    /* sub line — matches .hero-sub */
    #lt-sub {
      font-family: 'Alegreya', serif;
      font-style: italic;
      font-size: 2rem;
      color: #444;
      margin-bottom: 0.2rem;
      text-align: center;
    }

    /* title — same as hero, centered, wraps naturally */
    #lt-title {
      font-size: clamp(3rem, 11vw, 9.5rem);
      font-weight: normal;
      line-height: 0.95;
      letter-spacing: 0;
      text-align: center;
      width: 100%;
      padding: 0 4vw;
      box-sizing: border-box;
    }

    .lt-char {
      display: inline-block;
      position: relative;
      color: #333;
    }
    .lt-char-fill {
      position: absolute;
      left: 0; top: 0;
      color: #F5F0E8;
      clip-path: inset(0 100% 0 0);
      transition: clip-path 0.22s ease-in;
      pointer-events: none;
      white-space: pre;
    }
    .lt-char-fill.revealed {
      clip-path: inset(0 0% 0 0);
    }

    /* pixel bar container */
    #lt-bar-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.55rem;
      width: min(480px, 80vw);
    }

    #lt-bar-label {
      font-family: 'Open Sans', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #555;
    }

    /* outer track */
    #lt-bar-track {
      width: 100%;
      height: 20px;
      background: #1e1e1e;
      border: 3px solid #333;
      image-rendering: pixelated;
      position: relative;
      overflow: hidden;
    }

    /* pixel fill — made of discrete blocks via repeating-linear-gradient */
    #lt-bar-fill {
      height: 100%;
      width: 0%;
      background: repeating-linear-gradient(
        to right,
        #FFC300 0px,
        #FFC300 10px,
        #e6af00 10px,
        #e6af00 12px
      );
      transition: width 0.05s linear;
      image-rendering: pixelated;
    }

    /* shimmer pulse on the fill */
    @keyframes bar-shimmer {
      0%   { opacity: 1; }
      50%  { opacity: 0.85; }
      100% { opacity: 1; }
    }
    #lt-bar-fill { animation: bar-shimmer 0.6s ease-in-out infinite; }

    /* exit: slide up */
    @keyframes loader-exit {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-100%); }
    }
    #lt-loader.is-exiting {
      animation: loader-exit 0.7s cubic-bezier(0.7, 0, 1, 1) forwards;
    }

    /* pixel corner brackets */
    #lt-corners { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
    .lt-corner {
      position: absolute;
      width: 32px;
      height: 32px;
      border: 3px solid #333;
    }
    .lt-corner--tl { top: 20px;  left: 20px;  border-right: none; border-bottom: none; }
    .lt-corner--tr { top: 20px;  right: 20px; border-left:  none; border-bottom: none; }
    .lt-corner--bl { bottom: 20px; left: 20px;  border-right: none; border-top: none; }
    .lt-corner--br { bottom: 20px; right: 20px; border-left:  none; border-top: none; }
  `;
  document.head.appendChild(style);

  /* ---- build DOM ---- */
  const loader = document.createElement('div');
  loader.id = 'lt-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = `
    <div id="lt-corners">
      <div class="lt-corner lt-corner--tl"></div>
      <div class="lt-corner lt-corner--tr"></div>
      <div class="lt-corner lt-corner--bl"></div>
      <div class="lt-corner lt-corner--br"></div>
    </div>
    <div id="lt-sub">A collective dedicated to</div>
    <div id="lt-title"></div>
    <div id="lt-bar-wrap">
      <div id="lt-bar-label">Loading…</div>
      <div id="lt-bar-track">
        <div id="lt-bar-fill"></div>
      </div>
    </div>
  `;
  document.body.insertBefore(loader, document.body.firstChild);
  document.body.style.overflow = 'hidden';

  /* ---- build letter spans ---- */
  const title = document.getElementById('lt-title');
  const TEXT  = 'Absolute Bumfuckery';
  TEXT.split('').forEach(ch => {
    const wrap = document.createElement('span');
    wrap.className = 'lt-char';
    wrap.textContent = ch;
    const fill = document.createElement('span');
    fill.className = 'lt-char-fill';
    fill.textContent = ch;
    wrap.appendChild(fill);
    title.appendChild(wrap);
  });

  const charFills = title.querySelectorAll('.lt-char-fill');
  const barFill   = document.getElementById('lt-bar-fill');
  const barLabel  = document.getElementById('lt-bar-label');

  /* ---- progress bar animation ---- */
  const BAR_DURATION = 2600; // ms to fill 0→100%
  const BAR_START    = 200;
  let barStartTs;

  // eased progress: fast start, slight pause mid, burst at end
  function easeBar(t) {
    // cubic ease-in-out with a slight slow in the middle
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateBar(ts) {
    if (!barStartTs) barStartTs = ts;
    const t        = Math.min((ts - barStartTs) / BAR_DURATION, 1);
    const pct      = easeBar(t) * 100;
    barFill.style.width = pct.toFixed(1) + '%';
    if (t < 1) {
      requestAnimationFrame(animateBar);
    } else {
      barLabel.textContent = 'Ready.';
    }
  }
  setTimeout(() => requestAnimationFrame(animateBar), BAR_START);

  /* ---- letter fill: starts after bar is ~20% in, staggers across ---- */
  const LETTER_START   = BAR_START + 500;       // ms after page load
  const LETTER_STAGGER = 80;                    // ms per character
  charFills.forEach((fill, i) => {
    setTimeout(() => fill.classList.add('revealed'),
      LETTER_START + i * LETTER_STAGGER);
  });

  /* ---- exit: slide up once bar + letters done ---- */
  const EXIT_TIME = Math.max(
    BAR_START + BAR_DURATION,
    LETTER_START + TEXT.length * LETTER_STAGGER
  ) + 350;

  setTimeout(() => {
    loader.classList.add('is-exiting');
    document.body.style.overflow = '';
    setTimeout(() => loader.remove(), 700);
  }, EXIT_TIME);

})();
