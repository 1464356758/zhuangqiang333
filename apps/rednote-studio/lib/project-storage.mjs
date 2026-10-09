import { SAMPLE_BRIEF, normalizeDraft, THEMES } from "./content-engine.mjs";
export const STORAGE_KEY = "jianzhuo.project.v1";
export const LIBRARY_KEY = "jianzhuo.library.v1";
export function cleanProject(value) {
  if (!value || value.version !== 1 || !value.brief || !value.draft) throw new Error("不是笺作支持的备份文件");
  const brief = {};
  for (const [key, fallback] of Object.entries(SAMPLE_BRIEF)) {
    const item = value.brief[key];
    brief[key] = typeof fallback === "boolean" ? item === true : typeof item === "string" ? item.slice(0, 6000) : "";
  }
  const draft = normalizeDraft(value.draft);
  draft.origin = ["local", "ai", "imported", "edited"].includes(value.draft.origin) ? value.draft.origin : "imported";
  return {
    version: 1, brief, draft, theme: THEMES.some(t => t.id === value.theme) ? value.theme : "editorial",
    layout: ["editorial", "poster", "cards"].includes(value.layout) ? value.layout : "editorial",
    signature: typeof value.signature === "string" ? value.signature.slice(0, 20) : "笺作",
    example: value.example === true, updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}
export function serializeProject(value) { return JSON.stringify(cleanProject(value), null, 2); }
export function parseProject(raw) {
  if (typeof raw !== "string" || raw.length > 100000) throw new Error("备份文件过大或格式不正确");
  try { return cleanProject(JSON.parse(raw)); } catch (e) { throw new Error(e instanceof SyntaxError ? "备份不是有效JSON" : e.message); }
}
