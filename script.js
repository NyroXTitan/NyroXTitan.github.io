/* Portfolio interactions — plain JavaScript, no dependencies.
   The page works without it; this only adds the menu, scroll effects,
   the screenshot viewer and copy-to-clipboard. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  /* ---------- Header border once the page scrolls ---------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const nav = $('.nav');
  const navToggle = $('.nav-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };

  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Mark the nav link of the section in view ---------- */
  const navLinks = $$('.nav-list a[href^="#"]');
  if (canObserve) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((section) => spy.observe(section));
  }

  /* ---------- Reveal sections as they scroll into view ---------- */
  const reveals = $$('.reveal');
  if (canObserve && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Screenshot viewer ---------- */
  const lightbox = $('#lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const caption = $('.lightbox-caption', lightbox);
    const frame = $('.lightbox-frame', lightbox);
    const image = frame.appendChild(new Image());
    let opener = null;

    $$('[data-lightbox]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        opener = link;
        image.src = link.href;
        image.alt = $('img', link)?.alt ?? '';
        caption.textContent = link.dataset.caption ?? '';
        lightbox.classList.toggle('is-tall', link.classList.contains('shot--tall'));
        lightbox.showModal();
        frame.scrollTop = 0;
      });
    });

    $('.lightbox-close', lightbox).addEventListener('click', () => lightbox.close());
    // A click on the backdrop lands on the <dialog> itself
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      image.removeAttribute('src');
      opener?.focus();
    });
  }

  /* ---------- Copy email to clipboard ---------- */
  const copyStatus = $('#copy-status');
  $$('[data-copy]').forEach((button) => {
    const label = $('.btn-label', button);
    const original = label.textContent;
    let timer;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = 'Copied!';
        copyStatus.textContent = 'Email address copied to clipboard.';
      } catch {
        label.textContent = button.dataset.copy; // clipboard blocked: show it so it can be copied by hand
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        copyStatus.textContent = '';
      }, 2200);
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
