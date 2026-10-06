// William Sharpe — portfolio. Progressive enhancement only: every page works without this file.
// Charts are pre-rendered into the HTML by tools/build_charts.py.

(function () {
  const safely = (fn) => { try { fn(); } catch (e) { /* leave the no-JS version in place */ } };

  /* Header border once the page scrolls. */
  safely(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  /* Slide deck: without JS it's a swipeable strip; with JS, one slide at a time. */
  document.querySelectorAll('.deck').forEach((deck) => safely(() => {
    const slides = [...deck.querySelectorAll('.deck-stage img')];
    const count = deck.querySelector('.deck-count');
    if (!slides.length) return;
    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle('on', k === i);
        if (Math.abs(k - i) <= 1) s.loading = 'eager';
      });
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };
    deck.querySelector('[data-prev]').addEventListener('click', () => show(i - 1));
    deck.querySelector('[data-next]').addEventListener('click', () => show(i + 1));
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
    deck.classList.add('is-js');
    show(0);
  }));

  /* YouTube: the cover is a plain link to YouTube; with JS it swaps in the player in place. */
  document.querySelectorAll('.video[data-yt]').forEach((v) => safely(() => {
    const link = v.querySelector('.video-link');
    if (!link) return;
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" work
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.dataset.yt)}?autoplay=1&rel=0`;
      f.title = 'marko demo video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      v.replaceChildren(f);
    });
  }));

  /* Live site previews: the cover links to the site in a new tab; with JS it loads in place.
     Sandboxed without forms, popups or top-navigation so the embed can't send anything or leave the page. */
  document.querySelectorAll('.live-cover[data-live]').forEach((cover) => safely(() => {
    cover.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = cover.dataset.live;
      f.title = cover.dataset.title || 'Live website';
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      f.setAttribute('referrerpolicy', 'no-referrer');
      cover.replaceWith(f);
    });
  }));
})();
