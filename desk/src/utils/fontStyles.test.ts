import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) =>
  readFileSync(resolve(here, path), "utf8");

test("Vazirmatn and ss01 are scoped to Persian, including SVG chart labels", () => {
  const css = readFileSync(resolve(here, "../index.css"), "utf8");
  const loginCss = readFileSync(
    resolve(here, "../../../helpdesk/public/css/persian-font.css"),
    "utf8"
  );

  assert.match(css, /html:lang\(fa\)\s*\{[^}]*font-family:\s*"Vazirmatn"/s);
  assert.match(css, /html:lang\(fa\)\s*\*\s*\{[^}]*font-feature-settings:\s*"ss01"/s);
  assert.match(css, /html:lang\(fa\)\s+svg\s+:is\(text,\s*tspan\)/);
  assert.doesNotMatch(css, /(?:^|\n)html\s*\{[^}]*font-family:\s*"Vazirmatn"/s);
  assert.match(loginCss, /html:lang\(fa\) body[\s\S]*?font-family:\s*"Vazirmatn"/);
  assert.doesNotMatch(loginCss, /(?:^|\n)html,\s*\n\s*body,\s*\n\s*button,/);
});

test("Helpdesk chart options do not force Vazirmatn in English", () => {
  for (const path of [
    "../components/ChartCardBase.vue",
    "../pages/dashboard/Dashboard.vue",
    "../pages/home/components/AvgTimeMetrics.vue",
    "../pages/home/components/RecentFeedback.vue",
  ]) {
    assert.doesNotMatch(read(path), /fontFamily\s*:\s*[`'\"]Vazirmatn/i, path);
  }

  const patch = readFileSync(
    resolve(here, "../../patches/frappe-ui+1.0.0-rc.1.patch"),
    "utf8"
  );
  assert.match(patch, /getComputedStyle\(document\.documentElement\)\.fontFamily/);
  assert.match(patch, /CHART_FONT_FAMILY = 'InterVar, Inter, sans-serif'/);
});
