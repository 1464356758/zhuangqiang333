"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronDown, Copy, FileText, FolderOpen, Image as ImageIcon, Layers, LoaderCircle, Plus, RotateCcw, Settings2, ShieldCheck, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { SAMPLE_BRIEF, NICHES, FORMATS, TONES, GOALS, THEMES, generateDraft, suggestAngles, analyzeDraft, buildPrompt, parseImported, normalizeDraft, publishText, tagList, countChars, makeZip, validateBrief } from "@/lib/content-engine.mjs";
import { drawCard, CARD_WIDTH, CARD_HEIGHT } from "@/lib/card-renderer.mjs";
import { STORAGE_KEY, LIBRARY_KEY, cleanProject, serializeProject, parseProject } from "@/lib/project-storage.mjs";

type Brief = typeof SAMPLE_BRIEF;
type Card = { kicker: string; title: string; body: string; foot: string };
type Draft = { title: string; titles: string[]; body: string; tags: string[]; cards: Card[]; reviewNotes: string[]; origin: string };
type Project = { version: number; brief: Brief; draft: Draft; theme: string; layout: string; signature: string; example: boolean; updatedAt: string };
type Snapshot = { id: string; name: string; project: Project };
type Usage = { prompt_tokens: number | null; completion_tokens: number | null; total_tokens: number | null };
type ToolContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => void | Promise<void> };

function initialProject(): Project {
  return { version: 1, brief: { ...SAMPLE_BRIEF }, draft: generateDraft(SAMPLE_BRIEF) as Draft, theme: "editorial", layout: "editorial", signature: "笺作", example: true, updatedAt: "" };
}
function message(error: unknown) { return error instanceof Error ? error.message : "操作未完成，请重试"; }
function downloadFile(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function safeName(value: string) { return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "").slice(0, 28) || "小红书图文"; }

function CardCanvas({ card, project, index, mini = false }: { card: Card; project: Project; index: number; mini?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = canvas.current, context = element?.getContext("2d");
    if (!element || !context) { setError("当前浏览器不支持图卡绘制，请换用系统浏览器"); return; }
    let active = true;
    const render = () => {
      if (!active) return;
      element.width = CARD_WIDTH; element.height = CARD_HEIGHT;
      try { drawCard(context, card, { theme: project.theme, layout: project.layout, signature: project.signature, index, total: project.draft.cards.length }); setError(""); }
      catch (e) { setError(message(e)); }
    };
    render();
    void document.fonts.ready.then(render);
    return () => { active = false; };
  }, [card, project.theme, project.layout, project.signature, project.draft.cards.length, index]);
  return <div className={"card-canvas " + (mini ? "mini-canvas" : "")}>
    <canvas ref={canvas} width={CARD_WIDTH} height={CARD_HEIGHT} role="img" aria-label={"第" + (index + 1) + "页图卡：" + card.title} />
    {error && <div className="canvas-error" role="alert"><ImageIcon size={24} /><span>{mini ? "文字过多" : error}</span></div>}
  </div>;
}
function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger className="control"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></label>;
}
function TextField({ label, value, onChange, maxLength, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; maxLength: number; placeholder?: string; rows?: number }) {
  return <label className="field"><span>{label}</span>{rows ? <Textarea className="control" value={value} maxLength={maxLength} rows={rows} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <Input className="control" value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}</label>;
}
function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [raw, setRaw] = useState(tags.join(", "));
  const [focused, setFocused] = useState(false);
  const joined = tags.join(", ");
  useEffect(() => { if (!focused) setRaw(joined); }, [joined, focused]);
  return <label className="field"><span>相关话题</span><Input className="control" value={raw} maxLength={240} placeholder="逗号分隔，不要填无关热词" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={e => { setRaw(e.target.value); onChange(tagList(e.target.value)); }} /></label>;
}

