/**
 * Playwright-based visual verification of the purple site served at
 * http://localhost:3000. Asserts: no console/page errors, all landing
 * sections present, purple tokens applied to key elements, fonts, glow
 * backdrop, scroll-reveal behavior, and footer year. Exits non-zero on
 * any failure and prints a concise PASS/FAIL list.
 */
import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL || "http://localhost:3000";
const failures = [];
const passes = [];

function check(name, condition, detail = "") {
  if (condition) passes.push(name);
  else failures.push(detail ? `${name} — ${detail}` : name);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });

// --- No runtime errors ---
check(
  "no console/page errors",
  consoleErrors.length === 0,
  consoleErrors.join(" | ")
);

// --- All landing sections rendered ---
const sections = ["#top", "#features", "#showcase", "#how", "#cta"];
for (const id of sections) {
  const count = await page.locator(id).count();
  check(`section ${id} present`, count === 1, `count=${count}`);
}

const cards = await page.locator(".card-grid .card").count();
check("6 feature cards", cards === 6, `found=${cards}`);

const steps = await page.locator("#how .step").count();
check("3 steps", steps === 3, `found=${steps}`);

const stats = await page.locator(".stat-row .stat").count();
check("4 stat cards", stats === 4, `found=${stats}`);

check(
  "header sticky",
  await page.locator("header.site-header").evaluate((el) => {
    const s = getComputedStyle(el);
    return s.position === "sticky" && s.top === "0px";
  })
);

check(
  "footer present with links",
  (await page.locator("footer.site-footer .footer-links a").count()) === 3
);

const year = await page.locator("footer.site-footer p").innerText();
check("footer year 2026", year.includes("2026"), year);

// --- Purple theme applied ---
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check(
  "body deep purple surface",
  bodyBg === "rgb(18, 7, 38)",
  `got=${bodyBg}`
);

const grad = await page.locator("h1 .gradient-text").evaluate(
  (el) => getComputedStyle(el).backgroundImage
);
check(
  "hero gradient headline",
  grad.includes("linear-gradient") && grad.includes("rgb(196, 181, 253)") && grad.includes("rgb(139, 92, 246)"),
  `got=${grad}`
);

const ctaBtn = await page.locator(".hero-actions .btn-primary").evaluate(
  (el) => getComputedStyle(el).backgroundImage
);
check(
  "primary CTA gradient button",
  ctaBtn.includes("linear-gradient") && ctaBtn.includes("rgb(139, 92, 246)") && ctaBtn.includes("rgb(82, 34, 138)"),
  `got=${ctaBtn}`
);

const iconBg = await page.locator(".card-icon").first().evaluate(
  (el) => getComputedStyle(el).backgroundImage
);
check(
  "card icon violet gradient",
  iconBg.includes("linear-gradient") &&
    iconBg.includes("rgba(139, 92, 246") &&
    iconBg.includes("rgba(76, 29, 149"),
  `got=${iconBg}`
);

const ctaBandBg = await page.locator(".cta-band").evaluate(
  (el) => getComputedStyle(el).backgroundImage
);
check(
  "CTA band violet gradient",
  ctaBandBg.includes("linear-gradient") && ctaBandBg.includes("rgb(59, 22, 104)") && ctaBandBg.includes("rgb(30, 10, 60)"),
  `got=${ctaBandBg}`
);

const panelBg = await page.locator(".showcase-panel").evaluate(
  (el) => getComputedStyle(el).backgroundImage
);
check(
  "code panel violet gradient",
  panelBg.includes("radial-gradient") && panelBg.includes("linear-gradient"),
  `got=${panelBg}`
);

check(
  "violet glow backdrop behind hero",
  await page.locator(".hero-glow").evaluate((el) => {
    const s = getComputedStyle(el);
    return (
      el.closest(".hero") !== null &&
      s.position === "absolute" &&
      s.backgroundImage.includes("radial-gradient") &&
      s.backgroundImage.includes("rgba(139, 92, 246") &&
      s.filter.includes("blur") &&
      s.zIndex === "-1"
    );
  })
);

// --- Fonts ---
const h1Font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
check(
  "display font on headings",
  h1Font.includes("Space Grotesk") && h1Font.includes("Inter"),
  `got=${h1Font}`
);
const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check(
  "body font",
  bodyFont.includes("Inter") && bodyFont.includes("system-ui"),
  `got=${bodyFont}`
);

// --- Scroll-reveal behavior (measure a deep below-fold element) ---
const ctaBand = page.locator(".cta-band.reveal");
const initialOpacity = await ctaBand.evaluate((el) => getComputedStyle(el).opacity);
await page.mouse.wheel(0, 20000);
await page.waitForTimeout(1200);
const afterOpacity = await ctaBand.evaluate((el) => getComputedStyle(el).opacity);
check(
  "scroll-reveal activates",
  parseFloat(initialOpacity) < 0.05 && parseFloat(afterOpacity) > 0.95,
  `before=${initialOpacity} after=${afterOpacity}`
);

// Screenshot for the record
await page.screenshot({ path: "verify-purple-site.png", fullPage: true });

// --- Mobile viewport: nav collapses, showcase stacks, no horizontal overflow ---
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
check(
  "mobile: primary nav hidden",
  await page.locator("nav.main-nav").isHidden()
);
check(
  "mobile: header CTAs still visible",
  await page.locator(".header-cta .btn-primary").isVisible()
);
check(
  "mobile: no horizontal overflow",
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1
  )
);
await page.locator("#showcase").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
check(
  "mobile: showcase columns stack",
  await page.locator(".showcase-inner").evaluate((el) => {
    const { display, gridTemplateColumns } = getComputedStyle(el);
    return display === "grid" && gridTemplateColumns.trim().split(" ").length === 1;
  })
);
await page.screenshot({ path: "verify-purple-site-mobile.png", fullPage: false });

await browser.close();

console.log(`PASS: ${passes.length}`);
console.log(passes.map((p) => `  ✓ ${p}`).join("\n"));
if (failures.length) {
  console.log(`FAIL: ${failures.length}`);
  console.log(failures.map((f) => `  ✗ ${f}`).join("\n"));
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
