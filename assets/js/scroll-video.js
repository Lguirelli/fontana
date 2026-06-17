document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".scroll-hero");
  const video = document.querySelector("#treviScrollVideo");

  if (!section || !video) return;

  const FPS = 24;
  let duration = 0;
  let ticking = false;

  video.pause();
  video.muted = true;
  video.playsInline = true;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateVideoByScroll() {
    if (!duration || Number.isNaN(duration)) return;

    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const progress = clamp(-rect.top / scrollable, 0, 1);
    const rawTime = progress * duration;
    const frameTime = Math.round(rawTime * FPS) / FPS;

    if (Math.abs(video.currentTime - frameTime) > 0.015) {
      try {
        video.currentTime = frameTime;
      } catch (error) {
        console.warn("Não foi possível sincronizar o vídeo com o scroll.", error);
      }
    }
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      updateVideoByScroll();
      ticking = false;
    });
  }

  function onMetadataLoaded() {
    duration = video.duration;
    updateVideoByScroll();
  }

  if (video.readyState >= 1) {
    onMetadataLoaded();
  } else {
    video.addEventListener("loadedmetadata", onMetadataLoaded, { once: true });
  }

  video.addEventListener("canplay", updateVideoByScroll, { once: true });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  video.load();
});
