/* =========================================================
   Rotaract Club of RiiT · Chhath Puja
   Vanilla JS. No dependencies.

   EDIT HERE: everything you are likely to change later lives
   in the CONFIG block directly below.
   ========================================================= */

const CONFIG = {
  // Background music. Just rename your downloaded file to  background-music.mp3
  // (.m4a / .ogg / .wav also work, same name) and put it in assets/audio/
  music: "assets/audio/background-music",
  audioExts: [".mp3", ".m4a", ".ogg", ".wav"],
  musicVolume: 0.7,

  // Allowed file types are tried in this order, so you can drop in
  // .mp4 / .webm / .mov videos and .webp / .jpg / .png images without touching code.
  videoExts: [".mp4", ".webm", ".mov"],
  imageExts: [".webp", ".jpg", ".jpeg", ".png"],

  // Preparation journey. Add, remove or reorder steps freely: the progress bar,
  // buttons and layout adapt automatically. `video` is the path WITHOUT extension.
  // Please re-check each title/text against your final clips.
  steps: [
    { title: "Preparing the Base",         text: "It all begins with flour poured from the packet into a big steel bowl.",        video: "assets/videos/preparation-step-01", poster: "assets/images/preparation/step-01" },
    { title: "Adding the Ingredients",     text: "Chopped dry mix-ins are scattered over the flour.",                             video: "assets/videos/preparation-step-02", poster: "assets/images/preparation/step-02" },
    { title: "Adding the Gur",             text: "Thick, dark gur (jaggery) goes in and is worked into the flour by hand.",       video: "assets/videos/preparation-step-03", poster: "assets/images/preparation/step-03" },
    { title: "Adding the Ghee",            text: "Ghee is poured from the jar over the flour and the mix-ins.",                   video: "assets/videos/preparation-step-04", poster: "assets/images/preparation/step-04" },
    { title: "Mixing Everything Together", text: "Everything is mixed together by hand until it is evenly combined.",             video: "assets/videos/preparation-step-05", poster: "assets/images/preparation/step-05" }
    // , { title: "Shaping the Thekua", text: "...", video: "assets/videos/preparation-step-06" }
  ],


  // Ingredient explorer (tap to reveal). Recipes vary from home to home.
  ingredients: [
    { name: "Atta",        img: "assets/images/ingredients/atta",     info: "Whole wheat flour is the heart of every Thekua. It gives the dough its earthy flavour and that satisfying crunch." },
    { name: "Gur / Sugar", img: "assets/images/ingredients/gur",      info: "Jaggery is the traditional sweetener, giving a deep caramel note. Many families dissolve it in water first, so the sweetness spreads evenly." },
    { name: "Ghee",        img: "assets/images/ingredients/ghee",     info: "A little ghee worked into the flour makes the Thekua crisp outside and crumbly inside. It also adds that unmistakable festive aroma." },
    { name: "Naariyal",    img: "assets/images/ingredients/naariyal", info: "Dry coconut, grated or sliced, adds little pockets of sweetness and a gentle chew." },
    { name: "Saunf",       img: "assets/images/ingredients/saunf",    info: "Fennel seeds bring a cool, lightly sweet fragrance that balances the jaggery." },
    { name: "Elaichi",     img: "assets/images/ingredients/elaichi",  info: "Crushed cardamom is the final perfume. One whiff and it smells like Chhath." }
  ],

  // Opening-screen messages after each bite
  hints: ["Tap to take a bite!", "Mmm, one more!", "Keep going…", "Almost there…", "Last bite!"]
};

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const debug = new URLSearchParams(location.search).has("debug"); // add ?debug to the URL to see expected file paths on placeholders
const hasExt = p => /\.[a-z0-9]{2,5}$/i.test(p);

function el(tag, attrs = {}, html = "") {
  const n = document.createElement(tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (html) n.innerHTML = html;
  return n;
}
function io(cb, opts) { // IntersectionObserver with a safe fallback
  if (!("IntersectionObserver" in window)) return { observe: t => cb([{ isIntersecting: true, target: t }], { unobserve() {} }), unobserve() {} };
  const o = new IntersectionObserver((es, ob) => cb(es, ob), opts);
  return o;
}
function scrollToEl(target) {
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/* ---------------------------------------------------------
   Toast
   --------------------------------------------------------- */
const toastEl = $("#toast");
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2800);
}

/* =========================================================
   1. OPENING : five-tap interactive Thekua
   ========================================================= */