export default function Home() {
  const [project, setProject] = useState<Project>(initialProject);
  const latest = useRef(project);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState("正在打开");
  const [tab, setTab] = useState("copy");
  const [mobileStep, setMobileStep] = useState("edit");
  const [selected, setSelected] = useState(0);
  const [modal, setModal] = useState<null | "settings" | "import" | "library" | "help" | "reset" | "copy">(null);
  const [importText, setImportText] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-flash");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = useRef<AbortController | null>(null);
  const { brief, draft } = project;
  const analysis = useMemo(() => analyzeDraft(draft, brief), [draft, brief]);
  const angles = useMemo(() => { try { return suggestAngles(brief); } catch { return []; } }, [brief]);
  const update = useCallback((recipe: (p: Project) => Project) => {
    const next = recipe(latest.current); next.updatedAt = new Date().toISOString(); latest.current = next; setProject(next);
  }, []);
  const setBrief = <K extends keyof Brief>(key: K, value: Brief[K]) => update(p => ({ ...p, example: false, brief: { ...p.brief, [key]: value } }));
  const editDraft = (value: Partial<Draft>) => update(p => ({ ...p, draft: { ...p.draft, ...value, origin: "edited" } }));
  const editCard = (key: keyof Card, value: string) => update(p => ({ ...p, draft: { ...p.draft, origin: "edited", cards: p.draft.cards.map((c, i) => i === selected ? { ...c, [key]: value } : c) } }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const restored = parseProject(raw) as Project; latest.current = restored; setProject(restored); }
      const library = localStorage.getItem(LIBRARY_KEY);
      if (library) {
        const parsed = JSON.parse(library);
        if (Array.isArray(parsed)) setSnapshots(parsed.slice(0, 10).flatMap(s => { try { return [{ id: String(s.id).slice(0, 60), name: String(s.name).slice(0, 60), project: cleanProject(s.project) as Project }]; } catch { return []; } }));
      }
      setSaveState("已保存在本机");
    } catch { setSaveState("本机保存不可用"); toast.warning("没有恢复本机草稿。请用备份文件保留内容。"); }
    setReady(true);
    return () => pending.current?.abort();
  }, []);
  useEffect(() => {
    if (!ready) return;
    setSaveState("保存中");
    const timer = window.setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, serializeProject(project)); setSaveState("已保存在本机"); } catch { setSaveState("保存失败，请导出备份"); } }, 700);
    return () => window.clearTimeout(timer);
  }, [project, ready]);
  useEffect(() => { setSelected(i => Math.min(i, draft.cards.length - 1)); }, [draft.cards.length]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ToolContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Parameters<ToolContext["registerTool"]>[0]) => {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Ordinary editor remains usable in unsupported browsers. */ }
    };
    register({ name: "read_content_draft", title: "读取当前稿件", description: "读取当前可编辑稿件和检查结果，不读取模型密钥。", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute(input) {
      if (!input || typeof input !== "object" || Object.keys(input).length) throw new Error("该工具不接受参数");
      const p = latest.current; return { title: p.draft.title, body: p.draft.body, tags: p.draft.tags, cards: p.draft.cards, origin: p.draft.origin, checks: analyzeDraft(p.draft, p.brief) };
    } });
    register({ name: "generate_local_content_draft", title: "依据素材生成本地稿", description: "使用当前素材覆盖编辑器稿件，不联网、不调用付费模型。返回更新后的文案；发布前需人工核对。", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute(input) {
      if (!input || typeof input !== "object" || Object.keys(input).length) throw new Error("该工具不接受参数");
      if (pending.current) throw new Error("请等待或取消当前AI请求");
      const next = generateDraft(latest.current.brief) as Draft;
      flushSync(() => { update(p => ({ ...p, draft: next })); setSelected(0); setTab("copy"); setMobileStep("edit"); });
      return { title: latest.current.draft.title, body: latest.current.draft.body, cardCount: latest.current.draft.cards.length, origin: "local" };
    } });
    return () => lifecycle.abort();
  }, [update]);

  async function copy(value: string) {
    try { if (!navigator.clipboard) throw new Error("clipboard"); await navigator.clipboard.writeText(value); toast.success("已复制"); }
    catch { setCopyFallback(value); setModal("copy"); }
  }
  function localGenerate() {
    try { const next = generateDraft(brief) as Draft; update(p => ({ ...p, draft: next })); setSelected(0); setTab("copy"); setMobileStep("edit"); setApiError(""); setUsage(null); toast.success("已整理成稿，请继续编辑和核对"); }
    catch (e) { toast.error(message(e)); setMobileStep("brief"); }
  }
  async function aiGenerate() {
    if (!apiKey) { setModal("settings"); return; }
    try { validateBrief(brief); } catch (e) { toast.error(message(e)); setMobileStep("brief"); return; }
    const revision = latest.current.updatedAt;
    const controller = new AbortController(); pending.current = controller; setBusy(true); setApiError("");
    const timer = window.setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ apiKey, model, brief }) });
      const result = await response.json() as { error?: string; draft?: unknown; usage?: Usage };
      if (!response.ok) throw new Error(result.error || "模型生成未完成");
      const validated = normalizeDraft(result.draft) as Draft;
      if (controller.signal.aborted) throw new Error("生成已取消");
      setUsage(result.usage || null);
      if (latest.current.updatedAt !== revision) {
        setImportText(JSON.stringify(validated, null, 2)); setModal("import");
        toast("生成期间你修改了内容，原稿保留。可在导入窗口确认采用新稿。"); return;
      }
      update(p => ({ ...p, draft: { ...validated, origin: "ai" } })); setSelected(0); setTab("copy"); setMobileStep("edit");
      toast.success("AI稿件已生成，请核对事实后发布");
    } catch (e) { const error = controller.signal.aborted ? "生成已取消或超时，原稿保留。请求发出后，模型平台可能仍计费。" : message(e); setApiError(error); toast.error(error); }
    finally { window.clearTimeout(timer); pending.current = null; setBusy(false); }
  }
  async function cardBytes(card: Card, index: number) {
    await document.fonts.ready;
    const canvas = document.createElement("canvas"); canvas.width = CARD_WIDTH; canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("当前浏览器不支持图卡导出");
    drawCard(ctx, card, { theme: project.theme, layout: project.layout, signature: project.signature, index, total: draft.cards.length });
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("生成图片失败，请重试")), "image/png"));
    return new Uint8Array(await blob.arrayBuffer());
  }
  async function exportBundle(imagesOnly = false) {
    setExporting(true);
    try {
      const validated = normalizeDraft(draft) as Draft;
      const files: { name: string; data: string | Uint8Array }[] = [];
      for (let i = 0; i < validated.cards.length; i++) files.push({ name: String(i + 1).padStart(2, "0") + ".png", data: await cardBytes(validated.cards[i], i) });
      if (!imagesOnly) {
        files.push({ name: "发布文案.txt", data: publishText(validated) });
        files.push({ name: "可编辑备份.json", data: serializeProject(project) });
        files.push({ name: "发布检查.txt", data: "笺作发布检查（规则提示，不等于事实认证）\n\n" + analysis.issues.map(i => i.label + "：" + i.detail).join("\n") + "\n\n编辑复核项\n" + draft.reviewNotes.join("\n") });
        files.push({ name: "使用说明.txt", data: "图卡为1080×1440 PNG，按编号上传。\n复制发布文案.txt中的标题、正文和话题到小红书。\n逐项核对事实、版权和商业合作标识后，手动发布。\n可编辑备份.json可以在笺作的草稿菜单中导入恢复。\nAI密钥不包含在导出包中；素材与来源可能包含私人信息，请自行保管。" });
      }
      const bytes = makeZip(files); downloadFile(bytes.buffer as ArrayBuffer, safeName(draft.title) + (imagesOnly ? "-图卡.zip" : "-发布包.zip"), "application/zip");
      toast.success("发布包已生成，请在浏览器下载列表查看");
    } catch (e) { toast.error(message(e)); } finally { setExporting(false); }
  }
  async function exportSingle() {
    setExporting(true);
    try { const bytes = await cardBytes(draft.cards[selected], selected); downloadFile(bytes.buffer as ArrayBuffer, safeName(draft.title) + "-" + (selected + 1) + ".png", "image/png"); toast.success("高清图卡已导出"); }
    catch (e) { toast.error(message(e)); } finally { setExporting(false); }
  }
  function persistLibrary(next: Snapshot[]) {
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(next)); setSnapshots(next); return true; } catch { toast.error("本机空间不足，请先导出备份"); return false; }
  }
  function saveSnapshot() {
    try {
      const name = (snapshotName.trim() || draft.title).slice(0, 60);
      const next = [{ id: crypto.randomUUID(), name, project: cleanProject(project) as Project }, ...snapshots].slice(0, 10);
      if (persistLibrary(next)) { setSnapshotName(""); toast.success("已保存草稿版本（最多10个）"); }
    } catch (e) { toast.error(message(e)); }
  }
  async function importBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > 300000) throw new Error("备份文件过大");
      const restored = parseProject(await file.text()) as Project;
      update(() => restored); setSelected(0); setTab("copy"); setMobileStep("edit"); setModal(null); toast.success("备份已恢复");
    } catch (e) { toast.error(message(e)); }
    if (fileInput.current) fileInput.current.value = "";
  }
  function reset() {
    pending.current?.abort(); setApiKey(""); setUsage(null); setApiError(""); setSnapshots([]);
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LIBRARY_KEY); } catch {}
    const p = initialProject(); p.example = false; p.brief = { ...SAMPLE_BRIEF, topic: "", audience: "", pain: "", facts: "", conclusion: "", keywords: "", source: "", brand: "" };
    p.draft = { title: "新笔记", titles: [], body: "在素材区填写具体内容，再点击「本地成稿」或「AI 精修」。", tags: [], cards: [{ kicker: "新笔记", title: "你的内容标题", body: "图卡文字会在这里出现。", foot: "依据真实素材创作" }], reviewNotes: [], origin: "local" };
    update(() => p); setSelected(0); setMobileStep("brief"); setModal(null); toast.success("已清空本机素材与模型密钥");
  }
  const current = draft.cards[selected] || draft.cards[0];
  return <div className="studio">
    <a href="#editor" className="skip-link">跳到稿件编辑</a>
    <header className="appbar">
      <a className="brand" href="/" aria-label="笺作首页"><span className="brand-mark">笺</span><span>笺作<small>小红书内容工作台</small></span></a>
      <div className="appbar-actions"><span className="save-indicator"><span />{saveState}</span><Button variant="ghost" className="touch" onClick={() => setModal("library")}><FolderOpen /><span>草稿</span></Button><Button variant="outline" className="touch" onClick={() => setModal("settings")}><Settings2 /><span>AI 连接</span><i className={apiKey ? "connected" : "disconnected"} /></Button><Button variant="ghost" className="touch help-button" onClick={() => setModal("help")}>使用指南</Button></div>
    </header>
    <main className="workbench">
      <div className="workspace-heading"><div><div className="eyebrow">CONTENT STUDIO / 01</div><h1>把素材，写成一篇好笔记。</h1><p>从具体事实开始，让文案和每一张图卡都能继续打磨。</p></div><Button className="touch export-top" onClick={() => exportBundle()} disabled={exporting || busy}>{exporting ? <LoaderCircle className="spin" /> : <ArrowDownToLine />}导出发布包</Button></div>
      <nav className="mobile-flow" aria-label="编辑步骤"><Button variant={mobileStep === "brief" ? "default" : "ghost"} onClick={() => setMobileStep("brief")}>01 填写素材</Button><Button variant={mobileStep === "edit" ? "default" : "ghost"} onClick={() => setMobileStep("edit")}>02 编辑与导出</Button></nav>
      <div className="workspace-grid">
        <aside className={"brief-panel panel " + (mobileStep !== "brief" ? "mobile-hidden" : "")}>
          <div className="panel-heading"><div><span className="section-number">01</span><h2>创作素材</h2></div><Button variant="ghost" className="touch small-utility" onClick={() => setModal("reset")} aria-label="新建并清空当前内容"><Plus size={18} />新建</Button></div>
          <div className="brief-content">
            {project.example && <div className="example-note"><span>示例素材</span>先体验操作，再换成你自己的内容。</div>}
            <TextField label="笔记主题" value={brief.topic} onChange={v => setBrief("topic", v)} maxLength={60} placeholder="例如：租房小桌面整理" />
            <TextField label="写给谁看" value={brief.audience} onChange={v => setBrief("audience", v)} maxLength={100} placeholder="具体到场景与人群" />
            <div className="two-fields"><Choice label="内容类型" value={brief.format} options={FORMATS} onChange={v => setBrief("format", v)} /><Choice label="表达语气" value={brief.tone} options={TONES} onChange={v => setBrief("tone", v)} /></div>
            <label className="field"><span>你能确认的素材 <em>必填</em></span><Textarea className="control facts-input" rows={8} value={brief.facts} maxLength={5000} onChange={e => setBrief("facts", e.target.value)} placeholder={"每行一个事实：\n• 实际条件、步骤、观察\n• 有依据的尺寸或价格\n• 不足之处和适用范围"} /><small>每行一个要点。最多取前8条整理文案；本地图卡取前4条，其余可加页。</small></label>
            <details className="more-brief"><summary>补充定位、来源和合作信息 <ChevronDown size={16} /></summary><div className="extra-fields">
              <div className="two-fields"><Choice label="内容领域" value={brief.niche} options={NICHES} onChange={v => setBrief("niche", v)} /><Choice label="笔记目标" value={brief.goal} options={GOALS} onChange={v => setBrief("goal", v)} /></div>
              <TextField label="读者遇到的问题" value={brief.pain} onChange={v => setBrief("pain", v)} maxLength={500} rows={3} />
              <TextField label="结论与适用边界" value={brief.conclusion} onChange={v => setBrief("conclusion", v)} maxLength={500} rows={3} />
              <TextField label="话题关键词" value={brief.keywords} onChange={v => setBrief("keywords", v)} maxLength={200} placeholder="用逗号分隔，最多8个" />
              <TextField label="资料出处 / 记录日期" value={brief.source} onChange={v => setBrief("source", v)} maxLength={1500} rows={2} placeholder="链接、实际观察记录或原始资料名称" />
              <label className="toggle-row"><span>素材是我的真实经历<small>允许基于已有素材写体验，不新增经历</small></span><Switch checked={brief.experience} onCheckedChange={v => setBrief("experience", v)} aria-label="素材是我的真实经历" /></label>
              <label className="toggle-row"><span>商业合作内容<small>稿件标明商业合作；发布前自行报备</small></span><Switch checked={brief.commercial} onCheckedChange={v => setBrief("commercial", v)} aria-label="商业合作内容" /></label>
              {brief.commercial && <TextField label="合作品牌" value={brief.brand} onChange={v => setBrief("brand", v)} maxLength={100} placeholder="填写品牌名称" />}
            </div></details>
            <div className="generate-actions"><Button className="touch primary-action" onClick={localGenerate} disabled={busy}><FileText />本地成稿<span>免费</span></Button><Button variant="outline" className="touch ai-action" onClick={aiGenerate} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Sparkles />} {busy ? "正在生成…" : "AI 精修"}<span>{apiKey ? "已填密钥" : "需连接"}</span></Button>{busy && <Button variant="ghost" className="touch" onClick={() => pending.current?.abort()}><X />取消生成</Button>}</div>
            {apiKey && <p className="key-note">点击 AI 精修会将以上素材发送给 DeepSeek，并使用你的 API 余额。</p>}
            {apiError && <p className="inline-error" role="alert">{apiError}</p>}
            <div className="bring-your-ai"><span>也可以用现有的 ChatGPT / 其他 AI</span><div><Button variant="ghost" className="touch" onClick={() => { try { void copy(buildPrompt(brief)); } catch (e) { toast.error(message(e)); } }}><Copy />复制专业提示词</Button><Button variant="ghost" className="touch" onClick={() => setModal("import")}><Upload />导入 AI 稿件</Button></div></div>
          </div>
        </aside>
        <section id="editor" className={"editor-panel panel " + (mobileStep !== "edit" ? "mobile-hidden" : "")} aria-label="稿件工作区">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="editor-nav"><TabsList className="editor-tabs"><TabsTrigger value="copy"><FileText size={16} />文案编辑</TabsTrigger><TabsTrigger value="cards"><Layers size={16} />图卡排版</TabsTrigger><TabsTrigger value="review"><ShieldCheck size={16} />发布检查{analysis.riskCount > 0 && <span className="risk-badge">{analysis.riskCount}</span>}</TabsTrigger></TabsList><span className="origin-tag">{draft.origin === "ai" ? "AI 稿件" : draft.origin === "imported" ? "导入稿件" : draft.origin === "edited" ? "已编辑" : "本地框架稿"}</span></div>
            <TabsContent value="copy" className="tab-body">
              <div className="copy-grid"><div className="copy-editor">
                <div className="section-caption"><span>02 / 文案</span><Button variant="ghost" className="touch" onClick={() => copy(publishText(draft))}><Copy />复制完整文案</Button></div>
                <label className="field title-field"><span>发布标题 <small>{countChars(draft.title)}字 · 建议约20字</small></span><Input className="control title-input" value={draft.title} maxLength={80} onChange={e => editDraft({ title: e.target.value })} /></label>
                {draft.titles.length > 0 && <details className="title-options" open><summary>备选标题 <span>{draft.titles.length}个角度</span><ChevronDown size={14} /></summary><div>{draft.titles.map((t, i) => <button type="button" key={i} className={draft.title === t ? "selected-title" : ""} onClick={() => editDraft({ title: t })}><span>{String(i + 1).padStart(2, "0")}</span>{t}{draft.title === t && <Check size={14} />}</button>)}</div></details>}
                <label className="field body-field"><span>正文 <small>{countChars(draft.body)}字</small></span><Textarea className="control copy-body" value={draft.body} maxLength={10000} rows={16} onChange={e => editDraft({ body: e.target.value })} /><small>本地模式整理素材和段落；AI 精修提供更完整的语言表达。</small></label>
                <TagsField tags={draft.tags} onChange={tags => editDraft({ tags })} />
                <div className="tag-row">{draft.tags.map(t => <span key={t}>#{t}</span>)}</div>
                <div className="copy-actions"><Button variant="outline" className="touch" onClick={() => downloadFile(publishText(draft), safeName(draft.title) + ".txt", "text/plain;charset=utf-8")}><ArrowDownToLine />导出 TXT</Button><Button variant="ghost" className="touch" onClick={() => { setSnapshotName(draft.title); setModal("library"); }}><FolderOpen />存为草稿版本</Button></div>
              </div><aside className="copy-preview"><div className="section-caption"><span>封面预览</span><span>3 : 4</span></div><CardCanvas card={draft.cards[0]} project={project} index={0} /><button className="preview-link" onClick={() => setTab("cards")}>编辑图卡与配色 <ArrowRight size={16} /></button><div className="preview-meta"><span>输出尺寸<strong>1080 × 1440</strong></span><span>图卡页数<strong>{draft.cards.length} 张</strong></span></div><div className="angle-section"><h3>换个表达角度</h3><p>先改变内容结构，再生成新稿。</p>{angles.map(a => <button key={a.label} onClick={() => { setBrief("format", a.format); setMobileStep("brief"); toast("已切换为" + a.format + "，点击成稿应用"); }}><strong>{a.label}<ArrowRight size={14} /></strong><span>{a.reason}</span></button>)}</div></aside></div>
            </TabsContent>
            <TabsContent value="cards" className="tab-body">
              <div className="section-caption"><span>03 / 图卡</span><span>{selected + 1} / {draft.cards.length} 页</span></div>
              <div className="cards-grid"><div className="large-preview"><CardCanvas card={current} project={project} index={selected} /><div className="card-pagination"><Button variant="outline" className="touch" aria-label="上一页" disabled={selected === 0} onClick={() => setSelected(i => i - 1)}><ArrowLeft /></Button><span>{selected === 0 ? "封面" : "内容页 " + selected} · 1080 × 1440</span><Button variant="outline" className="touch" aria-label="下一页" disabled={selected === draft.cards.length - 1} onClick={() => setSelected(i => i + 1)}><ArrowRight /></Button></div></div><div className="card-controls">
                <div className="field"><span>配色方案</span><div className="theme-options">{THEMES.map(t => <button type="button" key={t.id} className={project.theme === t.id ? "active-theme" : ""} aria-pressed={project.theme === t.id} onClick={() => update(p => ({ ...p, theme: t.id }))}><i style={{ background: t.bg, borderColor: t.ink }}><b style={{ background: t.accent }} /></i>{t.name}{project.theme === t.id && <Check size={12} />}</button>)}</div></div>
                <label className="field"><span>版式</span><Select value={project.layout} onValueChange={v => update(p => ({ ...p, layout: v }))}><SelectTrigger className="control"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="editorial">编辑部 · 清晰层次</SelectItem><SelectItem value="poster">海报 · 大字留白</SelectItem><SelectItem value="cards">信息卡 · 内容分区</SelectItem></SelectContent></Select></label>
                <div className="divider" />
                <TextField label="眉题" value={current.kicker} onChange={v => editCard("kicker", v)} maxLength={60} />
                <TextField label="图卡标题" value={current.title} onChange={v => editCard("title", v)} maxLength={80} rows={2} />
                <TextField label="图卡文字" value={current.body} onChange={v => editCard("body", v)} maxLength={1200} rows={5} />
                <TextField label="页脚短句" value={current.foot} onChange={v => editCard("foot", v)} maxLength={100} />
                <TextField label="署名" value={project.signature} onChange={v => update(p => ({ ...p, signature: v }))} maxLength={20} placeholder="你的名字或账号名" />
                <div className="copy-actions"><Button className="touch" onClick={exportSingle} disabled={exporting}><ArrowDownToLine />导出这一页 PNG</Button><Button variant="outline" className="touch" onClick={() => exportBundle(true)} disabled={exporting}><Layers />整套图卡 ZIP</Button></div>
              </div></div>
              <div className="filmstrip">{draft.cards.map((c, i) => <button key={i} className={i === selected ? "active-card" : ""} aria-label={"编辑第" + (i + 1) + "页：" + c.title} aria-pressed={i === selected} onClick={() => setSelected(i)}><CardCanvas card={c} project={project} index={i} mini /><span>{i === 0 ? "封面" : String(i + 1).padStart(2, "0")}</span></button>)}<Button variant="outline" className="add-card" disabled={draft.cards.length >= 9} onClick={() => { const index = draft.cards.length; editDraft({ cards: [...draft.cards, { kicker: "补充要点", title: "一个具体要点", body: "在右侧编辑这页文字。", foot: "依据真实素材创作" }] }); setSelected(index); }}><Plus />加一页</Button></div>
              <div className="page-tools"><Button variant="ghost" className="touch" disabled={selected === 0} onClick={() => { const cards = [...draft.cards]; [cards[selected], cards[selected - 1]] = [cards[selected - 1], cards[selected]]; editDraft({ cards }); setSelected(i => i - 1); }}><ArrowLeft />前移</Button><Button variant="ghost" className="touch" disabled={selected === draft.cards.length - 1} onClick={() => { const cards = [...draft.cards]; [cards[selected], cards[selected + 1]] = [cards[selected + 1], cards[selected]]; editDraft({ cards }); setSelected(i => i + 1); }}><ArrowRight />后移</Button><Button variant="ghost" className="touch danger-text" disabled={draft.cards.length <= 1} onClick={() => editDraft({ cards: draft.cards.filter((_, i) => i !== selected) })}><Trash2 />删除这一页</Button></div>
            </TabsContent>
            <TabsContent value="review" className="tab-body">
              <div className="review-heading"><span className="review-symbol"><ShieldCheck size={30} /></span><div><h2>给发布前留一次检查。</h2><p>规则提示帮助找遗漏；事实、版权和合作报备仍需你确认。</p></div></div>
              <div className="review-stats"><div><span>标题</span><strong>{analysis.titleChars}<small>字</small></strong></div><div><span>正文</span><strong>{analysis.bodyChars}<small>字</small></strong></div><div><span>图卡</span><strong>{analysis.cards}<small>页</small></strong></div><div><span>需核对表达</span><strong>{analysis.riskCount}<small>项</small></strong></div></div>
              <div className="review-items">{analysis.issues.length === 0 ? <div className="review-item"><Check size={18} /><div><strong>规则检查未发现上述问题</strong><p>这不是事实认证或平台审核结果，请继续人工核对。</p></div></div> : analysis.issues.map((i, n) => <div key={n} className={"review-item " + (i.level === "risk" ? "review-risk" : "")}><span className="review-dot" /><div><strong>{i.label}</strong><p>{i.detail}</p></div><span className="review-type">{i.level === "risk" ? "需核对" : "建议"}</span></div>)}</div>
              {draft.reviewNotes.length > 0 && <div className="editor-notes"><h3>成稿时的复核提醒</h3>{draft.reviewNotes.map((n, i) => <p key={i}>{n}</p>)}</div>}
              <div className="release-box"><div><h3>一份完整发布包</h3><p>高清 PNG + 文案 TXT + 可编辑备份 + 检查记录</p></div><Button className="touch" disabled={exporting || busy} onClick={() => exportBundle()}>{exporting ? <LoaderCircle className="spin" /> : <ArrowDownToLine />}导出发布包</Button></div>
              <p className="release-note">解压后按编号上传图卡，粘贴文案，在小红书内手动发布。软件不会代你发布或报备。</p>
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <footer className="workspace-footer"><span><ShieldCheck size={14} />素材与草稿保存在此浏览器，请导出备份；共享设备用完请清空。</span><span>{usage?.total_tokens != null ? "最近一次 AI：" + usage.total_tokens + " tokens · 费用以模型账户为准" : "本地成稿 · 不产生模型调用费用"}</span></footer>
    </main>
    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}>
      <DialogContent className={"studio-dialog " + (modal === "import" ? "wide-dialog" : "")}>
        <DialogHeader><DialogTitle>{modal === "settings" ? "连接你的 AI" : modal === "import" ? "导入 AI 稿件" : modal === "library" ? "本机草稿" : modal === "reset" ? "新建笔记并清空本机数据？" : modal === "copy" ? "长按复制内容" : "三步完成一篇图文笔记"}</DialogTitle><DialogDescription>{modal === "settings" ? "本地成稿无需连接。AI 精修使用你自己的 DeepSeek API 账户。" : modal === "import" ? "先复制素材区的专业提示词，交给你已有的 AI，再把返回的 JSON 粘贴到这里。" : modal === "library" ? "草稿只在当前设备保存，清理浏览器数据会丢失。重要内容请导出 JSON 备份。" : modal === "reset" ? "会清空当前素材、全部本机草稿版本和本次连接密钥。先导出备份即可恢复内容。" : modal === "copy" ? "浏览器没有允许自动复制，请长按下方文字，选择全选并复制。" : "先输入真实素材，再编辑文案与图卡，最后导出并手动发布。"}</DialogDescription></DialogHeader>
        {modal === "settings" && <div className="dialog-stack"><div className="connection-status"><i className={apiKey ? "connected" : "disconnected"} /><span>{apiKey ? "密钥已在本次页面中填写 · 尚未代表验证成功" : "未填写密钥"}</span></div><label className="field"><span>DeepSeek API 密钥</span><Input className="control" type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={e => setApiKey(e.target.value)} maxLength={250} placeholder="在自己的官方账户中创建" /></label><p className="dialog-note">密钥只放在当前页面内存，刷新后需重新输入；不会写入草稿、日志或导出文件。生成时经本站转发给 DeepSeek。</p><label className="field"><span>生成模型</span><Select value={model} onValueChange={setModel}><SelectTrigger className="control"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deepseek-flash">DeepSeek Flash</SelectItem><SelectItem value="deepseek-v4-pro">DeepSeek V4 Pro</SelectItem></SelectContent></Select></label><a className="external-link" href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer">打开官方密钥管理 ↗</a><p className="dialog-note">API 账户余额与聊天会员是不同服务。点击「AI 精修」才发起调用，费用以官方账户记录为准；请勿把密钥发到聊天里。</p><DialogFooter><Button variant="outline" className="touch" onClick={() => { setApiKey(""); toast("密钥已从本页清除"); }}>清除密钥</Button><Button className="touch" onClick={() => { setApiKey(k => k.trim()); setModal(null); }}>保存本次连接</Button></DialogFooter></div>}
        {modal === "import" && <div className="dialog-stack"><Textarea className="control import-area" rows={13} value={importText} maxLength={80000} onChange={e => setImportText(e.target.value)} placeholder="粘贴包含 title、body、tags、cards 的 JSON 稿件…" /><DialogFooter><Button variant="outline" className="touch" onClick={() => setModal(null)}>取消</Button><Button className="touch" disabled={!importText.trim() || busy} onClick={() => { try { const next = parseImported(importText) as Draft; update(p => ({ ...p, draft: next })); setSelected(0); setTab("copy"); setMobileStep("edit"); setModal(null); setImportText(""); toast.success("稿件已导入，可继续编辑"); } catch (e) { toast.error(message(e)); } }}><Upload />导入到编辑器</Button></DialogFooter></div>}
        {modal === "library" && <div className="dialog-stack"><div className="snapshot-create"><Input className="control" aria-label="草稿版本名称" value={snapshotName} onChange={e => setSnapshotName(e.target.value)} maxLength={60} placeholder="这份草稿的版本名称" /><Button className="touch" onClick={saveSnapshot}><Plus />保存</Button></div><div className="snapshot-list">{snapshots.length ? snapshots.map(s => <div className="snapshot" key={s.id}><button onClick={() => { update(() => cleanProject(s.project) as Project); setSelected(0); setTab("copy"); setMobileStep("edit"); setModal(null); toast.success("草稿已打开"); }}><FileText size={18} /><span><strong>{s.name}</strong><small>{s.project.updatedAt ? new Date(s.project.updatedAt).toLocaleString("zh-CN") : "本机草稿"}</small></span></button><Button variant="ghost" className="touch" aria-label={"删除草稿" + s.name} onClick={() => persistLibrary(snapshots.filter(x => x.id !== s.id))}><Trash2 /></Button></div>) : <p className="empty-note">还没有保存版本。当前编辑内容会自动保存在本机。</p>}</div><div className="copy-actions"><Button variant="outline" className="touch" onClick={() => { try { downloadFile(serializeProject(project), safeName(draft.title) + "-备份.json", "application/json"); } catch (e) { toast.error(message(e)); } }}><ArrowDownToLine />导出当前备份</Button><Button variant="outline" className="touch" onClick={() => fileInput.current?.click()}><Upload />导入备份</Button></div><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={e => importBackup(e.target.files?.[0])} /></div>}
        {modal === "reset" && <DialogFooter><Button variant="outline" className="touch" onClick={() => setModal(null)}>保留内容</Button><Button variant="destructive" className="touch" onClick={reset}><RotateCcw />清空并新建</Button></DialogFooter>}
        {modal === "copy" && <Textarea className="control import-area" rows={14} value={copyFallback} readOnly onFocus={e => e.target.select()} />}
        {modal === "help" && <div className="dialog-stack help-steps"><div><b>01</b><span><strong>把真实素材填清楚</strong><p>写明主题、读者、具体事实与边界。本地成稿免费；AI 精修需要自己的 API 密钥，也可以复制提示词到已有 AI。</p></span></div><div><b>02</b><span><strong>编辑文案，打磨图卡</strong><p>选择标题，修改正文；在图卡排版里逐页改字、换配色、改署名。超过容量会提示，请缩短或加页。</p></span></div><div><b>03</b><span><strong>检查并导出发布包</strong><p>导出后在手机文件管理中解压 ZIP，按编号上传 PNG，粘贴文案，核对后手动发布。也可单张下载，复制文字。</p></span></div><p className="dialog-note">这是内容编辑工具，不提供实时热搜、虚构亲测或爆款保证。图卡为文字排版，图片版权与引用资料请自行核对。</p><Button className="touch" onClick={() => setModal(null)}>开始创作</Button></div>}
      </DialogContent>
    </Dialog>
    <Toaster richColors position="top-center" theme="light" />
  </div>;
}

