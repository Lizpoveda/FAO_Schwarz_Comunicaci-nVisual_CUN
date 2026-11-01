/* =========================================================
   FAO Schwarz — El Zen de la Construcción
   Interactions
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const touchDevice = window.matchMedia("(hover: none)");

  /* ---------- Header scroll state ---------- */

  const header = document.getElementById("site-header");

  const syncHeaderHeight = () => {
    if (!header) return;
    const height = Math.round(header.getBoundingClientRect().height);
    if (height > 0) {
      document.documentElement.style.setProperty("--header-h", `${height}px`);
    }
  };

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight, { passive: true });
  window.addEventListener("load", syncHeaderHeight, { once: true });
  if (document.fonts?.ready) {
    document.fonts.ready.then(syncHeaderHeight).catch(() => {});
  }

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- Active section in navigation ---------- */

  const navLinks = Array.from(document.querySelectorAll(".main-nav a[href^='#']"));
  const navSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter((item) => item.section);

  const updateActiveNav = () => {
    if (!navSections.length) return;
    const probe = (header?.getBoundingClientRect().height ?? 0) + 60;
    let active = null;

    navSections.forEach(({ section }) => {
      if (section.getBoundingClientRect().top <= probe) active = section;
    });

    navSections.forEach(({ link, section }) => {
      link.classList.toggle("is-active", section === active);
    });
  };

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("resize", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------- Mobile / full menu ---------- */

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuClose = document.getElementById("menu-close");

  let lastFocusedElement = null;

  const openMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    lastFocusedElement = document.activeElement;
    document.body.classList.add("menu-open");
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    window.setTimeout(() => menuClose?.focus(), 80);
  };

  const closeMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    document.body.classList.remove("menu-open");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    } else {
      menuToggle.focus();
    }
  };

  menuToggle?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu?.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ---------- Generated low-poly wireframe ---------- */

  const stage = document.getElementById("dragon-stage");
  const wireframe = document.getElementById("dragon-wireframe");

  const createWireframe = () => {
    if (!wireframe) return;

    const NS = "http://www.w3.org/2000/svg";
    const W = 700;
    const H = 994;
    const cols = 16;
    const rows = 23;

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    const random = (min, max) => min + Math.random() * (max - min);
    const cellW = W / cols;
    const cellH = H / rows;
    const points = [];

    for (let y = 0; y <= rows; y += 1) {
      for (let x = 0; x <= cols; x += 1) {
        const edgeX = x === 0 || x === cols;
        const edgeY = y === 0 || y === rows;
        const px = x * cellW + (edgeX ? 0 : random(-cellW * 0.33, cellW * 0.33));
        const py = y * cellH + (edgeY ? 0 : random(-cellH * 0.33, cellH * 0.33));
        points.push([px, py]);
      }
    }

    const pointAt = (x, y) => points[y * (cols + 1) + x];
    const fmt = (value) => value.toFixed(1);
    let d = "";

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const a = pointAt(x, y);
        const b = pointAt(x + 1, y);
        const c = pointAt(x, y + 1);
        const e = pointAt(x + 1, y + 1);

        if (Math.random() > 0.5) {
          d += `M${fmt(a[0])} ${fmt(a[1])}L${fmt(b[0])} ${fmt(b[1])}L${fmt(c[0])} ${fmt(c[1])}Z`;
          d += `M${fmt(b[0])} ${fmt(b[1])}L${fmt(e[0])} ${fmt(e[1])}L${fmt(c[0])} ${fmt(c[1])}Z`;
        } else {
          d += `M${fmt(a[0])} ${fmt(a[1])}L${fmt(b[0])} ${fmt(b[1])}L${fmt(e[0])} ${fmt(e[1])}Z`;
          d += `M${fmt(a[0])} ${fmt(a[1])}L${fmt(e[0])} ${fmt(e[1])}L${fmt(c[0])} ${fmt(c[1])}Z`;
        }
      }
    }

    const mesh = document.createElementNS(NS, "path");
    mesh.setAttribute("d", d);
    mesh.setAttribute("class", "mesh");
    mesh.setAttribute("pathLength", "1");
    svg.appendChild(mesh);

    const vertexGroup = document.createElementNS(NS, "g");
    vertexGroup.setAttribute("class", "vertices");

    for (let i = 0; i < 46; i += 1) {
      const px = random(18, W - 18);
      const py = random(18, H - 18);
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", px.toFixed(1));
      dot.setAttribute("cy", py.toFixed(1));
      dot.setAttribute("r", random(0.8, 1.7).toFixed(1));
      dot.setAttribute("class", "vertex");
      vertexGroup.appendChild(dot);
    }

    svg.appendChild(vertexGroup);
    wireframe.appendChild(svg);
  };

  createWireframe();

  /* ---------- Touch / keyboard reveal ---------- */

  if (stage) {
    if (touchDevice.matches) {
      stage.addEventListener("click", () => {
        stage.classList.toggle("is-active");
      });
    }

    stage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        stage.classList.toggle("is-active");
      }
    });
  }

  /* ---------- Pointer parallax ---------- */

  const plate = document.getElementById("dragon-plate");
  const hero = document.querySelector(".hero");
  let frame = null;

  const resetParallax = () => {
    if (!plate) return;
    if (frame) cancelAnimationFrame(frame);
    plate.style.transform = "";
    plate.style.setProperty("--mx", "50%");
    plate.style.setProperty("--my", "50%");
  };

  if (hero && plate && !reducedMotion.matches) {
    hero.addEventListener(
      "pointermove",
      (event) => {
        if (touchDevice.matches) return;

        const stageRect = stage?.getBoundingClientRect();
        if (!stageRect) return;

        const relativeX = (event.clientX - stageRect.left) / stageRect.width;
        const relativeY = (event.clientY - stageRect.top) / stageRect.height;
        const nx = Math.max(-0.5, Math.min(0.5, relativeX - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, relativeY - 0.5));

        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          plate.style.transform = `translate3d(${(nx * 13).toFixed(2)}px, ${(ny * 10).toFixed(2)}px, 0)`;
          plate.style.setProperty("--mx", `${(relativeX * 100).toFixed(1)}%`);
          plate.style.setProperty("--my", `${(relativeY * 100).toFixed(1)}%`);
        });
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", resetParallax);
    window.addEventListener("blur", resetParallax);
  }

  /* ---------- Scroll reveal ---------- */

  const revealElements = document.querySelectorAll(".reveal");

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  let revealFrame = 0;

  const sweepReveals = () => {
    revealFrame = 0;
    const limit = window.innerHeight * 0.94;
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
      if (element.getBoundingClientRect().top < limit) {
        element.classList.add("is-visible");
      }
    });
  };

  const requestRevealSweep = () => {
    if (revealFrame) return;
    revealFrame = window.requestAnimationFrame(sweepReveals);
  };

  window.addEventListener("scroll", requestRevealSweep, { passive: true });
  window.addEventListener("resize", requestRevealSweep, { passive: true });
  window.addEventListener("load", requestRevealSweep, { once: true });
  requestRevealSweep();

  /* ---------- Newsletter ---------- */

  const newsletter = document.getElementById("newsletter");
  const emailInput = document.getElementById("newsletter-email");
  const newsletterMessage = document.getElementById("newsletter-message");

  newsletter?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!emailInput || !newsletterMessage) return;

    const email = emailInput.value.trim();

    if (!email || !emailInput.checkValidity()) {
      newsletterMessage.textContent = "Introduce un correo válido para continuar.";
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }

    emailInput.removeAttribute("aria-invalid");
    newsletterMessage.textContent = "Gracias. Te avisaremos cuando la colección esté disponible.";
    newsletter.reset();
  });

  emailInput?.addEventListener("input", () => {
    if (!newsletterMessage) return;
    newsletterMessage.textContent = "";
    emailInput.removeAttribute("aria-invalid");
  });

  /* ---------- QA helpers (scroll / offsets) ---------- */

  const qaParams = new URLSearchParams(window.location.search);

  if (qaParams.has("scroll")) {
    const target = Number(qaParams.get("scroll"));
    if (Number.isFinite(target)) {
      document.documentElement.style.scrollBehavior = "auto";
      const goToTarget = () => window.scrollTo(0, target);
      if (document.readyState === "complete") goToTarget();
      else window.addEventListener("load", goToTarget, { once: true });
    }
  }

  if (qaParams.has("offset")) {
    const offset = Number(qaParams.get("offset"));
    if (Number.isFinite(offset)) {
      document.documentElement.classList.add("qa-offset");
      document.body.style.transform = `translateY(-${offset}px)`;
      document.body.style.transformOrigin = "top left";
    }
  }

  if (qaParams.has("wire")) {
    window.addEventListener(
      "load",
      () => document.getElementById("dragon-stage")?.classList.add("is-active"),
      { once: true }
    );
  }

  if (qaParams.has("menu")) {
    window.addEventListener(
      "load",
      () => document.getElementById("menu-toggle")?.click(),
      { once: true }
    );
  }

  if (qaParams.has("metrics")) {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(() => {
        const rect = (element) => {
          if (!element) return null;
          const box = element.getBoundingClientRect();
          return {
            x: Math.round(box.x),
            y: Math.round(box.y),
            w: Math.round(box.width),
            h: Math.round(box.height),
            right: Math.round(box.right),
          };
        };
        const data = {
          viewport: { w: window.innerWidth, h: window.innerHeight },
          scrollWidth: document.documentElement.scrollWidth,
          hero: rect(document.querySelector(".hero")),
          heroContent: rect(document.querySelector(".hero-content")),
          eyebrow: rect(document.querySelector(".hero .eyebrow")),
          stage: rect(document.querySelector(".dragon-stage")),
          copy: rect(document.querySelector(".hero-copy")),
          title: rect(document.querySelector(".hero h1")),
          titleSpans: Array.from(document.querySelectorAll(".hero h1 span")).map(rect),
          titleTextWidths: Array.from(document.querySelectorAll(".hero h1 span")).map((span) => {
            const range = document.createRange();
            range.selectNodeContents(span);
            return Math.round(range.getBoundingClientRect().width);
          }),
          subtitle: rect(document.querySelector(".hero-subtitle")),
          cta: rect(document.querySelector(".hero .cta")),
          meta: rect(document.querySelector(".hero-meta")),
          cue: rect(document.querySelector(".scroll-cue")),
          titleFont: getComputedStyle(document.querySelector(".hero h1")).fontSize,
          scrollY: Math.round(window.scrollY),
          revealVisible: document.querySelectorAll(".reveal.is-visible").length,
          revealTotal: document.querySelectorAll(".reveal").length,
          revealHiddenAbove: Array.from(
            document.querySelectorAll(".reveal:not(.is-visible)")
          ).filter((element) => element.getBoundingClientRect().bottom < 0).length,
        };
        const node = document.createElement("script");
        node.type = "application/json";
        node.id = "qa-metrics";
        node.textContent = JSON.stringify(data);
        document.body.appendChild(node);
        }, 700);
      },
      { once: true }
    );
  }

  if (qaParams.has("qa")) {
    window.addEventListener(
      "load",
      () => {
        const offsets = {};
        document.querySelectorAll("section, footer").forEach((section) => {
          offsets[section.id] = Math.round(section.getBoundingClientRect().top + window.scrollY);
        });
        const node = document.createElement("script");
        node.type = "application/json";
        node.id = "qa-offsets";
        node.textContent = JSON.stringify(offsets);
        document.body.appendChild(node);
      },
      { once: true }
    );
  }

  /* ---------- Small icon feedback ---------- */

  document.querySelectorAll(".icon-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (reducedMotion.matches) return;
      button.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(-2px) scale(0.96)" },
          { transform: "translateY(0) scale(1)" },
        ],
        { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    });
  });
})();