const Opening = (() => {
  const root = $("#opening"), btn = $("#thekua-btn"), stack = $("#thekua-stack");
  const hint = $("#opening-hint"), crumbs = $("#crumbs"), dots = $("#bites");
  const site = $("#site");
  const files = ["thekua-original", "thekua-bite-1", "thekua-bite-2", "thekua-bite-3", "thekua-bite-4", "thekua-bite-5"];
  const TOTAL = 5;
  let taps = 0, busy = false, finished = false;

  // Site stays inert underneath until the intro ends
  site.setAttribute("inert", "");
  site.setAttribute("aria-hidden", "true");

  // Build image stack (stage 0 = whole Thekua, stage 5 = crumbs)
  const imgs = files.map((f, i) => {
    const im = new Image();
    im.src = `assets/images/${f}.webp`;
    im.alt = "";
    im.decoding = "async";
    im.draggable = false;
    if (i === 0) im.classList.add("is-on");
    stack.appendChild(im);
    return im;
  });
  for (let i = 0; i < TOTAL; i++) dots.appendChild(el("i"));

  // Per-bite crumb origin (percent of the Thekua box), roughly where each bite is
  const origins = [[78, 21], [20, 80], [19, 25], [77, 78], [49, 49]];

  function burst(stage) {
    if (reduceMotion || !crumbs.animate) return;
    const [ox, oy] = origins[stage] || [50, 50];
    const w = btn.clientWidth, h = btn.clientHeight;
    const n = stage === 4 ? 22 : 11;
    for (let i = 0; i < n; i++) {
      const c = el("span", { class: "crumb" });
      const s = 0.6 + Math.random() * 0.9;
      c.style.width = 9 * s + "px"; c.style.height = 7 * s + "px";
      c.style.background = ["#C98A42", "#B77430", "#E2B877", "#A0601F"][i % 4];
      c.style.left = (ox / 100) * w + "px"; c.style.top = (oy / 100) * h + "px";
      crumbs.appendChild(c);
      const dx = (Math.random() - 0.5) * (stage === 4 ? 260 : 150);
      const dy = 40 + Math.random() * (stage === 4 ? 220 : 120);
      const rot = (Math.random() - 0.5) * 540;
      const a = c.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-30 - Math.random() * 30}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: 800 + Math.random() * 500, easing: "cubic-bezier(.3,.6,.4,1)" });
      a.onfinish = () => c.remove();
    }
  }

  function setHint(text) {
    hint.classList.add("swap");
    hint.style.opacity = 0;
    setTimeout(() => { hint.textContent = text; hint.style.opacity = ""; hint.classList.remove("swap"); }, 180);
  }

  function onTap() {
    if (busy || finished) return;
    busy = true;
    taps++;
    if (navigator.vibrate) { try { navigator.vibrate(taps === TOTAL ? [18, 40, 28] : 14); } catch (e) {} }
    Music.firstGesture(); // browsers only allow sound after a tap; this is that tap

    const prev = imgs[taps - 1], next = imgs[taps];
    prev.classList.remove("is-on"); prev.classList.add("is-off");
    next.classList.add("is-on");
    setTimeout(() => prev.classList.remove("is-off"), 400);

    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
    btn.classList.add("is-busy");
    burst(taps - 1);
    btn.setAttribute("aria-label", `Thekua. Bite ${taps} of ${TOTAL}${taps < TOTAL ? ". Tap for another bite." : ""}`);
    $$("i", dots).forEach((d, i) => d.classList.toggle("is-done", i < taps));

    if (taps < TOTAL) {
      setHint(CONFIG.hints[taps] || "");
      setTimeout(() => { busy = false; }, 520); // lock prevents accidental double taps
    } else {
      btn.classList.add("final");
      setHint("Wah! Swaad aa gaya.");
      setTimeout(finish, 1500);
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    root.classList.add("is-leaving");
    document.documentElement.classList.remove("locked");
    site.removeAttribute("inert");
    site.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);
    Site.reveal();
    Music.showButton();
    setTimeout(() => root.remove(), 1400);
  }

  btn.addEventListener("click", onTap);
  $("#skip-intro").addEventListener("click", () => { Music.firstGesture(); finish(); });
  return { finish };
})();

/* =========================================================
   2. SITE: reveal, scroll effects, split text
   ========================================================= */
