import { validateBrief, buildPrompt, normalizeDraft } from "./content-engine.mjs";
export const ALLOWED_MODELS = ["deepseek-flash", "deepseek-v4-pro"];
const ENDPOINT = "https://api.deepseek.com/chat/completions";
function json(value, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export async function handleGenerate(request, fetchImpl = fetch) {
  if (request.method !== "POST") return json({ error: "只支持提交生成请求" }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "请求来源不匹配" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "请求格式不正确" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 50000) return json({ error: "素材过长" }, 413);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 25000) return json({ error: "素材过长" }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "请求不是有效的JSON" }, 400); }
  if (!body || typeof body !== "object") return json({ error: "请求格式不正确" }, 400);
  const key = body.apiKey;
  if (request.signal.aborted) return json({ error: "生成已取消，原稿已保留" }, 504);
  if (typeof key !== "string" || key.length < 10 || key.length > 250 || /[\s\r\n]/.test(key)) return json({ error: "请在连接设置中填写有效的DeepSeek API密钥" }, 400);
  if (!ALLOWED_MODELS.includes(body.model)) return json({ error: "请选择支持的模型" }, 400);
  let brief, prompt;
  try { brief = validateBrief(body.brief); prompt = buildPrompt(brief); }
  catch (error) { return json({ error: error instanceof Error ? error.message : "素材格式不正确" }, 400); }
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 60000);
  const cancel = () => controller.abort(); request.signal.addEventListener("abort", cancel, { once: true });
  try {
    const result = await fetchImpl(ENDPOINT, {
      method: "POST", redirect: "error", signal: controller.signal,
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: body.model,
        messages: [{ role: "system", content: "你是一位严谨的中文内容编辑。遵守事实边界，只输出要求的JSON稿件。" }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }, thinking: { type: "disabled" }, temperature: 0.7, max_tokens: 4000, stream: false }),
    });
    if (!result.ok) {
      const errors = { 401: "密钥未通过验证，请在官方平台核对", 402: "模型账户余额不足，请本人检查账户", 429: "模型服务繁忙或已限流，请稍后重试", 400: "模型服务未接受请求，请稍后重试" };
      return json({ error: errors[result.status] || "模型服务暂时不可用，请稍后重试" }, [401, 402, 429].includes(result.status) ? result.status : 502);
    }
    const raw = await result.text();
    if (raw.length > 150000) return json({ error: "模型返回内容过长，请缩短素材重试" }, 502);
    let data;
    try { data = JSON.parse(raw); } catch { return json({ error: "模型返回格式不正确，原稿已保留" }, 502); }
    const choice = data.choices?.[0];
    if (choice?.finish_reason === "length") return json({ error: "稿件被长度限制截断，请缩短素材后重试", truncated: true }, 422);
    if (typeof choice?.message?.content !== "string") return json({ error: "模型没有返回稿件，原稿已保留" }, 502);
    let draft;
    try { draft = normalizeDraft(JSON.parse(choice.message.content)); }
    catch { return json({ error: "模型稿件缺少必要字段，原稿已保留，请重试" }, 422); }
    return json({ draft: { ...draft, origin: "ai" }, usage: {
      prompt_tokens: Number.isFinite(data.usage?.prompt_tokens) ? data.usage.prompt_tokens : null,
      completion_tokens: Number.isFinite(data.usage?.completion_tokens) ? data.usage.completion_tokens : null,
      total_tokens: Number.isFinite(data.usage?.total_tokens) ? data.usage.total_tokens : null,
    }, model: body.model });
  } catch {
    return json({ error: controller.signal.aborted ? "生成已取消或超时，原稿已保留" : "模型连接失败，原稿已保留，请检查连接后重试" }, controller.signal.aborted ? 504 : 502);
  } finally { clearTimeout(timer); request.signal.removeEventListener("abort", cancel); }
}
