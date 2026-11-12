const root = document.documentElement;
const $ = s => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Welcome splash (once per session)
(function () {
  const w = $("#welcome"); if (!w) return;
  if (!root.classList.contains("intro-on")) { w.remove(); return; }
  setTimeout(() => w.classList.add("hide"), reduce ? 600 : 2800);
  setTimeout(() => { root.classList.remove("intro-on"); w.remove(); try { sessionStorage.setItem("welcomed", "1"); } catch (e) {} }, reduce ? 1300 : 3600);
})();

// Slide-in menu
const menuBtn = $("#menu"), drawer = $("#links"), scrim = $("#scrim"), closeBtn = $("#close");
const setMenu = open => {
  drawer.classList.toggle("open", open); scrim.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) closeBtn.focus(); else if (drawer.contains(document.activeElement)) menuBtn.focus();
};
menuBtn.addEventListener("click", () => setMenu(!drawer.classList.contains("open")));
closeBtn.addEventListener("click", () => setMenu(false));
scrim.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) setMenu(false); });
drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

// Theme
const themeBtn = $("#theme");
const syncTheme = () => {
  const dark = root.dataset.theme === "dark";
  themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  $(".tlabel").textContent = dark ? "Light mode" : "Dark mode";
  const m = $('meta[name="theme-color"]'); if (m) m.content = dark ? "#0e1218" : "#ededed";
};
syncTheme();
themeBtn.addEventListener("click", () => {
  const t = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = t; try { localStorage.setItem("theme", t); } catch (e) {}
  syncTheme();
});
$("#year").textContent = new Date().getFullYear();

// Skills card: chips pop in
const card = $(".skillcard");
if (card) {
  card.querySelectorAll(".chips span").forEach((s, i) => s.style.setProperty("--i", i));
  if ("IntersectionObserver" in window && !reduce) {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { card.classList.add("in"); o.disconnect(); } }), { threshold: .2 }).observe(card);
  } else card.classList.add("in");
}

// Project filter
const tabs = document.querySelectorAll(".ptab"), cards = document.querySelectorAll("#items li");
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.setAttribute("aria-pressed", String(x === t)));
  cards.forEach(c => { c.hidden = !(t.dataset.f === "all" || c.dataset.cat.split(" ").includes(t.dataset.f)); });
}));

// Contact form: opens the visitor's email app with the message filled in
const form = $("#msgForm");
form.addEventListener("submit", e => {
  e.preventDefault();
  const d = new FormData(form);
  const subject = d.get("subject") || "Message from your portfolio";
  const body = d.get("message") + "\n\nFrom: " + d.get("name") + " <" + d.get("email") + ">";
  location.href = "mailto:raveeshadenuwan@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
});

