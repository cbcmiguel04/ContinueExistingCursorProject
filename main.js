const themeToggle = document.querySelector(".theme-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const segments = document.querySelectorAll(".segment");
const sections = document.querySelectorAll("main section[id]:not([hidden])");

function applyTheme(isOn) {
  document.documentElement.classList.toggle("theme-dark", isOn);
  themeToggle.classList.toggle("is-on", isOn);
  themeToggle.setAttribute("aria-pressed", String(isOn));
  themeToggle.setAttribute("aria-label", isOn ? "Turn on Light Mode" : "Turn on Dark Mode");
}

applyTheme(document.documentElement.classList.contains("theme-dark"));

themeToggle.addEventListener("click", () => {
  const isOn = !document.documentElement.classList.contains("theme-dark");
  applyTheme(isOn);
  try {
    localStorage.setItem("pims-theme", isOn ? "dark" : "light");
  } catch (e) {}
});

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let pinnedId = null;

const header = document.querySelector(".site-header");
const navbar = document.querySelector(".navbar");
const navMenu = document.querySelector(".nav-menu");
const preview = document.querySelector(".preview");
const panels = document.querySelectorAll("[data-panel]");
const bubbles = document.querySelectorAll(".bubble");

function setMenuOpen(open) {
  if (!navbar || !navMenu) return;
  navbar.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-locked", open);
  navMenu.setAttribute("aria-expanded", String(open));
  navMenu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

function replayEntrance() {
  document.querySelectorAll(".hero-in").forEach((el) => {
    el.classList.remove("hero-in");
    void el.offsetWidth;
    el.classList.add("hero-in");
  });
}

window.addEventListener("pageshow", replayEntrance);

document.querySelectorAll(".storage-scroller").forEach((scroller) => {
  let dragging = false;
  let startX = 0;
  let origin = 0;
  let target = 0;
  let frame = 0;

  function settle() {
    const next = scroller.scrollLeft + (target - scroller.scrollLeft) * 0.5;
    if (Math.abs(target - next) < 0.4) {
      scroller.scrollLeft = target;
      frame = 0;
      return;
    }
    scroller.scrollLeft = next;
    frame = requestAnimationFrame(settle);
  }

  scroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    origin = scroller.scrollLeft;
    target = origin;
    scroller.classList.add("is-dragging");
    scroller.setPointerCapture(event.pointerId);
  });

  scroller.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    target = origin - (event.clientX - startX);
    if (!frame) frame = requestAnimationFrame(settle);
  });

  function endDrag() {
    dragging = false;
    scroller.classList.remove("is-dragging");
  }

  scroller.addEventListener("pointerup", endDrag);
  scroller.addEventListener("pointercancel", endDrag);
});

document.querySelectorAll(".inclusions-scroller").forEach((scroller) => {
  const responsiveScroller = window.matchMedia("(max-width: 980px)");
  let pointerId = null;
  let dragging = false;
  let suppressClick = false;
  let startX = 0;
  let origin = 0;
  let target = 0;
  let frame = 0;
  let rippleFrame = 0;
  let lastScrollLeft = scroller.scrollLeft;
  let lastRippleAt = 0;
  let rippleDirection = "";

  function triggerRipple(direction) {
    if (!responsiveScroller.matches) return;
    const now = performance.now();
    if (direction === rippleDirection && now - lastRippleAt < 360) return;

    rippleDirection = direction;
    lastRippleAt = now;
    scroller.classList.remove("is-rippling-left", "is-rippling-right");
    void scroller.offsetWidth;
    scroller.classList.add(`is-rippling-${direction}`);
  }

  scroller.addEventListener(
    "scroll",
    () => {
      if (rippleFrame) return;
      rippleFrame = requestAnimationFrame(() => {
        rippleFrame = 0;
        const currentScrollLeft = scroller.scrollLeft;
        const delta = currentScrollLeft - lastScrollLeft;
        lastScrollLeft = currentScrollLeft;
        if (Math.abs(delta) < 0.5) return;
        triggerRipple(delta > 0 ? "right" : "left");
      });
    },
    { passive: true }
  );

  function settle() {
    const next = scroller.scrollLeft + (target - scroller.scrollLeft) * 0.28;
    if (Math.abs(target - next) < 0.4) {
      scroller.scrollLeft = target;
      frame = 0;
      return;
    }
    scroller.scrollLeft = next;
    frame = requestAnimationFrame(settle);
  }

  scroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    pointerId = event.pointerId;
    dragging = false;
    startX = event.clientX;
    origin = scroller.scrollLeft;
    target = origin;
  });

  scroller.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const distance = event.clientX - startX;
    if (!dragging && Math.abs(distance) < 5) return;

    if (!dragging) {
      dragging = true;
      suppressClick = true;
      scroller.classList.add("is-dragging");
      scroller.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    target = Math.min(maxScroll, Math.max(0, origin - distance));
    if (!frame) frame = requestAnimationFrame(settle);
  });

  function endDrag(event) {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    dragging = false;
    scroller.classList.remove("is-dragging");
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }

  scroller.addEventListener("pointerup", endDrag);
  scroller.addEventListener("pointercancel", endDrag);
  scroller.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );
});

