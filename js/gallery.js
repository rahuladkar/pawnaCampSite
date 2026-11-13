/* Photo grids (gallery page + package pages): optional category filter + full-screen viewer */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const grid = $("#galleryGrid");
  if (!grid) return;
  const items = $$(".g-item", grid);
  const chips = $$(".chip");
  const countEl = $("#shownCount");
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCap = $("#lbCap");
  let visible = items;
  let idx = 0;

  /* ---- Filter (gallery page only) ---- */
  function filter(cat) {
    items.forEach(it => { it.hidden = !(cat === "all" || it.dataset.cat === cat); });
    visible = items.filter(it => !it.hidden);
    chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.cat === cat)));
    if (countEl) countEl.textContent = visible.length;
    if (cat === "all") history.replaceState(null, "", location.pathname);
    else history.replaceState(null, "", "#" + cat);
  }
  if (chips.length) {
    chips.forEach(c => c.addEventListener("click", () => filter(c.dataset.cat)));
    const fromHash = location.hash.slice(1);
    if (chips.some(c => c.dataset.cat === fromHash)) filter(fromHash);
  }

  /* ---- Viewer ---- */
  function show(i) {
    idx = (i + visible.length) % visible.length;
    const it = visible[idx];
    lbImg.src = it.dataset.full;
    lbImg.alt = it.querySelector("img").alt;
    lbCap.textContent = `${it.dataset.label}  -  ${idx + 1} of ${visible.length}`;
  }
  function open(it) {
    show(visible.indexOf(it));
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
  }
  items.forEach(it => it.querySelector("button").addEventListener("click", () => open(it)));
  $(".lb-close").addEventListener("click", () => lb.close());
  $(".lb-prev").addEventListener("click", () => show(idx - 1));
  $(".lb-next").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  /* swipe on touch screens */
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