const Site = (() => {
  // Split hero headline into words for staggered reveal
  const h1 = $("#hero-title");
  const text = h1.textContent.trim();
  h1.setAttribute("aria-label", text);
  h1.innerHTML = text.split(" ").map((w, i) =>
    `<span class="word" aria-hidden="true"><span style="--i:${i}">${w}</span></span> `).join("");
  $$("[data-hero]").forEach((n, i) => n.style.setProperty("--i", 900 + i * 260));

  // Hero scene: the SVG is pulled inline so its entrance (sun rises, light fades in, people walk in)
  // can start exactly when the intro ends. Mobile gets a portrait version so nobody is cropped.
  const sceneHost = $("#hero-scene"), mq = matchMedia("(max-width: 899px)");
  let sceneFile = "", live = false, liveAt = 0;
  function loadScene() {
    const f = mq.matches ? "ghat-scene-mobile.svg" : "ghat-scene.svg";
    if (f === sceneFile) return;
    sceneFile = f;
    fetch("assets/illustrations/" + f).then(r => (r.ok ? r.text() : Promise.reject())).then(t => {
      if (f !== sceneFile) return;
      sceneHost.innerHTML = t;
      const svg = $("svg", sceneHost); if (!svg) return;
      svg.removeAttribute("width"); svg.removeAttribute("height");
      svg.setAttribute("aria-label", sceneHost.dataset.alt || "");
      if (!reduceMotion) svg.classList.add(!live ? "s-pre" : (Date.now() - liveAt < 5000 ? "s-go" : "s-done"));
    }).catch(() => {}); // if it cannot load, the plain <img> stays
  }
  loadScene();
  (mq.addEventListener ? mq.addEventListener("change", loadScene) : mq.addListener(loadScene));

  function reveal() {
    const hero = $("#hero");
    live = true; liveAt = Date.now();
    const svg = $("svg", sceneHost);
    if (svg && svg.classList.contains("s-pre")) { svg.classList.remove("s-pre"); svg.classList.add("s-go"); }
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-live")));
  }

  // Scroll reveals
  const ro = io((es, ob) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); ob.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(n => ro.observe(n));

  // Smooth-scroll anchors
  $$("[data-scroll]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    scrollToEl($(a.getAttribute("href")));
  }));
  $("#back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Scroll progress hairline
  const bar = $("#scrollbar");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
      ticking = false;
    });
  }, { passive: true });

  return { reveal };
})();

/* =========================================================
   3. MEDIA: photos and videos that degrade to placeholders
   ========================================================= */
const PH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';

function tryLoad(base, exts, onOk, onFail) {
  const list = hasExt(base) ? [""] : exts;
  let i = 0;
  (function next() {
    if (i >= list.length) return onFail && onFail();
    const im = new Image();
    im.onload = () => onOk(im, base + list[i - 1]);
    im.onerror = next;
    im.decoding = "async";
    im.src = base + list[i++];
  })();
}

function initSlot(slot) {
  const base = slot.dataset.img, label = slot.dataset.label || "Photo";
  const ph = el("div", { class: "slot__ph" }, `${PH_ICON}<b></b><small>Photo coming soon</small>${debug ? "<code></code>" : ""}`);
  $("b", ph).textContent = label;
  if (debug) $("code", ph).textContent = base + ".webp|.jpg|.png";
  slot.appendChild(ph);
  const loader = io((es, ob) => es.forEach(e => {
    if (!e.isIntersecting) return;
    ob.unobserve(e.target);
    tryLoad(base, CONFIG.imageExts, (im, src) => {
      const img = el("img", { src, alt: slot.dataset.alt || label, loading: "lazy", decoding: "async" });
      slot.appendChild(img);
      slot.classList.add("has-img");
    });
  }), { rootMargin: "300px" });
  loader.observe(slot);
}

