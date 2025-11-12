// 🌀 Smooth Scroll Script — robust + accessible

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Read a CSS variable or data attribute for sticky header offset
  const getOffset = (target) => {
    // Allow per-link override: <a data-scroll-offset="80">
    const linkOffset = Number(target?.closest('a')?.dataset?.scrollOffset || NaN);
    if (!Number.isNaN(linkOffset)) return linkOffset;

    // Global via CSS var: :root { --scroll-offset: 72px; }
    const root = getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset').trim();
    if (root.endsWith('px')) return parseFloat(root);
    const num = parseFloat(root);
    return Number.isFinite(num) ? num : 0;
  };

  const focusTarget = (el) => {
    if (!el) return;
    // Make focusable if not
    const hadTabindex = el.hasAttribute('tabindex');
    if (!hadTabindex) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (!hadTabindex) {
      // Clean up after focusing
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
    }
  };

  const smoothScrollTo = (el, offset = 0) => {
    if (!el) return;

    // Compute top position accounting for offset and current scroll
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.pageYOffset - offset;

    if (reduceMotion) {
      window.scrollTo(0, Math.max(0, top));
      focusTarget(el);
      return;
    }

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });

    // After scrolling, move focus (timeout allows UA to finish anim)
    setTimeout(() => focusTarget(el), 350);
  };

  // Single listener for all same-page hash links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    // Allow "#" only to just go top smoothly
    const id = href.slice(1);
    const target = id ? document.getElementById(decodeURIComponent(id)) : document.body;

    if (!target) return; // let browser do its thing if no target
    e.preventDefault();

    const offset = getOffset(a);
    smoothScrollTo(target, offset);

    // Update URL without jumping
    const url = new URL(window.location);
    url.hash = id;
    history.pushState(null, '', url);
  });

  // If page loaded with a hash, honor it with smooth+offset behavior
  window.addEventListener('load', () => {
    if (location.hash.length > 1) {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(id);
      if (target) smoothScrollTo(target, getOffset());
    }
  });
})();
