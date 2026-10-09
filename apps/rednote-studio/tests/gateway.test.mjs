import test from "node:test";
import assert from "node:assert/strict";
import { handleGenerate } from "../lib/model-gateway.mjs";
import { SAMPLE_BRIEF, generateDraft } from "../lib/content-engine.mjs";
const KEY = "test-key-for-tests-only";
function request(patch = {}, options = {}) {
  return new Request("https://studio.example/api/generate", { method: "POST", headers: { origin: "https://studio.example", "content-type": "application/json", ...options.headers }, body: JSON.stringify({ apiKey: KEY, model: "deepseek-flash", brief: SAMPLE_BRIEF, ...patch }), ...options });
}
const forbiddenFetch = () => { throw new Error("Unexpected upstream call"); };
test("valid API request uses fixed endpoint, strict JSON, no streaming/retry and real usage fields", async () => {
  let calls = 0;
  const response = await handleGenerate(request({ endpoint: "https://evil.example" }), async (url, options) => {
    calls++; assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.redirect, "error"); assert.equal(options.headers.Authorization, "Bearer " + KEY);
    const body = JSON.parse(options.body); assert.equal(body.stream, false); assert.equal(body.thinking.type, "disabled");
    assert.equal(body.response_format.type, "json_object"); assert.ok(!options.body.includes(KEY));
    return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(generateDraft(SAMPLE_BRIEF)) } }], usage: { prompt_tokens: 100, completion_tokens: 80, total_tokens: 180 } });
  });
  assert.equal(response.status, 200); const data = await response.json();
  assert.equal(data.draft.origin, "ai"); assert.equal(data.usage.total_tokens, 180); assert.equal(calls, 1);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(!JSON.stringify(data).includes(KEY));
});
test("bad key, unsupported model and invalid brief do not call model", async () => {
  for (const patch of [{ apiKey: "" }, { apiKey: "key with spaces" }, { model: "other" }, { brief: { ...SAMPLE_BRIEF, facts: "" } }]) {
    const response = await handleGenerate(request(patch), forbiddenFetch); assert.equal(response.status, 400);
  }
});
test("cross-origin requests and unsupported methods are rejected before processing", async () => {
  const cross = request({}, { headers: { origin: "https://evil.example", "content-type": "application/json" } });
  assert.equal((await handleGenerate(cross, forbiddenFetch)).status, 403);
  assert.equal((await handleGenerate(new Request("https://studio.example/api/generate"), forbiddenFetch)).status, 405);
});
test("bad content type, invalid JSON and large bodies fail without calling model", async () => {
  assert.equal((await handleGenerate(request({}, { headers: { "content-type": "text/plain" } }), forbiddenFetch)).status, 415);
  const broken = new Request("https://studio.example/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: "broken" });
  assert.equal((await handleGenerate(broken, forbiddenFetch)).status, 400);
  assert.equal((await handleGenerate(request({ filler: "x".repeat(26000) }), forbiddenFetch)).status, 413);
});
test("provider error responses never echo keys or provider private messages", async () => {
  for (const status of [401, 402, 429, 500]) {
    const response = await handleGenerate(request(), async () => new Response("secret " + KEY, { status }));
    assert.equal(response.status, status === 500 ? 502 : status);
    const raw = await response.text(); assert.ok(!raw.includes(KEY)); assert.ok(!raw.includes("secret"));
  }
});
test("truncated generation is rejected instead of becoming an apparently valid draft", async () => {
  const response = await handleGenerate(request(), async () => Response.json({ choices: [{ finish_reason: "length", message: { content: '{"title":"截断' } }] }));
  assert.equal(response.status, 422); assert.equal((await response.json()).truncated, true);
});
test("missing cards, broken JSON and missing choices preserve error semantics", async () => {
  for (const payload of [
    { choices: [{ message: { content: '{"title":"稿","body":"文字","cards":[]}' } }] },
    { choices: [{ message: { content: "not json" } }] },
    { choices: [] },
  ]) {
    const response = await handleGenerate(request(), async () => Response.json(payload));
    assert.ok([422, 502].includes(response.status)); assert.ok((await response.json()).error.includes("原稿"));
  }
});
test("network failure does not retry a potentially chargeable request", async () => {
  let calls = 0;
  const response = await handleGenerate(request(), async () => { calls++; throw new Error(KEY); });
  assert.equal(response.status, 502); assert.equal(calls, 1); assert.ok(!(await response.text()).includes(KEY));
});
test("already cancelled requests cannot initiate a paid model call", async () => {
  const controller = new AbortController(); controller.abort();
  const response = await handleGenerate(request({}, { signal: controller.signal }), forbiddenFetch);
  assert.equal(response.status, 504);
});
test("cancellation reaches upstream and returns a safe error", async () => {
  const controller = new AbortController();
  const response = await handleGenerate(request({}, { signal: controller.signal }), async (_url, options) => {
    controller.abort(); assert.equal(options.signal.aborted, true); throw new Error("aborted");
  });
  assert.equal(response.status, 504); assert.ok((await response.json()).error.includes("取消"));
});