/* Video stage: placeholder first, real <video> only when needed */
function initVideoStage(stage, opts = {}) {
  const base = stage.dataset.video, label = stage.dataset.label || "Video";
  const ph = el("div", { class: "vstage__ph" });
  ph.innerHTML = `<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><b></b><small>Video coming soon</small>${debug ? "<code></code>" : ""}`;
  $("b", ph).textContent = label;
  if (debug) $("code", ph).textContent = base + ".mp4";
  stage.appendChild(ph);
  if (stage.dataset.ar) stage.style.setProperty("--ar", stage.dataset.ar);

  const silent = !!opts.muted || stage.hasAttribute("data-muted"); // cooking + distribution clips play without sound
  let state = "idle"; // idle | loading | ready | missing
  let video = null;

  // optional poster photo behind the placeholder
  if (opts.poster) tryLoad(opts.poster, CONFIG.imageExts, (im, src) => {
    ph.style.cssText += `background-image:url("${src}");background-size:cover;background-position:center`;
    ph.classList.add("has-poster");
  });

  function load() {
    if (state !== "idle") return;
    state = "loading";
    stage.classList.add("is-loading");
    const exts = hasExt(base) ? [""] : CONFIG.videoExts;
    let i = 0;
    video = el("video", { controls: "", playsinline: "", preload: "metadata", "aria-label": label });
    if (silent) { video.muted = true; video.defaultMuted = true; video.setAttribute("muted", ""); } // silent clip: the music keeps playing
    video.setAttribute("webkit-playsinline", "");
    const fail = () => {
      if (i < exts.length) { video.src = base + exts[i++]; video.load(); return; }
      state = "missing"; stage.classList.remove("is-loading");
      video.remove();
    };
    video.addEventListener("error", fail);
    video.addEventListener("loadedmetadata", () => {
      state = "ready"; stage.classList.remove("is-loading");
      // keep the clip's real aspect ratio (clamped so it never gets silly)
      if (video.videoWidth && video.videoHeight) {
        const r = Math.min(2.4, Math.max(0.5, video.videoWidth / video.videoHeight));
        stage.style.setProperty("--ar", r.toFixed(4));
      }
      stage.classList.add("has-video");
      stage.dispatchEvent(new CustomEvent("videoready"));
    }, { once: true });
    stage.appendChild(video);
    fail();
  }
  stage.loadVideo = load;
  stage.getVideo = () => (state === "ready" ? video : null);

  if (!opts.manual) {
    const o = io((es, ob) => es.forEach(e => { if (e.isIntersecting) { ob.unobserve(e.target); load(); } }), { rootMargin: "500px" });
    o.observe(stage);
  }
  return stage;
}

$$(".slot[data-img]").forEach(initSlot);

/* =========================================================
   4. MUSIC: floating control + automatic ducking for videos
   ========================================================= */
const Music = (() => {
  const wrap = $("#music"), btn = $("#music-btn"), volBtn = $("#music-vol-btn"), panel = $("#music-panel"), vol = $("#music-vol");
  const audio = new Audio();
  audio.loop = true; audio.preload = "none";
  let aExt = 0;
  audio.src = CONFIG.music + CONFIG.audioExts[aExt];
  let userVol = CONFIG.musicVolume, wantOn = false, missing = false, ducked = false, fadeT;
  vol.value = Math.round(userVol * 100);
  audio.addEventListener("error", () => {
    if (++aExt < CONFIG.audioExts.length) { audio.src = CONFIG.music + CONFIG.audioExts[aExt]; if (wantOn) audio.play().catch(() => {}); return; }
    missing = true; wantOn = false; sync();
  });

  function sync() {
    const on = wantOn && !missing;
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
  }
  function fadeTo(target, ms = 700, done) {
    clearInterval(fadeT);
    const from = audio.volume, steps = Math.max(1, ms / 40);
    let n = 0;
    fadeT = setInterval(() => {
      n++;
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * (n / steps)));
      if (n >= steps) { clearInterval(fadeT); done && done(); }
    }, 40);
  }
  function play() {
    if (missing) { toast("Music coming soon: add assets/audio/background-music.mp3"); return; }
    wantOn = true; sync();
    if (ducked) return; // will resume when the video stops
    audio.volume = 0;
    audio.play().then(() => fadeTo(userVol, 900)).catch(() => { wantOn = false; sync(); if (!missing) toast("Tap the music button to start the music"); });
  }
  function pause() {
    wantOn = false; sync();
    fadeTo(0, 400, () => audio.pause());
  }

  btn.addEventListener("click", () => (wantOn ? pause() : play()));
  volBtn.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    volBtn.setAttribute("aria-expanded", String(open));
  });
  vol.addEventListener("input", () => {
    userVol = vol.value / 100;
    if (!ducked && !audio.paused) { clearInterval(fadeT); audio.volume = userVol; }
  });

  // Ducking: any <video> playing quiets the music; it comes back when playback pauses or ends
  const playing = new Set();
  const audible = v => !v.muted && v.volume > 0;
  function onVideo(e) {
    if (!(e.target instanceof HTMLVideoElement)) return;
    if (e.type === "play" || e.type === "playing") playing.add(e.target);
    else if (e.type !== "volumechange") playing.delete(e.target);
    const shouldDuck = [...playing].some(audible); // muted clips never lower the music
    if (shouldDuck === ducked) return;
    ducked = shouldDuck;
    if (ducked) {
      if (!audio.paused) fadeTo(0, 500, () => { if (ducked) audio.pause(); });
    } else if (wantOn && !missing) {
      audio.play().then(() => fadeTo(userVol, 1200)).catch(() => {});
    }
  }
  ["play", "playing", "pause", "ended", "emptied", "volumechange"].forEach(t => document.addEventListener(t, onVideo, true));

  document.addEventListener("visibilitychange", () => { // don't keep playing in a hidden tab
    if (document.hidden && !audio.paused) audio.pause();
    else if (!document.hidden && wantOn && !ducked && !missing) audio.play().catch(() => {});
  });

  return {
    firstGesture() { if (!wantOn && !missing && !Music._tried) { Music._tried = true; play(); } },
    showButton() { wrap.hidden = false; requestAnimationFrame(() => wrap.classList.add("is-in")); }
  };
})();

