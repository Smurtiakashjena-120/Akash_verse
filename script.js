(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme
  const savedTheme = localStorage.getItem("akash-theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  const updateThemeIcon = () => {
    themeIcon.textContent = root.dataset.theme === "light" ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  };
  updateThemeIcon();
  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("akash-theme", root.dataset.theme);
    updateThemeIcon();
  });

  // Header + scroll progress
  const updateScrollUI = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  // Mobile navigation
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
  };
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    mobileMenu.classList.toggle("open", !open);
    mobileMenu.setAttribute("aria-hidden", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  // Reveal on scroll
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("visible"));
  }

  // Rotating role line
  const roleRotator = document.getElementById("role-rotator");
  const roles = ["BACKEND SYSTEMS", "AI PRODUCTS", "FULL-STACK SYSTEMS", "SOFTWARE PRODUCTS"];
  let roleIndex = 0;
  if (!reduceMotion) {
    setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleRotator.animate(
        [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-8px)" }],
        { duration: 220, easing: "ease", fill: "forwards" }
      ).finished.then(() => {
        roleRotator.textContent = roles[roleIndex];
        return roleRotator.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 280, easing: "ease", fill: "forwards" }
        ).finished;
      }).catch(() => {});
    }, 2600);
  }

  // Active navigation section
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.removeAttribute("aria-current"));
          const active = navLinks.find(link => link.getAttribute("href") === `#${entry.target.id}`);
          if (active) active.setAttribute("aria-current", "page");
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => navObserver.observe(section));
  }

  // Counters
  const counters = document.querySelectorAll("[data-counter]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = Number(entry.target.dataset.counter);
        const start = performance.now();
        const duration = 1000;
        const tick = now => {
          const progressValue = Math.min((now - start) / duration, 1);
          entry.target.textContent = Math.floor(progressValue * target);
          if (progressValue < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: .7 });
    counters.forEach(c => counterObserver.observe(c));
  } else counters.forEach(c => c.textContent = c.dataset.counter);

  // Cursor enhancement
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  if (cursorDot && cursorRing && window.matchMedia("(pointer:fine)").matches && !reduceMotion) {
    let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    window.addEventListener("mousemove", e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`;
    }, { passive: true });
    const animateRing = () => {
      ringX += (mouseX - ringX) * .15;
      ringY += (mouseY - ringY) * .15;
      cursorRing.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();
    document.querySelectorAll("a,button,.project-card").forEach(el => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
    });
  }

  // Subtle magnetic buttons
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(button => {
      button.addEventListener("mousemove", e => {
        const r = button.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 8;
        const y = ((e.clientY - r.top) / r.height - .5) * 8;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener("mouseleave", () => button.style.transform = "");
    });
  }

  // Project case-study modal
  const projectData = {
    "smart-commerce": {
      meta: "01 / MAY 2026",
      title: "Smart Commerce",
      subtitle: "AI-Powered E-Commerce Platform",
      problem: "Build an e-commerce backend capable of handling product catalogue, orders, inventory, image management, and AI-assisted product discovery.",
      approach: "Spring Boot and Spring Data JPA provide the application layer, while PostgreSQL stores business data. Spring AI, PgVector, embeddings, and OpenAI GPT-4o power semantic discovery and assistance.",
      architecture: "React / API Client → Spring Boot → PostgreSQL + PgVector → Embeddings → RAG → OpenAI GPT-4o.",
      decisions: "DTO-based architecture, JPA relationships, transactional workflows, data consistency, automatic vector embedding synchronization, and AI-assisted product content.",
      tags: ["Spring Boot","Spring Data JPA","PostgreSQL","Spring AI","OpenAI GPT-4o","PgVector","RAG"]
    },
    "pay-zip": {
      meta: "02 / APR 2025",
      title: "Pay Zip",
      subtitle: "MERN Stack-Based Digital Wallet",
      problem: "Create a peer-to-peer digital wallet experience centered around reliable transactional fund transfers and secure authentication.",
      approach: "React provides the frontend, while Node.js and Express.js handle backend functionality with MongoDB Atlas as the data store. OTP-based email authentication and session handling support the user flow.",
      architecture: "React → Node.js / Express.js → MongoDB Atlas.",
      decisions: "Focused on transactional fund transfers, secure authentication, OTP-based email authentication, and session handling.",
      tags: ["React","Node.js","Express.js","MongoDB Atlas","OTP Authentication"]
    },
    "solos": {
      meta: "03 / FEB 2025",
      title: "Solos",
      subtitle: "GenAI-Powered Retail Analytics Platform",
      problem: "Help electronics retailers in India track competitor signals such as store growth, stock levels, pricing, and reviews.",
      approach: "Public sources are processed through web scraping and a Flask backend, with Google Gemini used in the insight pipeline and React providing the dashboard interface.",
      architecture: "Public Sources → Web Scraping → Flask Backend → Google Gemini → React Dashboard.",
      decisions: "Contributed to the frontend with a responsive and intuitive interface for tracking the generated insights.",
      tags: ["React","Flask","Google Gemini","Web Scraping"]
    },
    "networxx": {
      meta: "04 / DEC 2024",
      title: "NetWorxx",
      subtitle: "Job Search Portal",
      problem: "Create a job search experience supporting recruiters and candidates with authentication, authorization, postings, applications, and profiles.",
      approach: "Built the portal with React.js and integrated Clerk for authentication and Supabase for data storage.",
      architecture: "React.js → Clerk → Supabase.",
      decisions: "Implemented secure authentication, role-based authorization, recruiter job posting, candidate applications, resume/profile support, and scalable data storage.",
      tags: ["React.js","Clerk","Supabase"]
    }
  };

  const modal = document.getElementById("project-modal");
  const modalFields = {
    meta: document.getElementById("modal-meta"),
    title: document.getElementById("modal-title"),
    subtitle: document.getElementById("modal-subtitle"),
    problem: document.getElementById("modal-problem"),
    approach: document.getElementById("modal-approach"),
    architecture: document.getElementById("modal-architecture"),
    decisions: document.getElementById("modal-decisions"),
    tags: document.getElementById("modal-tags")
  };

  const openProject = key => {
    const data = projectData[key];
    if (!data) return;
    Object.entries(data).forEach(([field, value]) => {
      if (field === "tags") {
        modalFields.tags.innerHTML = value.map(tag => `<span>${tag}</span>`).join("");
      } else if (modalFields[field]) {
        modalFields[field].textContent = value;
      }
    });
    modal.showModal();
    document.body.style.overflow = "hidden";
  };
  const closeProject = () => {
    modal.close();
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".project-card").forEach(card => {
    const trigger = () => openProject(card.dataset.project);
    card.addEventListener("click", e => {
      if (!e.target.closest(".project-open")) trigger();
    });
    card.querySelector(".project-open")?.addEventListener("click", e => {
      e.stopPropagation(); trigger();
    });
    card.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && document.activeElement === card) {
        e.preventDefault(); trigger();
      }
    });
  });
  document.querySelector(".modal-close").addEventListener("click", closeProject);
  modal.addEventListener("click", e => { if (e.target === modal) closeProject(); });
  modal.addEventListener("cancel", () => { document.body.style.overflow = ""; });

  // Copy email
  const toast = document.querySelector(".toast");
  let toastTimer;
  document.querySelector(".copy-email").addEventListener("click", async e => {
    const email = e.currentTarget.dataset.copy;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const area = document.createElement("textarea");
      area.value = email; document.body.appendChild(area); area.select();
      document.execCommand("copy"); area.remove();
    }
    clearTimeout(toastTimer);
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  });

  // Missing-resume fallback
  const resumeLinks = document.querySelectorAll('a[href="assets/resume.pdf"]');
  fetch("assets/resume.pdf", { method: "HEAD" }).catch(() => {
    resumeLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        alert("Resume PDF not found. Add your file at assets/resume.pdf.");
      });
    });
  });
})();
