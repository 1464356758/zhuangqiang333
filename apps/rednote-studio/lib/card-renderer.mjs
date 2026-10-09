import { THEMES } from "./content-engine.mjs";
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1440;
const FAMILY = '"Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export function wrapLines(ctx, text, width) {
  const lines = [];
  for (const p of String(text || "").split("\n")) {
    let line = "";
    for (const char of [...p]) {
      if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = char; } else line += char;
    }
    lines.push(line);
  }
  return lines;
}
function fit(ctx, value, width, height, start, min, weight = 400) {
  for (let size = start; size >= min; size -= 2) {
    ctx.font = weight + " " + size + "px " + FAMILY;
    const lines = wrapLines(ctx, value, width), lineHeight = Math.ceil(size * 1.55);
    if (lines.length * lineHeight <= height) return { size, lines, lineHeight };
  }
  throw new Error("图卡文字过多，请缩短文字或拆分为多页");
}
function single(ctx, value, width, start, min, weight, name) {
  const s = String(value || "").replace(/\n/g, " ");
  for (let size = start; size >= min; size--) {
    ctx.font = weight + " " + size + "px " + FAMILY;
    if (ctx.measureText(s).width <= width) return { text: s, size };
  }
  throw new Error(name + "过长，请缩短后导出");
}
export function drawCard(ctx, card, options = {}) {
  const t = THEMES.find(t => t.id === options.theme) || THEMES[0], index = Number(options.index) || 0, total = Number(options.total) || 1;
  const layout = options.layout || "editorial", brand = String(options.signature ?? "笺作");
  ctx.save();
  try {
  ctx.clearRect(0, 0, 1080, 1440); ctx.fillStyle = t.bg; ctx.fillRect(0, 0, 1080, 1440);
  ctx.fillStyle = t.accent; ctx.fillRect(64, 64, 8, 42);
  const kicker = single(ctx, card.kicker || "内容笔记", 730, 25, 18, 600, "眉题");
  ctx.fillStyle = t.ink; ctx.font = "600 " + kicker.size + "px " + FAMILY; ctx.fillText(kicker.text, 92, 95);
  ctx.font = "600 25px " + FAMILY;
  ctx.textAlign = "right"; ctx.fillText(String(index + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0"), 1016, 95); ctx.textAlign = "left";
  const titleY = layout === "poster" ? 224 : 192;
  const title = fit(ctx, card.title, 900, index === 0 ? 390 : 294, index === 0 ? 112 : 80, 44, 800);
  ctx.fillStyle = t.ink; ctx.font = "800 " + title.size + "px " + FAMILY;
  title.lines.forEach((line, i) => ctx.fillText(line, 80, titleY + i * title.lineHeight));
  const bodyY = Math.max(index === 0 ? 696 : 552, titleY + title.lines.length * title.lineHeight + 44);
  ctx.fillStyle = layout === "cards" ? t.soft : t.accent;
  if (layout === "cards") { ctx.beginPath(); ctx.roundRect(64, bodyY - 44, 952, 580, 28); ctx.fill(); }
  else ctx.fillRect(80, bodyY - 46, 96, 6);
  const body = fit(ctx, card.body, 864, 1200 - bodyY, index === 0 ? 40 : 44, 28);
  ctx.font = "400 " + body.size + "px " + FAMILY; ctx.fillStyle = t.ink;
  body.lines.forEach((line, i) => ctx.fillText(line, 96, bodyY + i * body.lineHeight));
  ctx.strokeStyle = t.ink; ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.moveTo(80, 1308); ctx.lineTo(1000, 1308); ctx.stroke(); ctx.globalAlpha = 1;
  const signed = single(ctx, brand, 450, 24, 18, 500, "署名");
  ctx.font = "500 " + signed.size + "px " + FAMILY;
  const signatureWidth = ctx.measureText(signed.text).width;
  const footer = single(ctx, card.foot || "发布前请核对素材", 880 - signatureWidth - (brand ? 48 : 0), 24, 18, 500, "页脚");
  ctx.fillStyle = t.ink; ctx.font = "500 " + footer.size + "px " + FAMILY; ctx.fillText(footer.text, 80, 1358);
  ctx.font = "500 " + signed.size + "px " + FAMILY; ctx.textAlign = "right"; ctx.fillText(signed.text, 1000, 1358);
  return { width: 1080, height: 1440, titleSize: title.size, bodySize: body.size };
  } finally { ctx.restore(); }
}
