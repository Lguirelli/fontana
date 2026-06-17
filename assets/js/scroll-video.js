document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#treviFrameCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: false });

  const FRAME_FOLDER = "frames fontana";
  const START_FRAME = 2000;
  const END_FRAME = 2336;
  const FRAME_COUNT = END_FRAME - START_FRAME + 1;
  const CACHE_LIMIT = window.matchMedia("(max-width: 760px)").matches ? 16 : 28;
  const PRELOAD_RADIUS = window.matchMedia("(max-width: 760px)").matches ? 1 : 2;

  let canvasWidth = 0;
  let canvasHeight = 0;
  let targetFrame = 0;
  let drawnFrame = -1;
  let rafId = 0;
  let resizeTimer = 0;

  const cache = new Map();
  const requests = new Map();

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const frameNumber = (index) => START_FRAME + index;

  function frameUrlCandidates(index) {
    const number = frameNumber(index);
    const filename = `Sequência 01_${number}.jpg`;
    const raw = `${FRAME_FOLDER}/${filename}`;
    const encoded = encodeURI(raw);

    return [
      raw,
      encoded,
      `${FRAME_FOLDER}/Sequ%C3%AAncia%2001_${number}.jpg`,
      `${FRAME_FOLDER}/Sequência%2001_${number}.jpg`
    ];
  }

  function trimCache() {
    if (cache.size <= CACHE_LIMIT) return;

    const ordered = [...cache.keys()].sort(
      (a, b) => Math.abs(b - targetFrame) - Math.abs(a - targetFrame)
    );

    while (cache.size > CACHE_LIMIT && ordered.length) {
      const key = ordered.shift();
      if (key !== targetFrame && key !== drawnFrame) cache.delete(key);
    }
  }

  function tryLoad(urls, safeIndex, resolve, reject) {
    const [url, ...rest] = urls;
    if (!url) {
      reject(new Error(`Frame não encontrado: ${frameNumber(safeIndex)}`));
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";

    image.onload = () => {
      cache.set(safeIndex, image);
      requests.delete(safeIndex);
      trimCache();
      resolve(image);
    };

    image.onerror = () => tryLoad(rest, safeIndex, resolve, reject);
    image.src = url;
  }

  function loadFrame(index) {
    const safeIndex = clamp(index, 0, FRAME_COUNT - 1);
    if (cache.has(safeIndex)) return Promise.resolve(cache.get(safeIndex));
    if (requests.has(safeIndex)) return requests.get(safeIndex);

    const request = new Promise((resolve, reject) => {
      tryLoad(frameUrlCandidates(safeIndex), safeIndex, resolve, reject);
    });

    requests.set(safeIndex, request);
    return request;
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
    const body = document.body;
    const scrollTop = window.scrollY || html.scrollTop || body.scrollTop || 0;
    const scrollHeight = Math.max(html.scrollHeight, body.scrollHeight);
    const maxScroll = Math.max(scrollHeight - window.innerHeight, 1);
    return clamp(scrollTop / maxScroll, 0, 1);
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

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imageRatio;
    }

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

  function updateReveal() {
    const trigger = window.innerHeight * 0.82;
    const focusLine = window.innerHeight * 0.48;

    document.querySelectorAll(".section, .site-footer").forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < trigger) section.classList.add("is-visible");
      const active = rect.top < focusLine && rect.bottom > window.innerHeight * 0.24;
      section.classList.toggle("is-active", active);
    });
  }

  function render() {
    rafId = 0;
    targetFrame = getFrameFromScroll();
    preloadAround(targetFrame);
    updateReveal();

    if (targetFrame === drawnFrame && cache.has(targetFrame)) return;

    loadFrame(targetFrame)
      .then((image) => {
        const currentFrame = getFrameFromScroll();
        if (targetFrame !== currentFrame) {
          requestRender();
          return;
        }

        drawCover(image);
        drawnFrame = targetFrame;
      })
      .catch((error) => console.warn(error.message));
  }

  function requestRender() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(render);
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      requestRender();
    }, 70);
  }

  document.querySelectorAll(".section").forEach((section) => {
    section.querySelectorAll(".reveal-item").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 540)}ms`);
    });
  });

  resizeCanvas();
  updateReveal();

  loadFrame(0)
    .then((image) => {
      drawCover(image);
      drawnFrame = 0;
      requestRender();
    })
    .catch((error) => console.warn(error.message));

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });
  window.addEventListener("load", () => {
    handleResize();
    requestRender();
  });
});
