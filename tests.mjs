import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const files = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "sw.js"];
for (const file of files) assert.ok(readFileSync(new URL(file, import.meta.url), "utf8").length > 20, `${file} should not be empty`);
const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", import.meta.url), "utf8"));
assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./");
const app = readFileSync(new URL("app.js", import.meta.url), "utf8");
for (const feature of ["Basic Strategy", "Card Count", "Speed Drill", "Statistics", "serviceWorker"]) assert.ok(app.includes(feature), `${feature} missing`);
assert.ok(app.includes("const STRATEGY_QUESTION_COUNT = 340"), "Expected 340 strategy questions");
assert.ok(app.includes("strategyScenarios.length !== STRATEGY_QUESTION_COUNT"), "Question bank should verify its generated size");
assert.ok(app.includes("revealFeedback"), "Answer explanations should be revealed after each response");
console.log("Static PWA checks passed");
