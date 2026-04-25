(() => {
  const doc = document;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------
  // Market ticker — static demo values, intentionally not live quotes.
  // --------------------------------------------------
  const ticker = doc.querySelector('[data-ticker]');
  if (ticker) {
    const data = [
      ['DAX', '18.472,90', '+0.42%', 'up'],
      ['XAUUSD', '2.381,40', '+0.18%', 'up'],
      ['NAS100', '19.840,25', '-0.23%', 'down'],
      ['EURUSD', '1.0724', '-0.06%', 'down'],
      ['SPX', '5.487,12', '+0.31%', 'up'],
      ['BTCUSD', '67.450', '+1.84%', 'up'],
      ['USDJPY', '154,82', '+0.11%', 'up'],
      ['GBPUSD', '1.2632', '-0.14%', 'down']
    ];
    const html = data.map(([sym, val, chg, dir]) =>
      `<span class="tick"><span>${sym}</span><strong>${val}</strong><span class="${dir}">${chg}</span><i></i></span>`
    ).join('');
    ticker.innerHTML = html + html;
  }

  // --------------------------------------------------
  // Header state
  // --------------------------------------------------
  const header = doc.querySelector('[data-header]');
  const setHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 32);
  };
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  // --------------------------------------------------
  // Smooth funnel scroll
  // --------------------------------------------------
  const applySection = doc.getElementById('bewerbung');
  doc.querySelectorAll('.js-scroll-apply').forEach((button) => {
    button.addEventListener('click', () => {
      applySection?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => {
        const first = doc.querySelector('[data-application-form] input:not([type="checkbox"])');
        first?.focus({ preventScroll: true });
      }, prefersReduced ? 0 : 700);
    });
  });

  // --------------------------------------------------
  // Reveal observer
  // --------------------------------------------------
  const revealEls = [...doc.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -70px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // --------------------------------------------------
  // Hide mobile sticky CTA while form is visible
  // --------------------------------------------------
  const mobileCta = doc.querySelector('[data-mobile-cta]');
  if (mobileCta && applySection && 'IntersectionObserver' in window) {
    let applyVisible = false;
    const syncMobileCta = () => {
      const beforeDecisionPoint = window.scrollY < window.innerHeight * 0.62;
      mobileCta.classList.toggle('is-hidden', beforeDecisionPoint || applyVisible);
    };
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        applyVisible = entry.isIntersecting;
        syncMobileCta();
      });
    }, { threshold: 0.18 });
    ctaObserver.observe(applySection);
    syncMobileCta();
    window.addEventListener('scroll', syncMobileCta, { passive: true });
  }

  // --------------------------------------------------
  // Multi-step application form
  // --------------------------------------------------
  const form = doc.querySelector('[data-application-form]');
  if (form) {
    const panel = doc.querySelector('[data-form-panel]');
    const steps = [...form.querySelectorAll('.form-step')];
    const nextBtn = form.querySelector('[data-next-step]');
    const prevBtn = form.querySelector('[data-prev-step]');
    const submitBtn = form.querySelector('[data-submit-form]');
    const label = doc.querySelector('[data-step-label]');
    const title = doc.querySelector('[data-step-title]');
    const copy = doc.querySelector('[data-step-copy]');
    const progress = doc.querySelector('[data-progress-bar]');
    const error = doc.querySelector('[data-form-error]');
    const titles = ['Kontakt', 'Situation', 'Ziel & Zustimmung'];
    const stepCopy = [
      'Damit wir dich für die Terminabstimmung erreichen.',
      'Kurze Qualifikation: Wir prüfen, ob das Mentoring zu deiner Ausgangslage passt.',
      'Sag uns, was sich konkret ändern soll. Danach senden wir deine Anfrage ab.'
    ];
    let current = 0;

    const activeFields = () => [...steps[current].querySelectorAll('input, select, textarea')];
    const clearInvalid = (field) => {
      field.classList.remove('is-invalid');
      field.closest('label')?.classList.remove('is-invalid');
    };

    [...form.querySelectorAll('input, select, textarea')].forEach((field) => {
      field.addEventListener('input', () => clearInvalid(field));
      field.addEventListener('change', () => clearInvalid(field));
    });

    const updateStep = () => {
      steps.forEach((step, index) => step.classList.toggle('is-active', index === current));
      if (label) label.textContent = `Schritt ${current + 1} von ${steps.length}`;
      if (title) title.textContent = titles[current] || 'Bewerbung';
      if (copy) copy.textContent = stepCopy[current] || '';
      if (progress) progress.style.width = `${((current + 1) / steps.length) * 100}%`;
      if (prevBtn) prevBtn.style.visibility = current === 0 ? 'hidden' : 'visible';
      if (nextBtn) nextBtn.style.display = current === steps.length - 1 ? 'none' : 'inline-flex';
      if (submitBtn) submitBtn.style.display = current === steps.length - 1 ? 'inline-flex' : 'none';
      if (error) error.textContent = '';
      window.setTimeout(() => activeFields()[0]?.focus({ preventScroll: true }), 80);
    };

    const validateCurrent = () => {
      const fields = activeFields();
      for (const field of fields) {
        clearInvalid(field);
        if (!field.checkValidity()) {
          field.classList.add('is-invalid');
          field.closest('label')?.classList.add('is-invalid');
          if (error) {
            error.textContent = field.type === 'checkbox'
              ? 'Bitte bestätige den Risikohinweis und die Kontaktaufnahme.'
              : 'Bitte fülle die markierten Pflichtfelder korrekt aus.';
          }
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    nextBtn?.addEventListener('click', () => {
      if (!validateCurrent()) return;
      current = Math.min(current + 1, steps.length - 1);
      updateStep();
    });

    prevBtn?.addEventListener('click', () => {
      current = Math.max(current - 1, 0);
      updateStep();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateCurrent()) return;
      if (submitBtn) {
        submitBtn.textContent = 'Wird gesendet …';
        submitBtn.disabled = true;
      }
      window.setTimeout(() => {
        panel?.classList.add('is-success');
        if (label) label.textContent = 'Anfrage erhalten';
        if (title) title.textContent = 'Danke — wir melden uns.';
        if (progress) progress.style.width = '100%';
      }, 850);
    });

    updateStep();
  }

  // --------------------------------------------------
  // Three.js Hero: premium liquidity field. Falls CDN blockt, Canvas fallback.
  // --------------------------------------------------
  const canvas = doc.getElementById('three-hero');
  if (canvas && !prefersReduced) {
    let heroVisualStarted = false;
    const startThree = () => {
      if (heroVisualStarted || !window.THREE) return;
      heroVisualStarted = true;
      initThreeHero(canvas);
    };
    const startFallback = () => {
      if (heroVisualStarted) return;
      heroVisualStarted = true;
      initCanvasFallback(canvas);
    };

    if (window.THREE) startThree();
    else {
      window.addEventListener('tw-three-ready', startThree, { once: true });
      window.setTimeout(startFallback, 1400);
    }
  }

  function initThreeHero(canvasEl) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = window.innerWidth < 760 ? 760 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const base = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const ring = Math.floor(i / 90);
      const angle = t * Math.PI * 16 + ring * 0.22;
      const radius = 1.4 + (i % 90) * 0.028;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.12;
      const y = Math.sin(angle * 0.72) * 1.25 + (Math.random() - 0.5) * 0.22;
      const z = Math.sin(angle) * radius * 0.28 + (Math.random() - 0.5) * 0.5;
      positions[i * 3] = base[i * 3] = x;
      positions[i * 3 + 1] = base[i * 3 + 1] = y;
      positions[i * 3 + 2] = base[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xd8b766,
      size: window.innerWidth < 760 ? 0.018 : 0.024,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geometry, material);
    group.add(particles);

    // 3D price ribbon
    const ribbonPoints = [];
    for (let i = 0; i < 220; i++) {
      const x = (i / 219) * 8 - 4;
      const y = Math.sin(i * 0.08) * 0.35 + Math.cos(i * 0.032) * 0.62 + (i / 219 - 0.5) * 1.8;
      const z = Math.sin(i * 0.05) * 0.7;
      ribbonPoints.push(new THREE.Vector3(x, y, z));
    }
    const ribbonGeometry = new THREE.BufferGeometry().setFromPoints(ribbonPoints);
    const ribbonMaterial = new THREE.LineBasicMaterial({ color: 0xf0d990, transparent: true, opacity: 0.88 });
    const ribbon = new THREE.Line(ribbonGeometry, ribbonMaterial);
    ribbon.position.set(1.2, -0.25, -1.2);
    ribbon.rotation.z = -0.12;
    group.add(ribbon);

    // Deep blue ghost ribbon for brand accent
    const ribbon2 = ribbon.clone();
    ribbon2.material = new THREE.LineBasicMaterial({ color: 0x6fa7ff, transparent: true, opacity: 0.28 });
    ribbon2.position.y -= 0.7;
    ribbon2.position.z -= 0.7;
    group.add(ribbon2);

    const mouse = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.45;
    }, { passive: true });

    function resize() {
      const w = canvasEl.clientWidth || window.innerWidth;
      const h = canvasEl.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      group.position.x = w < 760 ? 0.8 : 2.2;
      group.position.y = w < 760 ? -0.4 : -0.15;
      group.scale.setScalar(w < 760 ? 0.86 : 1.22);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let raf = 0;
    const clock = new THREE.Clock();
    function animate() {
      const time = clock.getElapsedTime();
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        positions[ix] = base[ix] + Math.sin(time * 0.52 + i * 0.017) * 0.035;
        positions[ix + 1] = base[ix + 1] + Math.cos(time * 0.46 + i * 0.013) * 0.05;
        positions[ix + 2] = base[ix + 2] + Math.sin(time * 0.35 + i * 0.019) * 0.035;
      }
      geometry.attributes.position.needsUpdate = true;
      group.rotation.y = time * 0.055 + mouse.x;
      group.rotation.x = -0.08 + mouse.y;
      ribbon.rotation.y = Math.sin(time * 0.28) * 0.12;
      ribbon2.rotation.y = ribbon.rotation.y - 0.18;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    }
    animate();

    // Pause when not visible to save mobile battery.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !raf) animate();
        if (!entry.isIntersecting && raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { threshold: 0.01 });
      observer.observe(canvasEl);
    }
  }

  function initCanvasFallback(canvasEl) {
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    let width = 0;
    let height = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = canvasEl.clientWidth || window.innerWidth;
      height = canvasEl.clientHeight || window.innerHeight;
      canvasEl.width = width * ratio;
      canvasEl.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    const dots = Array.from({ length: window.innerWidth < 760 ? 80 : 160 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.6 + 0.25
    }));
    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(216,183,102,.42)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 14) {
        const y = height * 0.46 + Math.sin(x * 0.012 + time * 0.001) * 40 + Math.cos(x * 0.004) * 80;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (const dot of dots) {
        dot.x += dot.s;
        if (dot.x > width + 20) dot.x = -20;
        const y = dot.y + Math.sin(time * 0.001 + dot.x * 0.01) * 18;
        ctx.fillStyle = 'rgba(216,183,102,.42)';
        ctx.beginPath();
        ctx.arc(dot.x, y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
  }
})();
