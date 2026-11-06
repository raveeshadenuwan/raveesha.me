// Raveesha Denuwan Portfolio interactions
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;

// Mobile menu
const menuToggle = $("#menuToggle"), navLinks = $("#navLinks");
if (menuToggle && navLinks) {
  const setMenu = open => {
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };
  menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("resize", () => innerWidth > 760 && setMenu(false));
}

// Theme toggle
const themeToggle = $("#themeToggle");
let savedTheme = null;
try { savedTheme = localStorage.getItem("raveesha-theme"); } catch (e) {}
if (savedTheme === "light") document.body.classList.add("light");
const icon = () => document.body.classList.contains("light") ? "☾" : "☼";
if (themeToggle) {
  themeToggle.innerHTML = icon();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const light = document.body.classList.contains("light");
    try { localStorage.setItem("raveesha-theme", light ? "light" : "dark"); } catch (e) {}
    themeToggle.innerHTML = icon();
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  });
}
const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

// Scroll progress bar + header blur
const bar = $("#progress"), header = $(".site-header");
const onScroll = () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  header.classList.toggle("scrolled", h.scrollTop > 30);
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// Reveal on scroll, with a small stagger inside each group
const targets = ".section-heading,.about-copy,.profile-panel,.focus-card,.toolkit-group,.project-card,.education-item,.cert-group,.career-card,.contact-layout>*,.quick-grid>div,.project-cta,.small-note,.education-list";
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
$$(targets).forEach(el => {
  if (!el.classList.contains("education-list")) {
    el.classList.add("reveal");
    el.style.setProperty("--d", [...el.parentElement.children].filter(c => c.matches(targets)).indexOf(el) * .09 + "s");
  }
  reduce ? el.classList.add("in") : io.observe(el);
});

// Typing effect in the hero
const typed = $("#typed");
if (typed && !reduce) {
  const words = ["Cybersecurity", "Network Defense", "Ethical Hacking", "IT Education"];
  let w = 0, c = words[0].length, del = true;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (del) { c--; if (c < 0) { del = false; w = (w + 1) % words.length; c = 0; } }
    else { c++; if (c > words[w].length) { del = true; c = words[w].length; return setTimeout(tick, 1600); } }
    setTimeout(tick, del ? 35 : 75);
  })();
}

if (fine && !reduce) {
  // Cursor glow
  const spot = $(".spot");
  addEventListener("mousemove", e => spot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`, { passive: true });
  // Card tilt + light that follows the cursor
  $$(".focus-card,.project-card,.career-card,.cert-group").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px"); card.style.setProperty("--my", y + "px");
      card.style.transform = `perspective(900px) rotateX(${(.5 - y / r.height) * 5}deg) rotateY(${(x / r.width - .5) * 5}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });
}