// 3D network in the hero band: rotating sphere of linked nodes with data packets
(function () {
  const cv = $("#net"); if (!cv) return;
  const ctx = cv.getContext("2d"), band = cv.parentElement, rgb = "46,224,140";
  let W, H, visible = true;
  const nodes = [], edges = [], packets = [];
  for (let i = 0; i < 100; i++) {
    const u = Math.random() * 2 - 1, t = Math.random() * 6.2832, r = Math.sqrt(1 - u * u), d = .55 + Math.random() * .45;
    nodes.push({ x: r * Math.cos(t) * d, y: u * d, z: r * Math.sin(t) * d, hub: i % 11 === 0 });
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < .42) edges.push([i, j]);
  }
  for (let i = 0; i < 8; i++) packets.push({ e: Math.floor(Math.random() * edges.length), t: Math.random(), s: .004 + Math.random() * .006 });
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = band.clientWidth; H = band.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size(); addEventListener("resize", () => { size(); if (reduce) frame(0); });
  function frame(time) {
    const ry = time * .00005, rx = .4, cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
    const S = Math.min(W * .45, H * .95), cx = W / 2, cy = H / 2, f = 3;
    const P = nodes.map(p => {
      const x1 = p.x * cyy + p.z * syy, z1 = -p.x * syy + p.z * cyy, y2 = p.y * cxx - z1 * sxx, z2 = p.y * sxx + z1 * cxx, s = f / (f - z2);
      return { x: cx + x1 * S * s, y: cy + y2 * S * s, z: z2, s };
    });
    ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1;
    edges.forEach(([i, j]) => { const a = P[i], b = P[j], d = (a.z + b.z) / 2 * .5 + .5; ctx.strokeStyle = `rgba(${rgb},${.06 + .24 * d})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    P.forEach((p, i) => { const d = p.z * .5 + .5, r = (nodes[i].hub ? 3.2 : 1.7) * p.s; ctx.fillStyle = `rgba(${rgb},${.3 + .6 * d})`; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill(); });
    if (!reduce) packets.forEach(pk => {
      pk.t += pk.s; if (pk.t > 1) { pk.t = 0; pk.e = Math.floor(Math.random() * edges.length); }
      const [i, j] = edges[pk.e], a = P[i], b = P[j];
      ctx.fillStyle = `rgba(${rgb},.95)`; ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * pk.t, a.y + (b.y - a.y) * pk.t, 2.2, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
    });
    if (!reduce && visible && !document.hidden) requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !visible && !reduce) requestAnimationFrame(frame); visible = v; }).observe(band);
  reduce ? frame(0) : requestAnimationFrame(frame);
})();

// Scroll progress bar
(function () {
  const bar = $("#progress");
  const on = () => { const h = root.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%"; };
  addEventListener("scroll", on, { passive: true }); on();
})();

// Scroll reveal and count-up numbers
(function () {
  const els = document.querySelectorAll(".st,.card,.stats>div,.skillcard,.tl-cap,.tcard,.tabs,.items li,.snake,.intro-p,.more");
  const count = el => {
    const n = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
  };
  if (reduce || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    const b = e.target.querySelector("[data-count]"); if (b) count(b);
  }), { threshold: .12, rootMargin: "0px 0px -5% 0px" });
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.matches(".stats>div,.items li,.tcard"));
    el.style.setProperty("--d", (sibs.indexOf(el) > -1 ? sibs.indexOf(el) % 6 * .08 : 0) + "s");
    el.classList.add("rv"); io.observe(el);
  });
})();

// Cursor spotlight and subtle 3D tilt on cards
if (matchMedia("(pointer: fine)").matches && !reduce) {
  document.querySelectorAll(".card,.stats>div,.tcard,.items li").forEach(c => {
    const tilt = c.matches(".items li");
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
      if (tilt) { c.style.setProperty("--ry", (x / r.width - .5) * 7 + "deg"); c.style.setProperty("--rx", (.5 - y / r.height) * 7 + "deg"); }
    });
    c.addEventListener("mouseleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  });
}

// Role text types and changes
(function () {
  const el = $("#role"); if (!el || reduce) return;
  const base = el.textContent, words = [base, "Network Defense Learner", "Ethical Hacking Learner"];
  el.setAttribute("aria-label", base);
  let w = 0, c = base.length, del = false;
  el.classList.add("typing");
  (function tick() {
    const word = words[w]; el.textContent = word.slice(0, c);
    let wait = del ? 28 : 65;
    if (!del && c === word.length) { del = true; wait = 2200; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
    else c += del ? -1 : 1;
    setTimeout(tick, wait);
  })();
})();

// Hero terminal types its lines
(async function () {
  const out = $("#termOut"); if (!out) return;
  const lines = [["whoami", "raveesha"], ["cat focus.txt", "SOC analysis, network defense"], ["ls projects/", "login  vault  phishing  scanner"], ["status", "open to internships 2026-27"]];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let html = "";
  const draw = (extra = "") => { out.innerHTML = html + extra + '<span class="cur"></span>'; };
  if (reduce) { out.innerHTML = lines.map(([c, o]) => `<span class="p">$</span> ${c}\n<span class="o">${o}</span>`).join("\n"); return; }
  await sleep(root.classList.contains("intro-on") ? 3800 : 600);
  for (const [c, o] of lines) {
    let typed = "";
    for (const ch of c) { typed += ch; draw(`<span class="p">$</span> ${typed}`); await sleep(55); }
    html += `<span class="p">$</span> ${c}\n`; draw(); await sleep(260);
    html += `<span class="o">${o}</span>\n`; draw(); await sleep(520);
  }
})();