function revealSection(section) {
  section.querySelectorAll(".section-in").forEach((item) => item.classList.add("is-shown"));
}

function sectionInView(section) {
  const rect = section.getBoundingClientRect();
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visible <= 0) return false;
  return visible >= Math.min(section.offsetHeight * 0.18, 160);
}

document
  .querySelectorAll(".hero, .access-section, .features, .how-it-works, .inclusions, .addons")
  .forEach((section) => {
  if (!section.querySelector(".section-in")) return;
  let shown = false;

  function show() {
    if (shown || !sectionInView(section)) return;
    shown = true;
    revealSection(section);
    window.removeEventListener("scroll", show);
    window.removeEventListener("resize", show);
    observer.disconnect();
  }

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) show();
          },
          { threshold: 0.18 }
        )
      : { disconnect() {} };

  if (observer.observe) observer.observe(section);
  window.addEventListener("scroll", show, { passive: true });
  window.addEventListener("resize", show);
  show();
});

const addonsSection = document.querySelector(".addons");
const addonTabs = Array.from(document.querySelectorAll("[data-addon-tab]"));
const addonHeadings = document.querySelectorAll("[data-addon-heading]");
const addonPanels = document.querySelectorAll("[data-addon-panel]");

function setAddonView(view) {
  addonTabs.forEach((tab) => {
    const active = tab.dataset.addonTab === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  addonHeadings.forEach((heading) => {
    const active = heading.dataset.addonHeading === view;
    heading.classList.toggle("is-active", active);
    if (active) addonsSection?.setAttribute("aria-labelledby", heading.id);
  });

  addonPanels.forEach((panel) => {
    const active = panel.dataset.addonPanel === view;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", String(!active));
    panel.inert = !active;
  });
}

addonTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setAddonView(tab.dataset.addonTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? addonTabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + addonTabs.length) %
            addonTabs.length;
    addonTabs[nextIndex].focus();
    setAddonView(addonTabs[nextIndex].dataset.addonTab);
  });
});

navMenu?.addEventListener("click", () => {
  setMenuOpen(!navbar.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
  if (!navbar?.classList.contains("is-open")) return;
  if (navbar.contains(event.target)) return;
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    pinnedId = link.getAttribute("href").slice(1);
    setActiveLink(pinnedId);
    setMenuOpen(false);
  });
});

document.querySelectorAll(".btn-access").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

const accessForm = document.querySelector(".access-form");
const workspaceInput = accessForm?.querySelector("input[name='workspace']");
const openWorkspace = accessForm?.querySelector(".access-open");
const workspaceSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function syncWorkspaceAccess() {
  if (!workspaceInput || !openWorkspace) return;
  const slug = workspaceInput.value.trim();
  openWorkspace.disabled = slug.length < 2 || !workspaceSlug.test(slug);
}

workspaceInput?.addEventListener("input", syncWorkspaceAccess);
syncWorkspaceAccess();

accessForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!openWorkspace || openWorkspace.disabled) return;
  window.open("https://pims-uat.propleinc.com/pims/login", "_blank", "noopener,noreferrer");
  });

const howSteps = Array.from(document.querySelectorAll(".how-step"));
const howStepsControl = document.querySelector(".how-steps");
const howStepPanel = document.querySelector(".how-it-works-visual");
const howStepImage = document.querySelector(".how-it-works-visual img");
const howStepDuration = 20000;
const howStepIllustrationOutDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ? 0
  : 220;
const howStepMedia = [
  {
    src: new URL("./assets/how-it-works/step-1-file-and-attach.gif", import.meta.url).href,
    alt: "PIMS document library showing property records and attached files",
  },
  {
    src: new URL("./assets/how-it-works/step-2-route-and-approve.gif", import.meta.url).href,
    alt: "PIMS approvals workspace showing a record waiting for review",
  },
  {
    src: new URL("./assets/how-it-works/step-3-extend-and-integrate.gif", import.meta.url).href,
    alt: "PIMS sales invoicing workspace showing BIR-ready invoice statuses",
  },
];

