(() => {
  const canvas = document.getElementById("treviFrameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const START_FRAME = 2000;
  const END_FRAME = 2336;
  const FRAME_STEP = 2;
  const FRAME_NUMBERS = Array.from({ length: Math.floor((END_FRAME - START_FRAME) / FRAME_STEP) + 1 }, (_, i) => START_FRAME + (i * FRAME_STEP));
  const FRAME_COUNT = FRAME_NUMBERS.length;
  const MAX_CACHE = 24;
  const PRELOAD_AHEAD = 5;
  const PRELOAD_BEHIND = 2;
  const DPR_CAP = 1.35;

  const state = { width: 0, height: 0, maxScroll: 1, currentIndex: -1, requestedIndex: 0, ticking: false, lastDrawKey: "" };
  const frameCache = new Map();
  const loadingFrames = new Map();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = [...document.querySelectorAll('.section-focus, .site-footer')];

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const frameNumber = (index) => FRAME_NUMBERS[clamp(index, 0, FRAME_COUNT - 1)];
  const frameUrls = (index) => {
    const number = frameNumber(index);
    return [
      `assets/frames-optimized/frame-${number}.webp`,
      `frames%20fontana/Sequ%C3%AAncia%2001_${number}.jpg`,
      `frames%20fontana/Sequ%23U00eancia%2001_${number}.jpg`,
      `frames%20fontana/Sequencia%2001_${number}.jpg`
    ];
  };

  function pruneCache(centerIndex) {
    if (frameCache.size <= MAX_CACHE) return;
    const entries = [...frameCache.keys()].sort((a, b) => Math.abs(b - centerIndex) - Math.abs(a - centerIndex));
    while (frameCache.size > MAX_CACHE && entries.length) {
      const key = entries.shift();
      if (Math.abs(key - centerIndex) > PRELOAD_AHEAD) frameCache.delete(key);
    }
  }

  function loadImageFromCandidates(urls) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = () => {
        if (i >= urls.length) return reject(new Error(`Nenhum arquivo de frame encontrado: ${urls.join(' | ')}`));
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => { i += 1; tryNext(); };
        img.src = urls[i];
      };
      tryNext();
    });
  }

  function getFrame(index) {
    const safe = clamp(index, 0, FRAME_COUNT - 1);
    if (frameCache.has(safe)) return Promise.resolve(frameCache.get(safe));
    if (loadingFrames.has(safe)) return loadingFrames.get(safe);
    const promise = loadImageFromCandidates(frameUrls(safe)).then((img) => {
      frameCache.set(safe, img);
      loadingFrames.delete(safe);
      pruneCache(safe);
      return img;
    }).catch((err) => {
      loadingFrames.delete(safe);
      throw err;
    });
    loadingFrames.set(safe, promise);
    return promise;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      state.width = width;
      state.height = height;
      state.lastDrawKey = '';
    }
  }

  function updateScrollBounds() {
    const doc = document.documentElement;
    state.maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
  }

  function getScrollIndex() {
    if (prefersReducedMotion) return 0;
    const progress = clamp((window.scrollY || document.documentElement.scrollTop || 0) / state.maxScroll, 0, 1);
    return Math.round(progress * (FRAME_COUNT - 1));
  }

  function drawCover(image, index) {
    if (!image || !state.width || !state.height) return;
    const key = `${index}:${state.width}x${state.height}`;
    if (state.lastDrawKey === key) return;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const canvasRatio = state.width / state.height;
    const imageRatio = imageWidth / imageHeight;
    let drawWidth = state.width, drawHeight = state.height, dx = 0, dy = 0;
    if (imageRatio > canvasRatio) {
      drawHeight = state.height;
      drawWidth = drawHeight * imageRatio;
      dx = (state.width - drawWidth) / 2;
    } else {
      drawWidth = state.width;
      drawHeight = drawWidth / imageRatio;
      dy = (state.height - drawHeight) / 2;
    }
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
    state.lastDrawKey = key;
  }

  function preloadAround(index) {
    for (let i = Math.max(0, index - PRELOAD_BEHIND); i <= Math.min(FRAME_COUNT - 1, index + PRELOAD_AHEAD); i += 1) {
      if (!frameCache.has(i) && !loadingFrames.has(i)) getFrame(i).catch(() => {});
    }
  }

  function updateSectionReveal() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = vh / 2;
    sections.forEach((section) => {
      const items = [...section.querySelectorAll('.reveal-item')];
      if (!items.length) return;
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);
      const sectionProgress = clamp(1 - (distance / (vh * 0.72)), 0, 1);
      section.style.setProperty('--focus-progress', sectionProgress.toFixed(3));
      items.forEach((item, index) => {
        const start = index * 0.085;
        const end = Math.min(start + 0.34, 0.96);
        const local = clamp((sectionProgress - start) / Math.max(end - start, 0.01), 0, 1);
        item.style.opacity = local.toFixed(3);
        item.style.transform = `translateY(${(1 - local) * 24}px)`;
        item.style.filter = `blur(${(1 - local) * 3}px)`;
      });
    });
  }

  function render() {
    state.ticking = false;
    resizeCanvas();
    updateScrollBounds();
    updateSectionReveal();
    const index = getScrollIndex();
    state.requestedIndex = index;
    preloadAround(index);
    if (frameCache.has(index)) {
      drawCover(frameCache.get(index), index);
      state.currentIndex = index;
    } else if (state.currentIndex >= 0 && frameCache.has(state.currentIndex)) {
      drawCover(frameCache.get(state.currentIndex), state.currentIndex);
    }
    getFrame(index).then((img) => {
      if (state.requestedIndex === index) {
        drawCover(img, index);
        state.currentIndex = index;
      }
    }).catch(() => {});
  }

  function requestRender() {
    if (state.ticking) return;
    state.ticking = true;
    window.requestAnimationFrame(render);
  }

  let resizeTimer = null;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { state.lastDrawKey = ''; requestRender(); }, 80);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize, { passive: true });
  window.addEventListener('load', requestRender);

  resizeCanvas();
  updateScrollBounds();
  updateSectionReveal();
  getFrame(0).then((img) => { drawCover(img, 0); state.currentIndex = 0; requestRender(); }).catch(() => requestRender());
})();
