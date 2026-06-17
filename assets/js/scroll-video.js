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

  function getPageScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);

    return clamp(scrollTop / maxScroll, 0, 1);
  }

  function updateVideoByPageScroll() {
    if (!duration || Number.isNaN(duration)) return;

    const progress = getPageScrollProgress();
    const rawTime = progress * duration;
    const frameTime = Math.round(rawTime * FPS) / FPS;
    const safeTime = clamp(frameTime, 0, Math.max(duration - 0.001, 0));

    if (Math.abs(video.currentTime - safeTime) > 0.015) {
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
    updateVideoByPageScroll();
  }

  if (video.readyState >= 1) {
    onMetadataLoaded();
  } else {
    video.addEventListener("loadedmetadata", onMetadataLoaded, { once: true });
  }

  video.addEventListener("canplay", updateVideoByPageScroll, { once: true });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);

  video.load();
});
