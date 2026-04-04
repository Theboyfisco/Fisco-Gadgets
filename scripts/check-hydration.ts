import { chromium } from "playwright";

type Finding = {
  route: string;
  source: "console" | "pageerror" | "navigation";
  level: string;
  message: string;
};

const baseUrl = process.argv[2] ?? "http://localhost:3050";

const routes = [
  "/",
  "/about",
  "/contact",
  "/browse",
  "/search?q=iphone",
  "/category/phones",
  "/category/laptops",
  "/category/audio",
  "/brand/apple",
  "/brand/samsung",
  "/product/nothing-phone-2",
  "/wishlist",
  "/compare",
  "/checkout",
  "/checkout/success?reference=test_ref",
  "/shipping",
  "/returns",
  "/warranty",
  "/privacy",
  "/terms",
  "/account",
  "/account/login",
  "/account/register",
  "/account/profile",
  "/account/orders",
  "/admin/login",
  "/admin/setup",
  "/admin/products",
  "/admin/orders",
  "/admin/catalog",
  "/admin/promos",
  "/admin/audit",
];

const hydrationPattern =
  /hydration|did not match|expected server html|server html|text content does not match|hydrating/i;

function compactMessage(input: string) {
  return input.replace(/\s+/g, " ").trim().slice(0, 500);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const findings: Finding[] = [];

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    const routeFindings: Finding[] = [];

    const onConsole = (msg: any) => {
      const type = msg.type();
      if (!["error", "warning"].includes(type)) return;
      const text = compactMessage(msg.text());
      if (!text) return;
      if (!hydrationPattern.test(text) && type !== "error") return;
      routeFindings.push({
        route,
        source: "console",
        level: type,
        message: text,
      });
    };

    const onPageError = (err: Error) => {
      const text = compactMessage(err.message || String(err));
      routeFindings.push({
        route,
        source: "pageerror",
        level: "error",
        message: text,
      });
    };

    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(900);
    } catch (error) {
      routeFindings.push({
        route,
        source: "navigation",
        level: "error",
        message: compactMessage(String(error)),
      });
    } finally {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    }

    findings.push(...routeFindings);
    if (routeFindings.length === 0) {
      console.log(`OK ${route}`);
    } else {
      console.log(`ISSUES ${route} (${routeFindings.length})`);
    }
  }

  await browser.close();

  if (findings.length === 0) {
    console.log("\nNo hydration/page runtime issues found.");
    return;
  }

  console.log(`\nFound ${findings.length} issue(s):`);
  for (const finding of findings) {
    console.log(`[${finding.source}:${finding.level}] ${finding.route} -> ${finding.message}`);
  }

  const hydrationFindings = findings.filter((item) => hydrationPattern.test(item.message));
  if (hydrationFindings.length > 0) {
    process.exitCode = 2;
  } else {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

