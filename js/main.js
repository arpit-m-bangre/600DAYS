// 🌟 Main UI Loader Script — enhanced, motion-aware, no-jank

(function () {
  const ready = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, skip the fade
    if (reduceMotion) {
      document.body.style.opacity = '1';
      document.body.style.transition = 'none';
      document.documentElement.classList.add('is-ready');
      return;
    }

    // Start hidden to avoid flash
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 600ms ease';

    // rAF twice to ensure styles apply after layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
        document.documentElement.classList.add('is-ready');
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
