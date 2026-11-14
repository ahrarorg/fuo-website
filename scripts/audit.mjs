import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.env.AUDIT_URL ?? "http://localhost:3100";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = new URL("../audit/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
fs.mkdirSync(OUT, { recursive: true });

const report = { consoleErrors: [], pageErrors: [], failedRequests: [], checks: [], metrics: {} };
const ok = (name, pass, detail = "") => {
  report.checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

// Software WebGL (SwiftShader) can stall the CDP capture; freeze CSS animation
// for a stable frame and never let one slow screenshot abort the whole audit.
async function shot(pg, name, opts = {}) {
  try {
    await pg.screenshot({ path: OUT + name, animations: "disabled", timeout: 20000, ...opts });
  } catch (e) {
    console.log(`WARN  screenshot ${name} skipped — ${String(e).split("\n")[0].slice(0, 90)}`);
  }
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});

function watch(page, tag) {
  page.on("console", (m) => {
    if (m.type() === "error") report.consoleErrors.push(`[${tag}] ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => report.pageErrors.push(`[${tag}] ${String(e).slice(0, 300)}`));
  page.on("requestfailed", (r) => {
    // Next.js cancels in-flight RSC prefetches on navigation; not an app error.
    if (r.url().includes("_rsc=") && r.failure()?.errorText === "net::ERR_ABORTED") return;
    report.failedRequests.push(`[${tag}] ${r.url()} ${r.failure()?.errorText}`);
  });
}

const metricsInit = () => {
  window.__metrics = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__metrics.lcp = e.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (!e.hadRecentInput) window.__metrics.cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
};

// ---------- Desktop ----------
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await desktop.addInitScript(metricsInit);
const page = await desktop.newPage();
watch(page, "desktop");

await page.goto(`${BASE}/fa`, { waitUntil: "load" });
await page.waitForFunction(() => sessionStorage.getItem("fuo-loaded") === "1", null, { timeout: 15000 });
await page.waitForTimeout(2600);
ok("loader completes", true);
ok("webgl canvas mounted", await page.locator("canvas").count() > 0);
await shot(page, "01-hero-desktop.png");

const panel = page.getByRole("group", { name: "ابزار رصدخانه" });
ok("instrument panel visible", await panel.isVisible());
const speedInput = page.locator("input[aria-label='سرعت مدار']");
const speedReadout = page.locator("label").filter({ has: speedInput }).locator("span.num");
await speedInput.evaluate((el) => {
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  set.call(el, "1.8");
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.waitForTimeout(200);
ok("speed slider live readout", (await speedReadout.textContent()) === "1.80", await speedReadout.textContent());
const spinBtn = page.getByRole("button", { name: "چرخش خودکار" });
await spinBtn.click();
const spinOff = (await spinBtn.getAttribute("aria-pressed")) === "false";
await spinBtn.click();
ok("spin toggle flips", spinOff && (await spinBtn.getAttribute("aria-pressed")) === "true");
await page.locator("select[aria-label='چگالی ذرات']").selectOption("2");
await page.waitForTimeout(400);
ok("density select applies", (await page.locator("select[aria-label='چگالی ذرات']").inputValue()) === "2");
await page.getByRole("button", { name: "تصادفی", exact: true }).click();
await page.waitForTimeout(200);
ok("randomize changes params", (await speedReadout.textContent()) !== "1.80");
await page.getByRole("button", { name: "بازنشانی", exact: true }).click();
await page.waitForTimeout(200);
ok("reset restores defaults", (await speedReadout.textContent()) === "1.00");
const pngDl = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
await page.getByRole("button", { name: "خروجی PNG" }).click();
const png = await pngDl;
ok("scene export downloads PNG", !!png && png.suggestedFilename() === "fuo-astrolabe.png", png?.suggestedFilename() ?? "");
await page.locator("select[aria-label='چگالی ذرات']").selectOption("1");

await page.evaluate(() => window.scrollTo(0, 1000));
await page.waitForTimeout(1400);
const overlayVisible = await page.evaluate(() => {
  const els = [...document.querySelectorAll("div")].filter((d) => typeof d.className === "string" && d.className.includes("z-10 overflow-y-auto"));
  return els.some((d) => getComputedStyle(d).visibility === "visible" && parseFloat(getComputedStyle(d).opacity) > 0.2);
});
ok("scroll narrative reveals department overlay", overlayVisible);
await shot(page, "02-exploded-desktop.png");

const firstDept = page.locator("ul a[href$='/programs#talent']").first();
await firstDept.hover();
await page.waitForTimeout(500);
const readout = await page.evaluate(() => document.querySelector("[aria-live='polite']")?.textContent ?? "");
ok("hover focus readout updates", readout.includes("استعداد"), readout.slice(0, 40));
await firstDept.click();
await page.waitForURL("**/programs#talent");
ok("orbit list click navigates to programs anchor", page.url().includes("/programs#talent"));
await page.waitForTimeout(900);
await shot(page, "03-programs-desktop.png");

await page.goto(`${BASE}/fa/news`, { waitUntil: "load" });
await page.waitForTimeout(600);
const totalCards = await page.locator("article").count();
await page.fill("input[type='search']", "صلح");
await page.waitForTimeout(400);
const searchCards = await page.locator("article").count();
ok("news search filters", searchCards < totalCards && searchCards >= 1, `${totalCards} -> ${searchCards}`);
await page.fill("input[type='search']", "");
await page.getByRole("button", { name: "فناوری", exact: true }).click();
await page.waitForTimeout(400);
const catCards = await page.locator("article").count();
ok("news category filter", catCards === 1, `${catCards} card(s)`);
await shot(page, "04-news-desktop.png");

await page.goto(`${BASE}/fa/news/ai-fellowship-2026`, { waitUntil: "load" });
await page.waitForTimeout(600);
ok("article page renders", (await page.locator("h1").count()) === 1);
await shot(page, "05-article-desktop.png");

await page.goto(`${BASE}/fa/impact`, { waitUntil: "load" });
await page.waitForTimeout(1800);
const dl = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
await page.getByRole("button", { name: /CSV/ }).click();
const download = await dl;
ok("impact CSV export downloads", !!download, download?.suggestedFilename() ?? "");
await shot(page, "06-impact-desktop.png");

await page.goto(`${BASE}/fa/join?orbit=technology`, { waitUntil: "load" });
await page.waitForTimeout(700);
const preselected = await page.locator("button[aria-pressed='true']", { hasText: "فناوری" }).count();
ok("join orbit preselect from query", preselected >= 1);
await page.getByRole("button", { name: "ثبت عضویت" }).click();
await page.waitForTimeout(300);
const errCount = await page.locator("p.text-danger").count();
ok("join validation blocks empty submit", errCount >= 3, `${errCount} errors`);
await page.fill("#join-name", "آزمون کاربر");
await page.fill("#join-email", "test@example.com");
await page.fill("#join-city", "تهران، ایران");
await page.getByRole("button", { name: "ثبت عضویت" }).click();
await page.waitForSelector("[role='status']", { timeout: 8000 });
ok("join membership success state", true);
const stored = await page.evaluate(() => localStorage.getItem("fuo-membership"));
ok("join demo persists locally", !!stored && stored.includes("technology"));
await shot(page, "07-join-success-desktop.png");

await page.getByRole("button", { name: "حمایت", exact: true }).click();
await page.waitForTimeout(500);
await page.fill("#support-email", "donor@example.com");
await page.getByRole("button", { name: /ثبت حمایت/ }).click();
await page.waitForSelector("[role='status']", { timeout: 8000 });
ok("join support success state", true);

await page.goto(`${BASE}/fa/contact`, { waitUntil: "load" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: "ارسال پیام" }).click();
await page.waitForTimeout(300);
ok("contact validation blocks empty submit", (await page.locator("p.text-danger").count()) === 4);
await page.fill("#contact-name", "آزمون");
await page.fill("#contact-email", "bad-email");
await page.fill("#contact-subject", "همکاری");
await page.fill("#contact-message", "سلام");
await page.getByRole("button", { name: "ارسال پیام" }).click();
await page.waitForTimeout(300);
ok("contact rejects invalid email", (await page.locator("p.text-danger").count()) === 1);
await page.fill("#contact-email", "test@example.com");
await page.getByRole("button", { name: "ارسال پیام" }).click();
await page.waitForSelector("[role='status']", { timeout: 8000 });
ok("contact success state", true);

await page.goto(`${BASE}/fa`, { waitUntil: "load" });
await page.waitForFunction(() => sessionStorage.getItem("fuo-loaded") === "1");
await page.getByRole("button", { name: "English" }).click();
await page.waitForURL("**/en");
await page.waitForTimeout(900);
ok("locale switch to en", page.url().endsWith("/en"));
ok("en is LTR", (await page.evaluate(() => document.documentElement.dir)) === "ltr");
await shot(page, "08-hero-en-desktop.png");

const sound = page.getByRole("button", { name: /Turn sound|sound/i }).first();
await sound.click();
ok("sound toggle presses", (await sound.getAttribute("aria-pressed")) === "true");
await sound.click();

report.metrics.desktop = await page.evaluate(() => window.__metrics);
await desktop.close();

// ---------- Mobile ----------
const mobile = await browser.newContext({
  viewport: { width: 360, height: 740 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
await mobile.addInitScript(metricsInit);
const mpage = await mobile.newPage();
watch(mpage, "mobile");
await mpage.goto(`${BASE}/fa`, { waitUntil: "load" });
await mpage.waitForFunction(() => sessionStorage.getItem("fuo-loaded") === "1", null, { timeout: 15000 });
await mpage.waitForTimeout(2600);
const mOverflow = await mpage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok("mobile home no horizontal overflow", mOverflow <= 0, `${mOverflow}px`);
ok("mobile instrument panel visible", await mpage.getByRole("group", { name: "ابزار رصدخانه" }).isVisible());
ok("mobile first paint uses SVG fallback (no canvas yet)", (await mpage.locator("canvas").count()) === 0);
report.metrics.mobile = await mpage.evaluate(() => window.__metrics);
await shot(mpage, "09-hero-mobile.png");
await mpage.getByRole("button", { name: "گشودن منو" }).click();
await mpage.waitForTimeout(600);
await shot(mpage, "10-menu-mobile.png");
ok("mobile menu opens", await mpage.locator("#mobile-menu").isVisible());
await mpage.keyboard.press("Escape");
await mpage.waitForTimeout(400);
ok("mobile menu closes on Esc", !(await mpage.locator("#mobile-menu").isVisible().catch(() => false)));

for (const path of ["/fa/programs", "/fa/join", "/fa/impact", "/fa/news", "/fa/contact", "/fa/about", "/fa/mission"]) {
  await mpage.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await mpage.waitForTimeout(700);
  const ov = await mpage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`mobile ${path} no horizontal overflow`, ov <= 0, `${ov}px`);
}
await mpage.goto(`${BASE}/fa/join`, { waitUntil: "domcontentloaded" });
await mpage.waitForTimeout(700);
await shot(mpage, "11-join-mobile.png", { fullPage: false });

// Progressive enhancement: verify the touch→WebGL upgrade LAST and in isolation
// so the software-GL scene can't stall the checks above. Real tap, generous poll.
await mpage.goto(`${BASE}/fa`, { waitUntil: "domcontentloaded" });
await mpage.waitForFunction(() => sessionStorage.getItem("fuo-loaded") === "1", null, { timeout: 15000 });
await mpage.waitForTimeout(900);
await mpage.touchscreen.tap(180, 160).catch(() => {});
let upgraded = false;
try {
  await mpage.waitForSelector("canvas", { timeout: 12000 });
  upgraded = true;
} catch {}
ok("mobile upgrades to WebGL on first interaction", upgraded);
if (upgraded) {
  await mpage.waitForTimeout(1800);
  await shot(mpage, "13-mobile-webgl.png");
}
await mpage.goto("about:blank").catch(() => {});
await mobile.close();

// ---------- Reduced motion ----------
const reduced = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const rpage = await reduced.newPage();
watch(rpage, "reduced");
await rpage.goto(`${BASE}/fa`, { waitUntil: "load" });
await rpage.waitForTimeout(1200);
ok("reduced motion: no loader", (await rpage.locator("[role='status']").count()) === 0);
ok("reduced motion: svg fallback, no canvas", (await rpage.locator("canvas").count()) === 0 && (await rpage.locator("svg[role='img']").count()) >= 1);
ok("reduced motion: instrument panel hidden", (await rpage.getByRole("group", { name: "ابزار رصدخانه" }).count()) === 0);
await shot(rpage, "12-reduced-motion.png");
await reduced.close();

await browser.close();

fs.writeFileSync(OUT + "report.json", JSON.stringify(report, null, 2));
const fails = report.checks.filter((c) => !c.pass);
console.log(`\n${report.checks.length - fails.length}/${report.checks.length} checks passed`);
console.log("console errors:", report.consoleErrors.length, report.consoleErrors.slice(0, 6));
console.log("page errors:", report.pageErrors.length, report.pageErrors.slice(0, 6));
console.log("failed requests:", report.failedRequests.length, report.failedRequests.slice(0, 6));
console.log("metrics:", JSON.stringify(report.metrics));
process.exit(fails.length || report.pageErrors.length ? 1 : 0);