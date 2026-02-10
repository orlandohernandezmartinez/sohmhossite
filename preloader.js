
(() => {
  const PRELOADER_RUN_MS = 2000;
  const PRELOADER_FREEZE_MS = 100;
  const PRELOADER_FADE_MS = 650;

  const preloader = document.getElementById("preloader");
  const body = document.body;

  // ====== MATRIX ======
  const word = "sohmhos";
  const cols = word.length;
  const matrix = document.getElementById("matrix");

  let rows = 0;
  let cellsByCol = [];
  let activeRowByCol = [];
  let tickTimer = null;
  let running = true;

  const randInt = (n) => Math.floor(Math.random() * n);

  function computeLayout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    rows = Math.max(6, Math.floor(vh / (vw < 480 ? 70 : 90)));

    const gap = Math.max(8, Math.floor(Math.min(vw, vh) * 0.02));
    const cellW = Math.floor((vw - gap * (cols - 1)) / cols);
    const cellH = Math.floor((vh - gap * (rows - 1)) / rows);
    const cell = Math.max(18, Math.min(cellW, cellH));

    const usedW = cell * cols;
    const freeW = vw - usedW;
    const gapX = cols > 1 ? Math.floor(freeW / (cols - 1)) : 0;

    const usedH = cell * rows;
    const freeH = vh - usedH;
    const gapY = rows > 1 ? Math.floor(freeH / (rows - 1)) : 0;

    matrix.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;
    matrix.style.gridTemplateRows = `repeat(${rows}, ${cell}px)`;
    matrix.style.columnGap = `${gapX}px`;
    matrix.style.rowGap = `${gapY}px`;
    matrix.style.fontSize = `${Math.floor(cell * 0.82)}px`;
  }

  function buildGrid() {
    matrix.innerHTML = "";
    cellsByCol = Array.from({ length: cols }, () => []);
    activeRowByCol = Array(cols).fill(0);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement("div");
        el.className = "cell";
        el.textContent = word[c];
        matrix.appendChild(el);
        cellsByCol[c].push(el);
      }
    }

    for (let c = 0; c < cols; c++) {
      const startRow = randInt(rows);
      activeRowByCol[c] = startRow;
      cellsByCol[c][startRow].classList.add("on");
    }
  }

  const minDelay = 55;
  const maxDelay = 140;

  function tick() {
    if (!running) return;

    const k = (window.innerWidth < 480) ? 2 : 1;

    for (let i = 0; i < k; i++) {
      const col = randInt(cols);

      const prev = activeRowByCol[col];
      let next = randInt(rows);
      if (rows > 1) while (next === prev) next = randInt(rows);

      cellsByCol[col][prev].classList.remove("on");
      cellsByCol[col][next].classList.add("on");
      activeRowByCol[col] = next;
    }

    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    tickTimer = setTimeout(tick, delay);
  }

  function rebuild() {
    computeLayout();
    buildGrid();
  }

  window.addEventListener("resize", () => {
    if (!running) return;
    clearTimeout(tickTimer);
    setTimeout(rebuild, 120);
  });

  function stopMatrix() {
    running = false;
    if (tickTimer) clearTimeout(tickTimer);
  }

  function showPreloader() {
    body.classList.add("is-loading");
    preloader.classList.remove("fade-out");
    // reset matrix state
    running = true;
    rebuild();
    tick();
  }

  // ====== MODE A: On page load (fade to content) ======
  function runOnLoad() {
    // always start at top
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);

    showPreloader();

    setTimeout(() => {
      stopMatrix(); // freeze
      setTimeout(() => {
        preloader.classList.add("fade-out"); // fade out overlay
        setTimeout(() => {
          body.classList.remove("is-loading");
          window.scrollTo(0, 0);
        }, PRELOADER_FADE_MS);
      }, PRELOADER_FREEZE_MS);
    }, PRELOADER_RUN_MS);
  }

  // ====== MODE B: On navigation click (play then redirect) ======
  function runThenNavigate(href) {
    showPreloader();
    setTimeout(() => {
      stopMatrix(); // freeze
      setTimeout(() => {
        window.location.href = href; // navigate while overlay is still up
      }, PRELOADER_FREEZE_MS);
    }, PRELOADER_RUN_MS);
  }

  // attach to links marked data-preload
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-preload]");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    e.preventDefault();
    runThenNavigate(href);
  });

  // init on load
  window.addEventListener("load", runOnLoad, { once: true });
})();
