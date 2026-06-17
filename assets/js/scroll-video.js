document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#treviFrameCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: false });
  const FRAME_FOLDER = "frames fontana";
  const START_FRAME = 2000;
  const END_FRAME = 2336;
  const FRAME_COUNT = END_FRAME - START_FRAME + 1;
  const CACHE_LIMIT = 18;
  const PRELOAD_RADIUS = window.matchMedia("(max-width: 720px)").matches ? 1 : 2;

  let canvasWidth = 0;
  let canvasHeight = 0;
  let targetFrame = 0;
  let drawnFrame = -1;
  let ticking = false;
  let resizeTimer = 0;

  const cache = new Map();
  const requests = new Map();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function frameNumber(index) {
    return START_FRAME + index;
  }

  function encodedFrameUrl(index, variant = 0) {
    const number = frameNumber(index);
    if (variant === 0) {
      return `${FRAME_FOLDER}/Sequ%23U00eancia%2001_${number}.jpg`;
    }
    return `${FRAME_FOLDER}/Sequ%C3%AAncia%2001_${number}.jpg`;
  }

  function trimCache() {
    if (cache.size <= CACHE_LIMIT) return;

    const ordered = [...cache.keys()].sort((a, b) => Math.abs(b - targetFrame) - Math.abs(a - targetFrame));
    while (cache.size > CACHE_LIMIT && ordered.length) {
      const key = ordered.shift();
      if (key !== targetFrame && key !== drawnFrame) cache.delete(key);
    }
  }

  function loadFrame(index) {
    const safeIndex = clamp(index, 0, FRAME_COUNT - 1);
    if (cache.has(safeIndex)) return Promise.resolve(cache.get(safeIndex));
    if (requests.has(safeIndex)) return requests.get(safeIndex);

    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";

      image.onload = () => {
        cache.set(safeIndex, image);
        requests.delete(safeIndex);
        trimCache();
        resolve(image);
      };

      image.onerror = () => {
        const fallback = new Image();
        fallback.decoding = "async";
        fallback.loading = "eager";
        fallback.onload = () => {
          cache.set(safeIndex, fallback);
          requests.delete(safeIndex);
          trimCache();
          resolve(fallback);
        };
        fallback.onerror = () => {
          requests.delete(safeIndex);
          reject(new Error(`Frame não encontrado: ${frameNumber(safeIndex)}`));
        };
        fallback.src = encodedFrameUrl(safeIndex, 1);
      };

      image.src = encodedFrameUrl(safeIndex, 0);
    });

    requests.set(safeIndex, promise);
    return promise;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    drawnFrame = -1;
  }

  function getScrollProgress() {
    const html = document.documentElement;
    const maxScroll = Math.max(html.scrollHeight - window.innerHeight, 1);
    return clamp((window.scrollY || html.scrollTop || 0) / maxScroll, 0, 1);
  }

  function getFrameFromScroll() {
    return Math.round(getScrollProgress() * (FRAME_COUNT - 1));
  }

  function drawCover(image) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function preloadAround(index) {
    for (let offset = -PRELOAD_RADIUS; offset <= PRELOAD_RADIUS; offset += 1) {
      const next = index + offset;
      if (next >= 0 && next < FRAME_COUNT) loadFrame(next).catch(() => {});
    }
  }

  function render() {
    ticking = false;
    targetFrame = getFrameFromScroll();
    preloadAround(targetFrame);

    if (targetFrame === drawnFrame && cache.has(targetFrame)) return;

    loadFrame(targetFrame)
      .then((image) => {
        if (targetFrame !== getFrameFromScroll()) {
          requestRender();
          return;
        }
        drawCover(image);
        drawnFrame = targetFrame;
      })
      .catch((error) => console.warn(error.message));
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      requestRender();
    }, 80);
  }

  function prepareRevealAnimations() {
    const groups = document.querySelectorAll(".section, .site-footer");

    document.querySelectorAll(".section").forEach((section) => {
      section.querySelectorAll(".reveal-item").forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 540)}ms`);
      });
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.22, rootMargin: "0px 0px -8% 0px" });

    const focusObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { threshold: 0.42 });

    groups.forEach((group) => revealObserver.observe(group));
    document.querySelectorAll(".section").forEach((section) => focusObserver.observe(section));
  }

  resizeCanvas();
  prepareRevealAnimations();
  loadFrame(0).then((image) => {
    drawCover(image);
    drawnFrame = 0;
    requestRender();
  }).catch((error) => console.warn(error.message));

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });
  window.addEventListener("load", () => {
    handleResize();
    requestRender();
  });
});
