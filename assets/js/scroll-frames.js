(() => {
  const canvas = document.getElementById("treviFrameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const START_FRAME = 2000;
  const END_FRAME = 2336;
  const FRAME_COUNT = END_FRAME - START_FRAME + 1;
  const MAX_CACHE = 44;
  const PRELOAD_AHEAD = 10;
  const PRELOAD_BEHIND = 4;

  const state = {
    dpr: 1,
    width: 0,
    height: 0,
    maxScroll: 1,
    currentIndex: -1,
    requestedIndex: 0,
    ticking: false,
    resizing: false,
    lastDrawKey: "",
    lastLoadedIndex: -1,
  };

  const frameCache = new Map();
  const loadingFrames = new Map();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function frameNumber(index) {
    return START_FRAME + clamp(index, 0, FRAME_COUNT - 1);
  }

  function frameUrls(index) {
    const number = frameNumber(index);
    return [
      `frames%20fontana/Sequ%C3%AAncia%2001_${number}.jpg`,
      `frames%20fontana/Sequ%23U00eancia%2001_${number}.jpg`,
      `frames%20fontana/Sequencia%2001_${number}.jpg`,
      `assets/frames/frame-${String(index).padStart(4, "0")}.jpg`,
    ];
  }

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
      let cursor = 0;

      function tryNext() {
        if (cursor >= urls.length) {
          reject(new Error(`Nenhum arquivo de frame encontrado: ${urls.join(" | ")}`));
          return;
        }

        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => {
          cursor += 1;
          tryNext();
        };
        image.src = urls[cursor];
      }

      tryNext();
    });
  }

  function getFrame(index) {
    const safeIndex = clamp(index, 0, FRAME_COUNT - 1);
    if (frameCache.has(safeIndex)) return Promise.resolve(frameCache.get(safeIndex));
    if (loadingFrames.has(safeIndex)) return loadingFrames.get(safeIndex);

    const promise = loadImageFromCandidates(frameUrls(safeIndex))
      .then((image) => {
        frameCache.set(safeIndex, image);
        loadingFrames.delete(safeIndex);
        state.lastLoadedIndex = safeIndex;
        pruneCache(safeIndex);
        return image;
      })
      .catch((error) => {
        loadingFrames.delete(safeIndex);
        console.warn(error.message);
        throw error;
      });

    loadingFrames.set(safeIndex, promise);
    return promise;
  }

  function getNearestLoaded(index) {
    if (frameCache.has(index)) return frameCache.get(index);
    let nearest = null;
    let distance = Infinity;

    frameCache.forEach((image, key) => {
      const currentDistance = Math.abs(key - index);
      if (currentDistance < distance) {
        nearest = image;
        distance = currentDistance;
      }
    });

    return nearest;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      state.width = width;
      state.height = height;
      state.dpr = dpr;
      state.lastDrawKey = "";
    }
  }

  function updateScrollBounds() {
    const doc = document.documentElement;
    state.maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
  }

  function getScrollIndex() {
    if (prefersReducedMotion) return 0;
    const progress = clamp((window.scrollY || docScrollTop()) / state.maxScroll, 0, 1);
    return Math.round(progress * (FRAME_COUNT - 1));
  }

  function docScrollTop() {
    return document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function drawCover(image, index) {
    if (!image || !state.width || !state.height) return;

    const key = `${index}:${state.width}x${state.height}`;
    if (state.lastDrawKey === key) return;

    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const canvasRatio = state.width / state.height;
    const imageRatio = imageWidth / imageHeight;

    let drawWidth = state.width;
    let drawHeight = state.height;
    let dx = 0;
    let dy = 0;

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
    const start = clamp(index - PRELOAD_BEHIND, 0, FRAME_COUNT - 1);
    const end = clamp(index + PRELOAD_AHEAD, 0, FRAME_COUNT - 1);

    for (let i = start; i <= end; i += 1) {
      if (!frameCache.has(i) && !loadingFrames.has(i)) getFrame(i).catch(() => {});
    }
  }

  function render() {
    state.ticking = false;
    resizeCanvas();
    updateScrollBounds();

    const index = getScrollIndex();
    state.requestedIndex = index;
    preloadAround(index);

    const loadedImage = getNearestLoaded(index);
    if (loadedImage) drawCover(loadedImage, index);

    getFrame(index)
      .then((image) => {
        if (state.requestedIndex === index) drawCover(image, index);
      })
      .catch(() => {});
  }

  function requestRender() {
    if (state.ticking) return;
    state.ticking = true;
    window.requestAnimationFrame(render);
  }

  function setupReveal() {
    const sections = [...document.querySelectorAll(".section-focus")];

    sections.forEach((section) => {
      section.querySelectorAll(".reveal-item").forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 95, 560)}ms`);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-focused", entry.isIntersecting);
      });
    }, {
      threshold: 0.38,
      rootMargin: "-12% 0px -18% 0px",
    });

    sections.forEach((section) => observer.observe(section));
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", () => {
    state.lastDrawKey = "";
    requestRender();
  }, { passive: true });
  window.addEventListener("orientationchange", () => {
    state.lastDrawKey = "";
    setTimeout(requestRender, 160);
  }, { passive: true });

  setupReveal();
  updateScrollBounds();
  resizeCanvas();
  getFrame(0).then((image) => drawCover(image, 0)).catch(() => {});
  requestRender();
})();
