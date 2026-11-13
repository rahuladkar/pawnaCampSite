/* ===== Pawna Lake Camping: frontend only, no backend needed ===== */

/* >>> EDIT HERE: your number and prices <<< */
const CONFIG = {
  whatsappNumber: "919545873420",     // country code + number, no + or spaces
  displayNumber: "+91 95458 73420",
  advancePercent: 40,
  packages: {
    tent:     { name: "Tent Package",          price: 900 },
    triangle: { name: "Triangle Tent Package", price: 1200 },
    cottage:  { name: "Cottage Package",       price: 1800 }
  }
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const waLink = text => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

  /* ---- Header: solid after scroll, mobile menu (used on every page) ---- */
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  const alwaysSolid = header.classList.contains("solid");
  const onScroll = () => { if (!alwaysSolid) header.classList.toggle("solid", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---- Plain WhatsApp links (contact + mobile bar) ---- */
  $$("a[data-wa]").forEach(a => {
    a.href = waLink("Hi! I'd like to know about Pawna Lake camping.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---- Quote calculator (home page only) ---- */
  const form = $("#quoteForm");
  if (!form) return;

  const pkg = $("#pkg");
  const adults = $("#adults");
  const kids = $("#kids");
  const dateEl = $("#date");
  if (document.body.dataset.pkg && CONFIG.packages[document.body.dataset.pkg]) pkg.value = document.body.dataset.pkg;
  const err = $("#formError");

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateEl.min = iso(new Date());

  const clampInt = (el, min) => {
    let v = parseInt(el.value, 10);
    if (isNaN(v) || v < min) v = min;
    if (v > 100) v = 100;
    el.value = v;
    return v;
  };

  function calc() {
    const p = CONFIG.packages[pkg.value];
    const a = clampInt(adults, 1);
    const k = clampInt(kids, 0);
    const adultAmt = a * p.price;
    const kidAmt = k * (p.price / 2);
    const total = adultAmt + kidAmt;
    const advance = Math.round(total * CONFIG.advancePercent / 100);
    return { p, a, k, adultAmt, kidAmt, total, advance, balance: total - advance };
  }

  function render() {
    const c = calc();
    $("#sumAdults").textContent = `${c.a} adult${c.a > 1 ? "s" : ""} × ${inr(c.p.price)}`;
    $("#sumAdultsAmt").textContent = inr(c.adultAmt);
    $("#kidsRow").hidden = c.k === 0;
    $("#sumKids").textContent = `${c.k} child${c.k > 1 ? "ren" : ""} × ${inr(c.p.price / 2)}`;
    $("#sumKidsAmt").textContent = inr(c.kidAmt);
    $("#sumTotal").textContent = inr(c.total);
    $("#sumAdv").textContent = inr(c.advance);
    $("#sumBal").textContent = inr(c.balance);
  }

  [pkg, adults, kids].forEach(el => el.addEventListener("input", render));
  $$(".stepper button").forEach(b => b.addEventListener("click", () => {
    const input = document.getElementById(b.dataset.for);
    input.value = (parseInt(input.value, 10) || 0) + Number(b.dataset.step);
    render();
  }));

  /* "Get quote for this" buttons on package cards pre-select the package */
  $$("[data-pick]").forEach(a => a.addEventListener("click", () => {
    pkg.value = a.dataset.pick;
    render();
  }));

  function showErr(msg, field) {
    err.textContent = msg;
    err.hidden = false;
    field.focus();
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) return showErr("Enter your name so we know who to reply to.", form.elements.name);
    if (!dateEl.value) return showErr("Pick your check-in date.", dateEl);
    err.hidden = true;

    const c = calc();
    const d = new Date(dateEl.value + "T00:00:00");
    const dateText = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    const lines = [
      "Hi! I'd like a quote for Pawna Lake Camping.",
      "",
      `Name: ${name}`,
      `Package: ${c.p.name} (${inr(c.p.price)} per person)`,
      `Check-in: ${dateText}`,
      `Adults: ${c.a}`,
      `Children above 5 yrs: ${c.k}`,
      `Food: ${form.elements.food.value}`,
      "",
      `Estimated total: ${inr(c.total)}`,
      `Advance (${CONFIG.advancePercent}%): ${inr(c.advance)}`,
      `Balance at check-in: ${inr(c.balance)}`,
      "",
      "Please confirm availability."
    ];
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  /* ---- Copy number ---- */
  const copyBtn = $("#copyNum");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.displayNumber.replace(/\s/g, ""));
      copyBtn.textContent = "Number copied";
    } catch (_) {
      copyBtn.textContent = CONFIG.displayNumber;
    }
    setTimeout(() => (copyBtn.textContent = "Copy number"), 2200);
  });

  render();
})();
