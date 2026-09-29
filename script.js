const header = document.querySelector('.site-header');
const progress = document.getElementById('progress');
const menu = document.getElementById('menuToggle');
const nav = document.getElementById('navLinks');

const updateScrollUI = () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
};
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

// Movimiento sutil del visual del hero. Respeta usuarios con reducción de movimiento.
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  heroVisual.addEventListener('pointermove', e => {
    const r = heroVisual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    heroVisual.style.setProperty('--mx', `${x * 8}px`);
    heroVisual.style.setProperty('--my', `${y * 8}px`);
  });
  heroVisual.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--mx', '0px');
    heroVisual.style.setProperty('--my', '0px');
  });
}

// Cotización → WhatsApp. Se construye con URLSearchParams para evitar mensajes rotos por tildes, saltos o caracteres especiales.
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const message = [
    'Hola MT Tecnología & Soluciones 👋',
    '',
    'Quiero solicitar información / una cotización.',
    '',
    `Nombre: ${data.nombre || 'No indicado'}`,
    `Empresa o negocio: ${data.empresa || 'No aplica'}`,
    `Servicio de interés: ${data.servicio || 'No indicado'}`,
    '',
    'Lo que necesito:',
    data.mensaje || 'No indicado'
  ].join('\n');

  const url = `https://wa.me/573228639881?${new URLSearchParams({ text: message }).toString()}`;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) window.location.href = url;
  if (note) note.textContent = 'WhatsApp está listo con tu solicitud organizada. Solo revísala y presiona Enviar.';
});

/* ================= MEJORAS v3 ================= */

// Red de partículas en el hero (canvas), respeta reduce-motion
(() => {
  const canvas = document.getElementById('netCanvas');
  if (!canvas) return;
  // En móviles el canvas animado se desactiva para priorizar fluidez y batería.
  if (window.matchMedia('(max-width: 700px)').matches) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, particles = [];
  const isSmallScreen = window.matchMedia('(max-width: 700px)').matches;
  const COUNT = isSmallScreen ? 18 : 42;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.35 : 1.75);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function init() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      ctx.fillStyle = 'rgba(143,215,255,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.5, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(143,215,255,${(1 - dist / 130) * .2})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  window.addEventListener('resize', () => { resize(); init(); });
  resize(); init(); frame();
})();

// Puntos interactivos: "anatomía de una web que vende"
(() => {
  const wrap = document.querySelector('.anatomy-wrap');
  const tip = document.getElementById('hotspotTip');
  if (!wrap || !tip) return;
  const hotspots = Array.from(wrap.querySelectorAll('.hotspot'));
  let activeBtn = null;

  function closeTip() {
    tip.classList.remove('visible');
    activeBtn?.classList.remove('active');
    activeBtn = null;
  }

  function openTip(btn) {
    hotspots.forEach(h => h.classList.remove('active'));
    btn.classList.add('active');
    activeBtn = btn;
    tip.textContent = btn.dataset.tip;

    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    let left = btnRect.left - wrapRect.left + btnRect.width / 2 - 20;
    let top = btnRect.top - wrapRect.top + btnRect.height + 14;
    tip.style.left = `${Math.max(8, Math.min(left, wrapRect.width - 268))}px`;
    tip.style.top = `${top}px`;
    tip.classList.add('visible');
  }

  hotspots.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (activeBtn === btn) { closeTip(); return; }
      openTip(btn);
    });
  });
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) closeTip();
  });
  window.addEventListener('resize', () => { if (activeBtn) openTip(activeBtn); });
})();

// Botones magnéticos (brillo que sigue el cursor)
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--gx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  });
})();


// V4: luz ambiental y microinteracciones sobre tarjetas.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  window.addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('.service-card, .category, .concept, .step, .faq-item').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${e.clientX - r.left}px`);
      card.style.setProperty('--card-y', `${e.clientY - r.top}px`);
    });
  });
})();
