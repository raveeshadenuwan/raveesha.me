const root = document.documentElement;
const menuBtn = document.getElementById("menu");
const links = document.getElementById("links");
const themeBtn = document.getElementById("theme");
if (themeBtn) {
  const label = () => themeBtn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  label();
  themeBtn.addEventListener("click", () => {
    const t = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#06193f" : "#f3f6fb";
    label(); dispatchEvent(new Event("scroll"));
  });
}
const card = document.querySelector(".skillcard");
if (card) {
  card.querySelectorAll(".chips span").forEach((s, i) => s.style.setProperty("--i", i));
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { card.classList.add("in"); o.disconnect(); } }), { threshold: .2 }).observe(card);
  } else card.classList.add("in");
}


menuBtn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  links.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));

document.getElementById("year").textContent = new Date().getFullYear();

const stage = document.getElementById("stage");
if (stage && matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const hero = document.getElementById("top");
  hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    stage.style.setProperty("--ry", x * 12 + "deg");
    stage.style.setProperty("--rx", -y * 10 + "deg");
  });
  hero.addEventListener("mouseleave", () => {
    stage.style.setProperty("--ry", "0deg");
    stage.style.setProperty("--rx", "0deg");
  });
}

// 3D network background: a slowly rotating sphere of linked nodes with data packets
const cv = document.getElementById("bg");
if (cv) {
  const ctx = cv.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dpr, mx = 0, my = 0, tx = 0, ty = 0;
  const nodes = [], edges = [], packets = [];
  for (let i = 0; i < 110; i++) {
    const u = Math.random() * 2 - 1, t = Math.random() * 6.2832, r = Math.sqrt(1 - u * u), d = .55 + Math.random() * .45;
    nodes.push({ x: r * Math.cos(t) * d, y: u * d, z: r * Math.sin(t) * d, hub: i % 11 === 0 });
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < .4) edges.push([i, j]);
  }
  for (let i = 0; i < 9; i++) packets.push({ e: Math.floor(Math.random() * edges.length), t: Math.random(), s: .004 + Math.random() * .006 });
  const ring = (tilt, rad) => Array.from({ length: 72 }, (_, k) => {
    const a = k / 72 * 6.2832, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    return { x, y: z * Math.sin(tilt), z: z * Math.cos(tilt) };
  });
  const rings = [ring(0, 1.12), ring(1.1, 1.2)];
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener("resize", () => { size(); if (still) frame(0); });
  addEventListener("mousemove", e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  size();
  function frame(time) {
    mx += (tx - mx) * .04; my += (ty - my) * .04;
    const dk = root.dataset.theme !== "light", rgb = getComputedStyle(root).getPropertyValue("--rgb").trim() || "46,230,166";
    const k = dk ? 1 : .75;
    const ry = time * .00005 + scrollY * .0007 + mx * .5, rx = .38 + my * .3 + scrollY * .0002;
    const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
    const S = Math.min(W, H) * .6, cx = W > 900 ? W * .68 : W * .5, cy = H * .48, f = 3;
    const proj = p => {
      const x1 = p.x * cy_ + p.z * sy_, z1 = -p.x * sy_ + p.z * cy_;
      const y2 = p.y * cx_ - z1 * sx_, z2 = p.y * sx_ + z1 * cx_, s = f / (f - z2);
      return { x: cx + x1 * S * s, y: cy + y2 * S * s, z: z2, s };
    };
    ctx.clearRect(0, 0, W, H);
    const P = nodes.map(proj);
    ctx.lineWidth = 1;
    rings.forEach(rg => {
      ctx.strokeStyle = `rgba(${rgb},${.16 * k})`; ctx.beginPath();
      rg.forEach((p, i) => { const q = proj(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      ctx.closePath(); ctx.stroke();
    });
    edges.forEach(([i, j]) => {
      const a = P[i], b = P[j], d = (a.z + b.z) / 2 * .5 + .5;
      ctx.strokeStyle = `rgba(${rgb},${(.05 + .2 * d) * k})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    P.forEach((p, i) => {
      const d = p.z * .5 + .5, r = (nodes[i].hub ? 3.4 : 1.8) * p.s;
      ctx.fillStyle = `rgba(${rgb},${(.25 + .6 * d) * k})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
      if (nodes[i].hub) { ctx.strokeStyle = `rgba(${rgb},${.35 * d * k})`; ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, 0, 6.2832); ctx.stroke(); }
    });
    if (!still) packets.forEach(pk => {
      pk.t += pk.s; if (pk.t > 1) { pk.t = 0; pk.e = Math.floor(Math.random() * edges.length); }
      const [i, j] = edges[pk.e], a = P[i], b = P[j];
      const x = a.x + (b.x - a.x) * pk.t, y = a.y + (b.y - a.y) * pk.t;
      ctx.fillStyle = `rgba(${rgb},${.95 * k})`; ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
    });
    if (!still && !document.hidden) requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !still) requestAnimationFrame(frame); });
  if (still) { frame(0); addEventListener("scroll", () => frame(0), { passive: true }); }
  else requestAnimationFrame(frame);
}

// Fingerprint lock screen
(function () {
  const lock = document.getElementById("lock"), fp = document.getElementById("fp"), sub = document.getElementById("lockSub");
  if (!lock || !fp) return;
  const quick = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const enter = () => {
    document.body.classList.remove("locked"); lock.classList.add("open");
    setTimeout(() => lock.remove(), 800);
  };
  let seen = false;
  try { seen = sessionStorage.getItem("unlocked") === "1"; } catch (e) {}
  if (seen) { document.body.classList.remove("locked"); lock.remove(); return; }
  fp.addEventListener("click", () => {
    if (lock.classList.contains("scanning")) return;
    lock.classList.add("scanning"); sub.textContent = "Scanning…";
    setTimeout(() => { lock.classList.add("ok"); sub.textContent = "Identity verified. Welcome."; }, quick ? 100 : 1300);
    setTimeout(() => { try { sessionStorage.setItem("unlocked", "1"); } catch (e) {} enter(); }, quick ? 400 : 2100);
  });
  fp.focus();
})();
