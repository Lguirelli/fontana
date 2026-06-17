document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#treviScrollVideo");
  if (!video) return;

  const FPS = 24;
  let duration = 0;
  let ticking = false;

  video.pause();
  video.muted = true;
  video.playsInline = true;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

  function getPageScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(getDocumentHeight() - window.innerHeight, 1);
    return clamp(scrollTop / maxScroll, 0, 1);
  }

  function updateVideoByPageScroll() {
    if (!duration || Number.isNaN(duration)) return;

    const progress = getPageScrollProgress();
    const maxTime = Math.max(duration - 0.001, 0);
    const rawTime = progress * maxTime;
    const frameTime = Math.round(rawTime * FPS) / FPS;
    const safeTime = clamp(frameTime, 0, maxTime);

    if (Math.abs(video.currentTime - safeTime) > 0.012) {
      try {
        video.currentTime = safeTime;
      } catch (error) {
        console.warn("Não foi possível sincronizar o vídeo com o scroll da página.", error);
      }
    }
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      updateVideoByPageScroll();
      ticking = false;
    });
  }

  function onMetadataLoaded() {
    duration = video.duration;
    requestUpdate();
  }

  if (video.readyState >= 1) {
    onMetadataLoaded();
  } else {
    video.addEventListener("loadedmetadata", onMetadataLoaded, { once: true });
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(document.body);
  }

  video.addEventListener("canplay", requestUpdate, { once: true });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("orientationchange", requestUpdate);
  window.addEventListener("load", requestUpdate);

  video.load();
});