// Network background (particles linked by lines)
const cv = $("#net");
if (cv && !reduce) {
  const ctx = cv.getContext("2d");
  let W, H, pts = [], mouse = { x: -999, y: -999 }, run = true;
  const size = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    pts = Array.from({ length: Math.min(90, Math.floor(W * H / 16000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  };
  size(); addEventListener("resize", size);
  addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", () => { run = !document.hidden; if (run) draw(); });
  function draw() {
    if (!run) return;
    const rgb = getComputedStyle(document.body).getPropertyValue("--pc").trim() || "79,140,255";
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = `rgba(${rgb},.8)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { ctx.strokeStyle = `rgba(${rgb},${.28 * (1 - d / 130)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (m < 160) { ctx.strokeStyle = `rgba(34,211,238,${.5 * (1 - m / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Loading screen: boot messages, counter, then the curtain lifts
(function () {
  const loader = $("#loader"), num = $("#ldNum"), fill = $("#ldBar"), txt = $("#ldText");
  if (!loader) return;
  const finish = () => { document.body.classList.remove("loading"); loader.classList.add("done"); setTimeout(() => loader.remove(), 1600); };
  if (reduce) return finish();
  const msgs = ["Initializing secure environment", "Loading network modules", "Verifying credentials", "Encrypting connection", "Access granted"];
  let p = 0, loaded = document.readyState === "complete";
  addEventListener("load", () => loaded = true);
  const t0 = performance.now();
  (function step() {
    const el = performance.now() - t0;
    const target = Math.min(100, el / 2400 * 100);
    p += (target - p) * .15 + .3;
    if (p > 99 && !loaded && el < 5000) p = 99;
    p = Math.min(p, 100);
    num.textContent = Math.floor(p) + "%"; fill.style.width = p + "%";
    txt.textContent = msgs[Math.min(msgs.length - 1, Math.floor(p / 21))];
    if (p >= 100) return setTimeout(finish, 350);
    requestAnimationFrame(step);
  })();
})();

// 3D mouse depth on the hero portrait and cube
if (fine && !reduce) {
  const hero = $(".hero"), vis = $(".hero-visual"), cube = $(".hero-cube");
  hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    vis.style.setProperty("--ry", x * 14 + "deg"); vis.style.setProperty("--rx", -y * 12 + "deg");
    if (cube) cube.style.translate = `${x * -30}px ${y * -30}px`;
  });
  hero.addEventListener("mouseleave", () => { vis.style.setProperty("--ry", "0deg"); vis.style.setProperty("--rx", "0deg"); });
}

// Click effects: 3D burst of glowing shards and binary digits
if (!reduce) {
  const fx = document.createElement("div"); fx.className = "fx"; document.body.appendChild(fx);
  const rnd = (a, b) => a + Math.random() * (b - a);
  function burst(x, y, n = 14, power = 1) {
    const ring = document.createElement("div"); ring.className = "click-ring";
    ring.style.left = x - 75 + "px"; ring.style.top = y - 75 + "px"; fx.appendChild(ring);
    ring.animate([{ transform: "scale(0)", opacity: .9 }, { transform: `scale(${power})`, opacity: 0 }], { duration: 750, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = () => ring.remove();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i"), k = Math.random(), size = rnd(9, 20);
      s.className = "shard" + (k > .55 ? " v" : "") + (k < .3 ? " t" : "");
      if (k < .3) s.textContent = Math.random() > .5 ? "1" : "0";
      s.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
      fx.appendChild(s);
      const a = (i / n) * 6.283 + rnd(-.3, .3), d = rnd(70, 170) * power;
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d, z = rnd(-150, 300);
      s.animate([
        { transform: "translate(-50%,-50%) rotateX(0) rotateY(0) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) translateZ(${z}px) rotateX(${rnd(180, 540)}deg) rotateY(${rnd(180, 540)}deg) scale(.15)`, opacity: 0 }
      ], { duration: rnd(800, 1300), easing: "cubic-bezier(.15,.8,.3,1)" }).onfinish = () => s.remove();
    }
  }
  document.addEventListener("click", e => {
    if (e.target.closest("#loader")) return;
    const small = e.target.closest("a,button");
    burst(e.clientX, e.clientY, small ? 8 : 16, small ? .8 : 1);
  });
  // Click the cube: it spins fast and pops
  const hc = $(".hero-cube");
  if (hc) hc.addEventListener("click", e => {
    const c = $(".cube", hc); c.style.animationDuration = "1.6s";
    hc.animate([{ scale: 1 }, { scale: 1.7 }, { scale: 1 }], { duration: 900, easing: "ease-out" });
    const r = hc.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 24, 1.6);
    setTimeout(() => c.style.animationDuration = "", 1800);
  });
}

// Photo flips in 3D to show my details (click, tap, Enter or Space)
(function () {
  const f = $("#flipper"); if (!f) return;
  const back = $(".portrait-back", f), hint = $("#flipHint"); let touched = false;
  back.inert = true;
  const set = v => { f.classList.toggle("flipped", v); f.setAttribute("aria-pressed", String(v)); back.inert = !v; };
  const toggle = () => { touched = true; hint && hint.classList.add("gone"); set(!f.classList.contains("flipped")); };
  f.addEventListener("click", e => { if (!e.target.closest("a")) toggle(); });
  f.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === f) { e.preventDefault(); toggle(); } });
  // one-time preview so visitors discover it
  if (!reduce) setTimeout(() => { if (touched) return; set(true); setTimeout(() => { if (!touched) set(false); }, 4800); }, 6500);
})();

// Click a project screenshot to view it full size (Esc or click to close)
document.addEventListener("click", e => {
  const img = e.target.closest(".proj-img"); if (!img) return;
  const box = document.createElement("div"); box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", img.alt);
  const big = new Image(); big.src = img.src; big.alt = img.alt; box.appendChild(big); document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add("open"));
  const close = () => { box.classList.remove("open"); setTimeout(() => box.remove(), 350); document.removeEventListener("keydown", esc); };
  const esc = ev => ev.key === "Escape" && close();
  box.addEventListener("click", close); document.addEventListener("keydown", esc);
});