let activeHowStep = 0;
let howStepTimer = 0;
let howStepTransitionTimer = 0;
let howStepStartedAt = 0;
let howStepRemaining = howStepDuration;
let howStepRequest = 0;
let howStepsInitialized = false;
let howStepsHovered = false;
let howStepsFocused = false;
let howStepsPressed = false;

const howStepPreloads = howStepMedia.map(
  ({ src }) =>
    new Promise((resolve) => {
      const image = new Image();
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      image.src = src;
      if (image.complete) finish();
    })
);

function howStepsPaused() {
  return howStepsHovered || howStepsFocused || howStepsPressed || document.hidden;
}

function stopHowStepTimer() {
  if (!howStepTimer) return;
  howStepRemaining = Math.max(0, howStepRemaining - (performance.now() - howStepStartedAt));
  window.clearTimeout(howStepTimer);
  howStepTimer = 0;
}

function startHowStepTimer() {
  window.clearTimeout(howStepTimer);
  howStepTimer = 0;
  howStepsControl?.classList.toggle("is-paused", howStepsPaused());
  if (!howSteps.length || howStepsPaused()) return;

  howStepStartedAt = performance.now();
  const transitionLead = Math.min(howStepIllustrationOutDuration, howStepRemaining);
  howStepTimer = window.setTimeout(() => {
    setActiveHowStep((activeHowStep + 1) % howSteps.length, false, transitionLead);
  }, Math.max(0, howStepRemaining - transitionLead));
}

function pauseHowSteps() {
  stopHowStepTimer();
  howStepsControl?.classList.add("is-paused");
}

function resumeHowSteps() {
  if (!howStepsPaused()) startHowStepTimer();
}

function restartHowStepProgress(step) {
  const progress = step.querySelector(".how-step-track span");
  if (!progress) return;
  progress.style.animation = "none";
  void progress.offsetWidth;
  progress.style.animation = "";
}

function startHowStepIllustrationExit() {
  const currentStyles = window.getComputedStyle(howStepImage);
  howStepImage.style.setProperty("--how-visual-from-opacity", currentStyles.opacity);
  howStepImage.style.setProperty(
    "--how-visual-from-transform",
    currentStyles.transform === "none" ? "translate3d(0, 0, 0)" : currentStyles.transform
  );
  howStepImage.classList.remove("is-changing");
  howStepImage.classList.remove("is-leaving");
  void howStepImage.offsetWidth;
  howStepImage.classList.add("is-leaving");
}

function commitActiveHowStep(index) {
  if (!howSteps.length || !howStepImage) return;
  activeHowStep = index;
  howStepRemaining = howStepDuration;

  howSteps.forEach((step, stepIndex) => {
    const active = stepIndex === index;
    step.classList.toggle("is-active", active);
    step.setAttribute("aria-selected", String(active));
    step.tabIndex = active ? 0 : -1;
    if (active) {
      howStepPanel?.setAttribute("aria-labelledby", step.id);
      restartHowStepProgress(step);
    }
  });

  const media = howStepMedia[index];
  howStepImage.src = media.src;
  howStepImage.alt = media.alt;
  howStepImage.classList.remove("is-leaving");
  howStepImage.classList.remove("is-changing");
  howStepImage.style.removeProperty("--how-visual-from-opacity");
  howStepImage.style.removeProperty("--how-visual-from-transform");
  void howStepImage.offsetWidth;
  howStepImage.classList.add("is-changing");
  startHowStepTimer();
}

function setActiveHowStep(
  index,
  immediate = false,
  transitionDuration = howStepIllustrationOutDuration
) {
  if (!howSteps.length || !howStepImage) return;
  const request = ++howStepRequest;
  howStepRemaining = howStepDuration;
  window.clearTimeout(howStepTimer);
  window.clearTimeout(howStepTransitionTimer);
  howStepTimer = 0;
  howStepTransitionTimer = 0;

  const transition = () => {
    if (request !== howStepRequest) return;
    if (immediate || !howStepsInitialized) {
      howStepsInitialized = true;
      commitActiveHowStep(index);
      return;
    }

    startHowStepIllustrationExit();

    howStepTransitionTimer = window.setTimeout(() => {
      if (request !== howStepRequest) return;
      howStepTransitionTimer = 0;
      commitActiveHowStep(index);
    }, transitionDuration);
  };

  howStepPreloads[index].then(transition);
}

