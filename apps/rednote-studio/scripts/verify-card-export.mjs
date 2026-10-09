// Optional native export QA. Production exports use browser Canvas, with no native dependency.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { drawCard } from "../lib/card-renderer.mjs";
import { THEMES, generateDraft, SAMPLE_BRIEF, makeZip } from "../lib/content-engine.mjs";
const require = createRequire(import.meta.url);
const canvasPath = require.resolve("@napi-rs/canvas", { paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || process.cwd(), process.cwd()] });
const { createCanvas, GlobalFonts } = require(canvasPath);
mkdirSync("outputs", { recursive: true });
const hasCjk = existsSync("outputs/qa-font.ttf");
if (hasCjk) GlobalFonts.registerFromPath("outputs/qa-font.ttf", "Noto Sans CJK SC");
const draft = generateDraft(SAMPLE_BRIEF);
let rendered = 0;
for (const theme of THEMES) for (const layout of ["editorial", "poster", "cards"]) for (let i = 0; i < draft.cards.length; i++) {
  const c = createCanvas(1080, 1440), ctx = c.getContext("2d");
  const metrics = drawCard(ctx, draft.cards[i], { theme: theme.id, layout, index: i, total: draft.cards.length });
  assert.equal(metrics.width, 1080); assert.equal(metrics.height, 1440);
  assert.ok(metrics.titleSize >= 44); assert.ok(metrics.bodySize >= 28);
  const png = c.toBuffer("image/png");
  assert.equal(png.readUInt32BE(16), 1080); assert.equal(png.readUInt32BE(20), 1440);
  rendered++;
}
const sample = { kicker: "CONTENT STUDIO / 01", title: "A little more room.\nA lot less clutter.", body: "01 / Keep daily items within reach.\n\n02 / Give cables a clear route.\n\n03 / Leave space to work.", foot: "An editable content card" };
const c = createCanvas(1080, 1440), ctx = c.getContext("2d");
ctx.fillStyle = "#123456";
drawCard(ctx, sample, { theme: "editorial", index: 0, total: 3, signature: "JIANZUO" });
const png = c.toBuffer("image/png"); writeFileSync("outputs/export-sample.png", png);
ctx.fillRect(0, 0, 1, 1);
assert.deepEqual(Array.from(ctx.getImageData(0, 0, 1, 1).data), [18, 52, 86, 255]);
assert.throws(() => drawCard(ctx, { ...sample, body: "Too much text. ".repeat(1000) }, {}), /文字过多/);
ctx.fillRect(0, 0, 1, 1);
assert.deepEqual(Array.from(ctx.getImageData(0, 0, 1, 1).data), [18, 52, 86, 255]);
assert.throws(() => drawCard(ctx, { ...sample, foot: "Long footer ".repeat(100) }, {}), /页脚/);
const zip = makeZip([{ name: "01.png", data: png }, { name: "发布文案.txt", data: "真实可编辑图卡导出验证\n不是虚构交易或收入。" }]);
writeFileSync("outputs/export-validation.zip", zip);
const report = { nativeRenders: rendered, layouts: 3, themes: 4, png: "1080x1440", overflowRejected: true, footerOverflowRejected: true, contextRestored: true, chineseGlyphPixelReview: hasCjk ? "available" : "unverified", apiCalls: 0 };
writeFileSync("outputs/card-export-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
