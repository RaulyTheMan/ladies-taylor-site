// ---------- Contact form → Google Sheets ----------
(function () {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbJJXT2zEk0LUzOphL3A0hlyH2Ktz48CLDn3sV7p9xNib56fWbfQb831-TxGGDZ-H0Qg/exec';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form)),
      });
      form.reset();
      btn.textContent = 'Sent!';
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3000);
    } catch {
      btn.textContent = 'Error — try again';
      btn.disabled = false;
    }
  });
})();

// ---------- Press cursor ----------
document.addEventListener('mousedown', () => document.body.classList.add('is-pressing'));
document.addEventListener('mouseup',   () => document.body.classList.remove('is-pressing'));

// ---------- Nav: transparent + dynamic text colour ----------
(function () {
  const nav = document.querySelector('.nav');
  // Sections that are LIGHT backgrounds (nav links go dark)
  const lightSections = ['hero', 'statement', 'truth', 'contact', 'founder'];

  function updateNav() {
    const navBottom = nav.getBoundingClientRect().bottom;
    let isLight = true; // default (page starts on hero = yellow)
    document.querySelectorAll('body > *').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= navBottom && rect.bottom >= navBottom) {
        const id = el.id || '';
        const cls = el.className || '';
        const dark = ['services', 'dark-pov', 'showcase', 'cta-banner', 'footer', 'orgchart', 'b-attention', 'b-cta'].some(
          k => id.includes(k) || cls.includes(k)
        );
        isLight = !dark;
      }
    });
    nav.classList.toggle('nav--light', isLight);
    nav.classList.toggle('nav--dark', !isLight);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// ---------- Mobile hamburger ----------
(function () {
  const btn   = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // close when a link is tapped
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();

// ---------- Smooth anchor scroll ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ---------- Hero parallax ----------
const chars = document.querySelectorAll('.hero-characters img');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 12;
  chars.forEach((img, i) => {
    const depth = (i % 2 === 0 ? 1 : -1) * (1 + i * 0.15);
    img.style.transform = `translateX(${x * depth}px)`;
  });
});


