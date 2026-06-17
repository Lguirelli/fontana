(() => {
  const section = document.getElementById('fontana-trevi');
  const video = document.getElementById('treviScrollVideo');
  if (!section || !video) return;

  const fps = 24;
  let targetTime = 0;
  let ticking = false;
  let duration = 14.041667; // fallback: 337 frames / 24 fps

  video.pause();
  video.currentTime = 0;

  video.addEventListener('loadedmetadata', () => {
    duration = video.duration || duration;
    updateVideoTime();
  });

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    return scrollable > 0 ? scrolled / scrollable : 0;
  }

  function updateVideoTime() {
    const progress = getProgress();
    const rawTime = progress * duration;

    // Trava no grid de 24 fps para preservar a lógica da sequência original.
    targetTime = Math.round(rawTime * fps) / fps;
    targetTime = Math.min(duration - 0.001, Math.max(0, targetTime));

    if (Math.abs(video.currentTime - targetTime) > 0.016) {
      video.currentTime = targetTime;
    }

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateVideoTime);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  video.addEventListener('canplay', requestUpdate, { once: true });
  requestUpdate();
})();
