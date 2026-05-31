/* ============================================================
   Cuestas Studio — interactions
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav scroll state ----------------------------------------- */
  const nav = document.querySelector(".nav");
  const onNav = (y) => {
    if (!nav) return;
    nav.classList.toggle("scrolled", y > 24);
  };

  /* mobile menu ---------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  if (nav && navToggle) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    navToggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    if (navPanel) navPanel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* reveal on scroll ----------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document
    .querySelectorAll(".reveal, .reveal-lines, .reveal-media, .reveal-fade, .step, .card")
    .forEach((el) => io.observe(el));

  /* stagger helper: any .stagger > * gets incremental delay --- */
  document.querySelectorAll(".stagger").forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty("--d", i * 70 + "ms");
    });
  });

  /* cursor glow follows pointer in hero ---------------------- */
  const glow = document.querySelector(".cursor-glow");
  const hero = document.querySelector(".hero");
  if (glow && hero && !reduced) {
    hero.addEventListener("pointermove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      glow.style.opacity = "1";
    });
    hero.addEventListener("pointerleave", () => { glow.style.opacity = "0.35"; });
  }

  /* glow-hover cards: track pointer for spotlight ------------ */
  document.querySelectorAll(".glow-hover").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* comparison toggle ---------------------------------------- */
  const toggle = document.querySelector(".compare-toggle");
  if (toggle) {
    const buttons = [...toggle.querySelectorAll("button")];
    const thumb = toggle.querySelector(".thumb");
    const mockBad = document.querySelector(".mock-bad");
    const mockGood = document.querySelector(".mock-good");
    const listBad = document.querySelector("[data-list='comun']");
    const listGood = document.querySelector("[data-list='pro']");
    const url = document.querySelector(".preview-bar .url");

    const moveThumb = (btn) => {
      thumb.style.left = btn.offsetLeft + "px";
      thumb.style.width = btn.offsetWidth + "px";
    };
    const setState = (mode) => {
      buttons.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
      const active = buttons.find((b) => b.dataset.mode === mode);
      moveThumb(active);
      const pro = mode === "pro";
      mockBad.hidden = pro; mockGood.hidden = !pro;
      if (listBad) listBad.hidden = pro;
      if (listGood) listGood.hidden = !pro;
      if (url) url.textContent = pro ? "cuestasstudio.com" : "www.mi-negocio-2014.com.uy/index.html";
    };
    buttons.forEach((b) => b.addEventListener("click", () => setState(b.dataset.mode)));
    requestAnimationFrame(() => setState("comun"));
    window.addEventListener("resize", () => {
      const active = buttons.find((b) => b.classList.contains("active"));
      if (active) moveThumb(active);
    });
  }

  /* count-up for hero stats ---------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const fmt = (v) => (target % 1 === 0 ? Math.round(v) : v.toFixed(1)) + suffix;
      cio.unobserve(el);
      if (reduced) { el.textContent = fmt(target); return; }
      const dur = 1200;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => cio.observe(c));

  /* scroll-linked parallax ----------------------------------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const updateParallax = (y) => {
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const shift = Math.round(y * speed * -1);
      if (el.classList.contains("float-card")) {
        el.style.setProperty("--py", shift + "px"); // composes with the floaty keyframe
      } else {
        el.style.transform = `translate3d(0, ${shift}px, 0)`;
      }
    });
  };
  const doParallax = !reduced && parallaxEls.length > 0;

  /* scroll-scrubbed block transitions: each section fades, drifts and
     blurs as it leaves while the next rises in. Reversible, tied to scroll.
     Inner micro-effects (speed bar, timeline dots) keep their own triggers. */
  const blocks = reduced ? [] : [...document.querySelectorAll(".block-anim > .wrap")];
  const clampN = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const updateBlocks = () => {
    const vh = window.innerHeight || 1;
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      const enter = clampN((vh * 0.92 - r.top) / (vh * 0.42));   // rises in from below
      const exit = clampN((vh * 0.4 - r.bottom) / (vh * 0.4));   // recedes as its tail leaves the top
      const op = 1 - 0.62 * exit;
      const ty = (1 - enter) * 14 - exit * 26;
      const bl = (1 - enter) * 4 + exit * 6;
      el.style.opacity = op.toFixed(3);
      el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
      el.style.filter = bl > 0.25 ? `blur(${bl.toFixed(1)}px)` : "none";
      el.style.willChange = enter < 1 || exit > 0 ? "transform, opacity, filter" : "auto";
    }
  };

  /* single scroll dispatcher */
  const onScroll = (y) => {
    onNav(y);
    if (doParallax) updateParallax(y);
    if (blocks.length) updateBlocks();
  };

  /* smooth scroll (Lenis) + scroll dispatch ------------------ */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 4) });
    lenis.on("scroll", ({ scroll }) => onScroll(scroll));
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { onScroll(window.scrollY); ticking = false; });
    }, { passive: true });
  }
  onScroll(window.scrollY || 0);
  window.addEventListener("resize", () => { if (blocks.length) updateBlocks(); }, { passive: true });

  /* in-page anchor smooth scroll (offset for the fixed nav) -- */
  const NAV_OFFSET = 80;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const toTop = id === "#top";
      const target = toTop ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const behavior = reduced ? "auto" : "smooth";
      if (lenis) {
        lenis.scrollTo(toTop ? 0 : target, { offset: toTop ? 0 : -NAV_OFFSET });
      } else if (toTop) {
        window.scrollTo({ top: 0, behavior });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior });
      }
    });
  });

  /* year ----------------------------------------------------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
