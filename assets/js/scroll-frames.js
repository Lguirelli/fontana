(() => {
  const canvas = document.getElementById("treviFrameCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const FRAME_START = 2000;
  const FRAME_END = 2336;
  const FRAME_COUNT = FRAME_END - FRAME_START + 1;
  const FRAME_FOLDER = "frames fontana";
  const FRAME_PREFIX = "Sequência 01_";
  const FRAME_EXTENSION = ".jpg";

  const cache = new Map();
  const loading = new Set();
  const MAX_CACHE_SIZE = 48;
  const PRELOAD_RADIUS = 8;

  let currentFrameIndex = -1;
  let lastDrawnFrameIndex = -1;
  let currentImage = null;
  let ticking = false;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let deviceRatio = Math.min(window.devicePixelRatio || 1, 2);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getFrameUrl(index) {
    const fileNumber = FRAME_START + index;
    return encodeURI(`${FRAME_FOLDER}/${FRAME_PREFIX}${fileNumber}${FRAME_EXTENSION}`);
  }

  function getDocumentHeight() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }

  function getPageProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(getDocumentHeight() - window.innerHeight, 1);
    return clamp(scrollTop / maxScroll, 0, 1);
  }

  function getFrameIndexByScroll() {
    return Math.round(getPageProgress() * (FRAME_COUNT - 1));
  }

  function trimCache(keepIndex) {
    if (cache.size <= MAX_CACHE_SIZE) return;

    const ordered = [...cache.keys()].sort((a, b) => {
      return Math.abs(a - keepIndex) - Math.abs(b - keepIndex);
    });

    const keep = new Set(ordered.slice(0, MAX_CACHE_SIZE));
    for (const key of cache.keys()) {
      if (!keep.has(key)) cache.delete(key);
    }
  }

  function loadFrame(index) {
    if (index < 0 || index >= FRAME_COUNT) return Promise.resolve(null);
    if (cache.has(index)) return Promise.resolve(cache.get(index));
    if (loading.has(index)) return Promise.resolve(null);

    loading.add(index);

    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";

      image.onload = () => {
        loading.delete(index);
        cache.set(index, image);
        trimCache(index);
        resolve(image);

        if (index === currentFrameIndex) {
          currentImage = image;
          drawFrame(image);
          lastDrawnFrameIndex = index;
        }
      };

      image.onerror = () => {
        loading.delete(index);
        console.warn(`Frame não carregado: ${getFrameUrl(index)}`);
        resolve(null);
      };

      image.src = getFrameUrl(index);
    });
  }

  function preloadNearbyFrames(index) {
    loadFrame(index);

    for (let distance = 1; distance <= PRELOAD_RADIUS; distance += 1) {
      loadFrame(index + distance);
      loadFrame(index - distance);
    }
  }

  function resizeCanvas() {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);

    if (width === canvasWidth && height === canvasHeight && nextRatio === deviceRatio) {
      return;
    }

    canvasWidth = width;
    canvasHeight = height;
    deviceRatio = nextRatio;

    canvas.width = Math.round(width * deviceRatio);
    canvas.height = Math.round(height * deviceRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

    if (currentImage) {
      drawFrame(currentImage);
    }
  }

  function drawFrame(image) {
    if (!image || !canvasWidth || !canvasHeight) return;

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    if (imageRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imageRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imageRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  function renderByScroll() {
    ticking = false;
    resizeCanvas();

    const nextFrameIndex = getFrameIndexByScroll();
    currentFrameIndex = nextFrameIndex;

    if (nextFrameIndex === lastDrawnFrameIndex) {
      preloadNearbyFrames(nextFrameIndex);
      return;
    }

    const cachedImage = cache.get(nextFrameIndex);

    if (cachedImage) {
      currentImage = cachedImage;
      drawFrame(cachedImage);
      lastDrawnFrameIndex = nextFrameIndex;
    } else {
      loadFrame(nextFrameIndex);
    }

    preloadNearbyFrames(nextFrameIndex);
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(renderByScroll);
  }

  function boot() {
    resizeCanvas();

    const firstFrame = getFrameIndexByScroll();
    currentFrameIndex = firstFrame;

    loadFrame(firstFrame).then((image) => {
      if (image && !currentImage) {
        currentImage = image;
        drawFrame(image);
        lastDrawnFrameIndex = firstFrame;
      }
      preloadNearbyFrames(firstFrame);
    });

    requestRender();
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
  window.addEventListener("orientationchange", requestRender);
  window.addEventListener("load", requestRender);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(requestRender);
    resizeObserver.observe(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
