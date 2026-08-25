import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const files = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "sw.js"];
for (const file of files) assert.ok(readFileSync(new URL(file, import.meta.url), "utf8").length > 20, `${file} should not be empty`);
const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", import.meta.url), "utf8"));
assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./");
const app = readFileSync(new URL("app.js", import.meta.url), "utf8");
for (const feature of ["Basic Strategy", "Card Count", "Speed Drill", "Statistics", "serviceWorker"]) assert.ok(app.includes(feature), `${feature} missing`);
assert.equal((app.match(/category:/g) || []).length, 40, "Expected 40 explained strategy rules");
assert.ok(app.includes("revealFeedback"), "Answer explanations should be revealed after each response");
console.log("Static PWA checks passed");