howSteps.forEach((step, index) => {
  step.addEventListener("click", () => setActiveHowStep(index));
  step.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? howSteps.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + howSteps.length) % howSteps.length;
    howSteps[nextIndex].focus();
    setActiveHowStep(nextIndex);
  });
});

howStepsControl?.addEventListener("mouseenter", () => {
  howStepsHovered = true;
  pauseHowSteps();
});

howStepsControl?.addEventListener("mouseleave", () => {
  howStepsHovered = false;
  resumeHowSteps();
});

howStepsControl?.addEventListener("focusin", () => {
  howStepsFocused = true;
  pauseHowSteps();
});

howStepsControl?.addEventListener("focusout", (event) => {
  if (howStepsControl.contains(event.relatedTarget)) return;
  howStepsFocused = false;
  resumeHowSteps();
});

howStepsControl?.addEventListener("pointerdown", () => {
  howStepsPressed = true;
  pauseHowSteps();
});

function releaseHowSteps(event) {
  howStepsPressed = false;
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    howStepsFocused = false;
  }
  resumeHowSteps();
}

howStepsControl?.addEventListener("pointerup", releaseHowSteps);
howStepsControl?.addEventListener("pointercancel", releaseHowSteps);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseHowSteps();
  } else {
    resumeHowSteps();
  }
});

window.addEventListener("pagehide", () => {
  window.clearTimeout(howStepTimer);
  window.clearTimeout(howStepTransitionTimer);
});

setActiveHowStep(0, true);

const page = document.querySelector(".page");
const hero = document.querySelector(".hero");

function syncHeroScene() {
  if (!page || !hero) return;
  const height = hero.getBoundingClientRect().bottom - page.getBoundingClientRect().top;
  page.style.setProperty("--hero-scene", `${Math.ceil(height)}px`);
}

function showPanel(tab) {
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
}

function syncHeader() {
  if (!header) return;
  const blend = Math.min(1, Math.max(0, window.scrollY / 120));
  header.style.setProperty("--nav-blend", blend.toFixed(3));
  if (navbar) navbar.classList.toggle("is-scrolled", blend > 0.05);
}

function replayShowcase() {
  if (!preview) return;
  preview.style.animationDelay = "0s";
  preview.classList.remove("hero-in");
  void preview.offsetWidth;
  preview.classList.add("hero-in");
}

segments.forEach((segment) => {
  segment.addEventListener("click", () => {
    segments.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    segment.classList.add("is-active");
    segment.setAttribute("aria-pressed", "true");
    showPanel(segment.dataset.tab);
    replayShowcase();
    segment.scrollIntoView({ inline: "nearest", block: "nearest" });
  });
});

function updateActiveFromScroll() {
  if (pinnedId) {
    setActiveLink(pinnedId);
    return;
  }
  const y = Math.min(window.innerHeight * 0.35, 320);
  let current = sections[0]?.id;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= y && rect.bottom > y) {
      current = section.id;
    }
  });
  if (current) {
    setActiveLink(current);
  }
}

window.addEventListener("scrollend", () => {
  pinnedId = null;
  updateActiveFromScroll();
});

window.addEventListener(
  "scroll",
  () => {
    updateActiveFromScroll();
    syncHeader();
  },
  { passive: true }
);
window.addEventListener("hashchange", updateActiveFromScroll);
window.addEventListener("resize", () => {
  syncHeader();
  syncHeroScene();
  if (window.innerWidth > 980) setMenuOpen(false);
});
syncHeader();
syncHeroScene();
window.addEventListener("load", () => {
  syncHeroScene();
});

let bubbleFrame = 0;
let pointerX = 0;
let pointerY = 0;
window.addEventListener(
  "mousemove",
  (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (bubbleFrame) return;
    bubbleFrame = window.requestAnimationFrame(() => {
      bubbleFrame = 0;
      bubbles.forEach((bubble) => {
        const rect = bubble.getBoundingClientRect();
        const reach = Math.min(rect.width, rect.height) * 0.42;
        const near =
          Math.hypot(pointerX - (rect.left + rect.width / 2), pointerY - (rect.top + rect.height / 2)) < reach;
        bubble.classList.toggle("is-hover", near);
      });
    });
  },
  { passive: true }
);
window.addEventListener("mouseout", (event) => {
  if (!event.relatedTarget) {
    bubbles.forEach((bubble) => bubble.classList.remove("is-hover"));
  }
});