// ---------- Tarot Services ----------
(function () {
  const SERVICES = [
    {
      key: 'branding',
      title: 'The Branding',
      img: 'assets/images/tarot-branding.png',
      body: 'We build brands that actually mean something. From naming and identity to tone of voice and brand systems — we craft the full picture so your brand isn\'t just seen, it\'s felt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis in dui vitae dapibus. Donec semper in nulla et maximus.'
    },
    {
      key: 'social',
      title: 'Social Media Management',
      img: 'assets/images/tarot-social.png',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis in dui vitae dapibus. Donec semper in nulla et maximus. In facilisis tincidunt libero vitae pellentesque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed quis mauris consequat, rutrum justo quis, accumsan ipsum. Vestibulum id ultrices neque.'
    },
    {
      key: 'performance',
      title: 'Performance Marketing',
      img: 'assets/images/tarot-performance.png',
      body: 'We run paid media that actually converts. Meta, Google, programmatic — we find where your audience lives and make sure you show up there. Data-driven creative, obsessive optimisation, zero fluff. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis in dui vitae dapibus.'
    },
    {
      key: 'packaging',
      title: 'Packaging Design',
      img: 'assets/images/tarot-packaging.png',
      body: 'Your packaging is your silent salesperson. We design packaging that stops people mid-scroll and mid-shelf — beautiful, on-brand, and built to convert. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis in dui vitae dapibus. Donec semper in nulla et maximus.'
    },
    {
      key: 'video',
      title: 'The Video Production',
      img: 'assets/images/tarot-video.png',
      body: 'From concept to final cut, we produce video content that doesn\'t suck. Reels, brand films, product videos — all handled in-house so there\'s no briefing gap. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis in dui vitae dapibus. Donec semper in nulla et maximus.'
    }
  ];

  const carousel = document.getElementById('servicesCarousel');
  const detail   = document.getElementById('servicesDetail');
  const detailImg    = document.getElementById('detailCardImg');
  const detailTitle  = document.getElementById('detailTitle');
  const detailBody   = document.getElementById('detailBody');
  const detailThumbs = document.getElementById('detailThumbs');
  const detailDots   = document.getElementById('detailDots');
  const fan   = carousel.querySelector('.tarot-fan');
  const cards = Array.from(fan.querySelectorAll('.tarot-card'));

  // Initial scattered positions — offset from center of .tarot-fan
  // indices 0-4: front service cards, 5-6: decorative back cards
  const SCATTER = [
    { tx: -300, ty:  20, rotate:  -9, scale: 0.87, zi: 3 },
    { tx: -140, ty: -25, rotate: -18, scale: 0.93, zi: 5 },
    { tx:    5, ty:   0, rotate:   4, scale: 1.00, zi: 7 },
    { tx:  155, ty:  20, rotate:  16, scale: 0.91, zi: 6 },
    { tx:  315, ty:   5, rotate:  -8, scale: 0.87, zi: 4 },
    { tx: -210, ty:  65, rotate:  14, scale: 0.89, zi: 2 },
    { tx:   80, ty:  55, rotate: -13, scale: 0.84, zi: 1 },
  ];

  const positions = SCATTER.map(s => ({ ...s }));

  function frontIndex() {
    return positions.reduce((best, p, i) => p.zi > positions[best].zi ? i : best, 0);
  }

  function render(draggingIdx) {
    cards.forEach((card, i) => {
      const p = positions[i];
      card.style.zIndex = p.zi;
      card.style.transform = `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) rotate(${p.rotate}deg) scale(${p.scale})`;
    });
    const fi = frontIndex();
    carousel.querySelectorAll('.tarot-dot').forEach((d, i) => {
      d.classList.toggle('tarot-dot--active', i === fi);
    });
  }

  // --- Drag ---
  let drag = null;

  function pointerDown(e, idx) {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const wasFront = positions[idx].zi === Math.max(...positions.map(p => p.zi));
    const maxZi = Math.max(...positions.map(p => p.zi));
    positions[idx].zi = maxZi + 1;
    cards[idx].classList.add('is-dragging');
    drag = {
      idx,
      startX: pt.clientX,
      startY: pt.clientY,
      origTx: positions[idx].tx,
      origTy: positions[idx].ty,
      wasFront,
      moved: false,
    };
    render();
  }

  function pointerMove(e) {
    if (!drag) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - drag.startX;
    const dy = pt.clientY - drag.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
    positions[drag.idx].tx = drag.origTx + dx;
    positions[drag.idx].ty = drag.origTy + dy;
    render(drag.idx);
  }

  function pointerUp() {
    if (!drag) return;
    const { idx, moved, wasFront } = drag;
    drag = null;
    cards[idx].classList.remove('is-dragging');
    if (!moved && wasFront && !cards[idx].classList.contains('tarot-card--back')) showDetail(idx);
    render();
  }

  cards.forEach((card, i) => {
    card.addEventListener('mousedown', e => pointerDown(e, i));
    card.addEventListener('touchstart', e => pointerDown(e, i), { passive: false });
  });
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('touchmove', e => { if (drag) { e.preventDefault(); pointerMove(e); } }, { passive: false });
  window.addEventListener('mouseup', pointerUp);
  window.addEventListener('touchend', pointerUp);

  // --- Dots ---
  carousel.querySelectorAll('.tarot-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const maxZi = Math.max(...positions.map(p => p.zi));
      positions[i].zi = maxZi + 1;
      render();
    });
  });

  // --- Detail view ---
  function showDetail(cardIndex) {
    const svc = SERVICES[cardIndex];
    detailImg.src           = svc.img;
    detailImg.alt           = svc.title;
    detailTitle.textContent = svc.title;
    detailBody.textContent  = svc.body;

    detailThumbs.innerHTML = '';
    SERVICES.forEach((s, i) => {
      if (i === cardIndex) return;
      const thumb = document.createElement('div');
      thumb.className = 'detail-thumb';
      thumb.innerHTML = `<img src="${s.img}" alt="${s.title}" />`;
      thumb.addEventListener('click', () => showDetail(i));
      detailThumbs.appendChild(thumb);
    });

    detailDots.innerHTML = '';
    SERVICES.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'tarot-dot' + (i === cardIndex ? ' tarot-dot--active' : '');
      dot.addEventListener('click', () => showDetail(i));
      detailDots.appendChild(dot);
    });

    carousel.style.display = 'none';
    detail.style.display   = 'block';
    document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  render();
})();
