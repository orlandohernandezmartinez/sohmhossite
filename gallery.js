(() => {
  const imgs = Array.from(document.querySelectorAll(".float-img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");

  if (!imgs.length) return;

  // Ajusta velocidad base (px/seg) aquí
  const BASE_SPEED = 42; // lento
  const PADDING = 10;    // margen contra bordes
  const NAV_SAFE_TOP = 56; // evita chocar con navbar

  let W = window.innerWidth;
  let H = window.innerHeight;

  // Estado por imagen
  const bodies = imgs.map((el, i) => ({
    el,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    vx: (Math.random() < 0.5 ? -1 : 1) * (BASE_SPEED * (0.85 + Math.random() * 0.5)),
    vy: (Math.random() < 0.5 ? -1 : 1) * (BASE_SPEED * (0.85 + Math.random() * 0.5)),
  }));

  let raf = null;
  let lastT = performance.now();
  let paused = false;

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const measure = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    bodies.forEach(b => {
      const r = b.el.getBoundingClientRect();
      b.w = r.width;
      b.h = r.height;
    });
  };

  const overlap = (a, b) => {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  };

  const separate = (a, b) => {
    // Empuja mínimamente para “despegar” cajas
    const ax2 = a.x + a.w, ay2 = a.y + a.h;
    const bx2 = b.x + b.w, by2 = b.y + b.h;

    const dx1 = bx2 - a.x;   // empuje izq
    const dx2 = ax2 - b.x;   // empuje der
    const dy1 = by2 - a.y;   // empuje arriba
    const dy2 = ay2 - b.y;   // empuje abajo

    const minX = Math.min(dx1, dx2);
    const minY = Math.min(dy1, dy2);

    if (minX < minY) {
      // separar en X
      if (dx1 < dx2) { a.x += minX; } else { a.x -= minX; }
      a.vx *= -1;
      b.vx *= -1;
    } else {
      // separar en Y
      if (dy1 < dy2) { a.y += minY; } else { a.y -= minY; }
      a.vy *= -1;
      b.vy *= -1;
    }
  };

  const placeInitial = () => {
    // Coloca sin overlaps iniciales (intentos limitados)
    measure();

    bodies.forEach((b, idx) => {
      let tries = 0;
      do {
        b.x = PADDING + Math.random() * (W - b.w - PADDING * 2);
        b.y = NAV_SAFE_TOP + PADDING + Math.random() * (H - b.h - (NAV_SAFE_TOP + PADDING) - PADDING);
        tries++;
      } while (
        tries < 60 &&
        bodies.slice(0, idx).some(other => overlap(b, other))
      );
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });
  };

  const tick = (t) => {
    if (paused) return;

    const dt = Math.min(0.032, (t - lastT) / 1000); // cap ~32ms
    lastT = t;

    // Move + wall bounce
    bodies.forEach(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const minX = PADDING;
      const maxX = W - b.w - PADDING;
      const minY = NAV_SAFE_TOP + PADDING;
      const maxY = H - b.h - PADDING;

      if (b.x <= minX) { b.x = minX; b.vx *= -1; }
      if (b.x >= maxX) { b.x = maxX; b.vx *= -1; }
      if (b.y <= minY) { b.y = minY; b.vy *= -1; }
      if (b.y >= maxY) { b.y = maxY; b.vy *= -1; }
    });

    // Pair collisions
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        if (overlap(a, b)) separate(a, b);
      }
    }

    // Render
    bodies.forEach(b => {
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });

    raf = requestAnimationFrame(tick);
  };

  const openLightbox = (src, alt) => {
    paused = true;
    if (raf) cancelAnimationFrame(raf);

    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";

    // resume
    paused = false;
    lastT = performance.now();
    raf = requestAnimationFrame(tick);
  };

  // Click handlers
  imgs.forEach(img => {
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  window.addEventListener("resize", () => {
    measure();
    // asegura que nada quede fuera tras resize
    bodies.forEach(b => {
      b.x = clamp(b.x, PADDING, W - b.w - PADDING);
      b.y = clamp(b.y, NAV_SAFE_TOP + PADDING, H - b.h - PADDING);
    });
  });

  // Espera a que carguen tamaños reales (importante para colisiones)
  const waitImages = () => Promise.all(
    imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => img.addEventListener("load", res, { once:true })))
  );

  waitImages().then(() => {
    placeInitial();
    lastT = performance.now();
    raf = requestAnimationFrame(tick);
  });
})();