/* =========================================================
   5. PREPARATION JOURNEY
   ========================================================= */
const Journey = (() => {
  const steps = CONFIG.steps, N = steps.length;
  const panelsEl = $("#panels"), nodesEl = $("#stepper-nodes"), fill = $("#stepper-fill");
  const count = $("#step-count"), prev = $("#prev-step"), next = $("#next-step"), nextLabel = $("#next-label");
  const done = $("#journey-done"), card = $("#journey-card"), stepper = $("#stepper");
  let cur = 0, finished = false, near = false;

  const pad = n => String(n).padStart(2, "0");

  steps.forEach((s, i) => {
    const node = el("button", { class: "node", type: "button", role: "tab", "aria-label": `Step ${i + 1}: ${s.title}`, "aria-selected": "false" }, String(i + 1));
    node.addEventListener("click", () => go(i));
    nodesEl.appendChild(node);

    const panel = el("article", { class: "panel", id: `step-${i + 1}`, role: "tabpanel", "aria-label": `Step ${i + 1}: ${s.title}` });
    panel.innerHTML = `
      <div class="panel__media">
        <div class="vstage vstage--step" data-video="${s.video}" data-label="Preparation Step ${i + 1}" data-ar="4/5"></div>
        <button class="btn btn--ghost panel__replay" type="button" aria-label="Replay step ${i + 1} video">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Replay clip
        </button>
      </div>
      <div class="panel__body">
        <div class="panel__num" aria-hidden="true">${pad(i + 1)}</div>
        <p class="eyebrow">Step ${pad(i + 1)}</p>
        <h3></h3>
        <p class="panel__text"></p>
      </div>`;
    $("h3", panel).textContent = s.title;
    $(".panel__text", panel).textContent = s.text;
    const stage = $(".vstage", panel);
    initVideoStage(stage, { manual: true, poster: s.poster, muted: true });
    const rp = $(".panel__replay", panel);
    rp.disabled = true;
    stage.addEventListener("videoready", () => { rp.disabled = false; });
    rp.addEventListener("click", () => {
      const v = stage.getVideo(); if (!v) return;
      v.currentTime = 0; v.play().catch(() => {});
    });
    panel._stage = stage;
    panelsEl.appendChild(panel);
  });

  const panels = $$(".panel", panelsEl), nodes = $$(".node", nodesEl);

  function pauseAll() { panels.forEach(p => { const v = p._stage.getVideo(); if (v && !v.paused) v.pause(); }); }

  function go(i, opts = {}) {
    i = Math.max(0, Math.min(N - 1, i));
    const dir = i >= cur ? "from-right" : "from-left";
    pauseAll();
    if (!done.hidden) { done.hidden = true; done.classList.remove("is-on"); panelsEl.hidden = false; stepper.hidden = false; count.hidden = false; $(".journey__nav", card).hidden = false; }
    panels.forEach((p, k) => {
      p.classList.remove("from-left", "from-right");
      const on = k === i;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
      if (on) { void p.offsetWidth; p.classList.add(dir); }
    });
    nodes.forEach((n, k) => {
      n.classList.toggle("is-active", k === i);
      n.classList.toggle("is-done", k < i);
      n.setAttribute("aria-selected", String(k === i));
      n.tabIndex = k === i ? 0 : -1;
    });
    fill.style.width = (N > 1 ? (i / (N - 1)) * 100 : 100) + "%";
    count.textContent = `Step ${i + 1} of ${N}`;
    prev.disabled = i === 0;
    nextLabel.textContent = i === N - 1 ? "Finish" : "Next Step";
    cur = i;
    if (near) { // only fetch clip metadata once the journey is close to the screen
      panels[i]._stage.loadVideo();
      if (panels[i + 1]) panels[i + 1]._stage.loadVideo(); // warm up the next clip's metadata only
    }
    if (opts.scroll) scrollToEl(card);
  }

  function finish() {
    pauseAll();
    finished = true;
    nodes.forEach(n => { n.classList.remove("is-active"); n.classList.add("is-done"); });
    fill.style.width = "100%";
    count.textContent = `All ${N} steps complete`;
    panelsEl.hidden = true; $(".journey__nav", card).hidden = true;
    done.hidden = false; void done.offsetWidth; done.classList.add("is-on");
    celebrate();
    scrollToEl(card);
  }

  function celebrate() {
    const box = $("#burst");
    box.innerHTML = "";
    if (reduceMotion || !box.animate) return;
    const cols = ["#D49A45", "#8E302B", "#65715A", "#E2B877"];
    for (let i = 0; i < 34; i++) {
      const p = el("span", { class: "petal" });
      p.style.background = cols[i % cols.length];
      box.appendChild(p);
      const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
      const x = Math.cos(ang) * dist * (innerWidth < 600 ? .9 : 1.5), y = Math.sin(ang) * dist - 40;
      const a = p.animate([
        { transform: "translate(0,0) rotate(0) scale(.3)", opacity: 0 },
        { transform: `translate(${x * .7}px,${y * .7}px) rotate(${Math.random() * 300}deg) scale(1)`, opacity: 1, offset: .35 },
        { transform: `translate(${x}px,${y + 140}px) rotate(${Math.random() * 600}deg) scale(.8)`, opacity: 0 }
      ], { duration: 1700 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.3,1)", delay: Math.random() * 250 });
      a.onfinish = () => p.remove();
    }
  }

  prev.addEventListener("click", () => go(cur - 1));
  next.addEventListener("click", () => (cur === N - 1 ? finish() : go(cur + 1)));
  $("#restart-steps").addEventListener("click", () => { finished = false; go(0, { scroll: true }); });
  nodesEl.addEventListener("keydown", e => { // arrow-key support for the stepper
    if (e.key === "ArrowRight") { go(cur + 1); nodes[cur].focus(); }
    if (e.key === "ArrowLeft")  { go(cur - 1); nodes[cur].focus(); }
  });

  go(0);
  const nearObs = io((es, ob) => es.forEach(e => {
    if (e.isIntersecting) { near = true; ob.unobserve(e.target); go(cur); }
  }), { rootMargin: "400px" });
  nearObs.observe(card);

  return { go };
})();

/* Ingredient explorer */
(() => {
  const chips = $("#ing-chips"), info = $("#ing-info");
  CONFIG.ingredients.forEach(ing => {
    const b = el("button", { class: "ing", type: "button", role: "tab", "aria-selected": "false" }, "");
    b.textContent = ing.name;
    b.addEventListener("click", () => {
      $$(".ing", chips).forEach(c => c.setAttribute("aria-selected", String(c === b)));
      info.className = "ingredients__info"; void info.offsetWidth; info.classList.add("swap", "has-item");
      info.innerHTML = "";
      const photo = el("div", { class: "slot ing-photo", "data-img": ing.img, "data-label": ing.name, "data-alt": ing.name });
      const txt = el("div", {}, "<h4></h4><p></p>");
      $("h4", txt).textContent = ing.name;
      $("p", txt).textContent = ing.info;
      info.append(photo, txt);
      initSlot(photo);
    });
    chips.appendChild(b);
  });
})();

/* Photo credits (Creative Commons photos need attribution): read from assets/images/credits.json */
fetch("assets/images/credits.json").then(r => r.ok ? r.json() : null).then(list => {
  if (!list) return;
  const ul = $("#credits-list");
  Object.entries(list).forEach(([key, c]) => {
    $$(`[data-credit="${key}"]`).forEach(n => { n.textContent = `Photo: ${c.author} · ${c.license}`; });
    const li = el("li");
    const a = el("a", { href: c.page, target: "_blank", rel: "noopener" });
    a.textContent = c.title;
    li.append(a, document.createTextNode(` by ${c.author}, ${c.license}`));
    ul.appendChild(li);
  });
  $("#credits").hidden = false;
}).catch(() => {});

/* Other video stages: the distribution clip and the club message (auto-load when near screen) */
$$(".vstage[data-video]:not(.vstage--step)").forEach(s => initVideoStage(s));
