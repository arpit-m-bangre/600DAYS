// 💫 UI Effects — efficient, observer-based, motion-aware

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(document.querySelectorAll('.card'));

  // Early exit if no cards
  if (!cards.length) return;

  // Prepare initial hidden state via classes (keep JS light)
  cards.forEach((card) => {
    card.classList.add('card--hidden'); // CSS handles opacity/translate
    card.setAttribute('data-animated', 'false'); // guard for repeated work
  });

  const reveal = (card) => {
    if (card.dataset.animated === 'true') return;
    card.dataset.animated = 'true';

    if (reduceMotion) {
      // Instant reveal
      card.classList.remove('card--hidden');
      card.classList.add('card--visible');
      return;
    }

    // Smooth reveal via CSS transition
    card.classList.add('card--visible');
    card.classList.remove('card--hidden');
  };

  // Prefer IntersectionObserver for performance
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px', // reveal a bit before entering
      threshold: 0.15
    });

    cards.forEach((c) => io.observe(c));
  } else {
    // Fallback: throttle scroll handler
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vpH = window.innerHeight || document.documentElement.clientHeight;
        cards.forEach((card) => {
          if (card.dataset.animated === 'true') return;
          const rect = card.getBoundingClientRect();
          if (rect.top < vpH * 0.9) reveal(card);
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll(); // initial check
  }

  // Hover glow — toggle a class so CSS controls the shadow (GPU-friendly)
  const onEnter = (e) => e.currentTarget.classList.add('card--glow');
  const onLeave = (e) => e.currentTarget.classList.remove('card--glow');

  // Only add hover listeners for pointer-precision devices
  if (window.matchMedia('(any-pointer: fine)').matches) {
    cards.forEach((card) => {
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
    });
  }
})();
