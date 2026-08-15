import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Japanese website", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ja"/i);
  assert.match(html, /<title>平尾正憲（三鷹市）公式サイト<\/title>/i);
  assert.match(html, /将来世代に責任ある政治へ/);
  assert.match(html, /ご寄付のお願い/);
  assert.match(html, /お問い合わせ・SNS/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("includes donation submission mappings and verified contact links", async () => {
  const source = await readFile(new URL("../app/SiteHome.tsx", import.meta.url), "utf8");

  for (const entryId of [
    "entry.50641209",
    "entry.1720299046",
    "entry.1402773033",
    "entry.2144689984",
    "entry.1795677886",
    "entry.171134634",
    "entry.629862955",
  ]) {
    assert.match(source, new RegExp(entryId.replace(".", "\\.")));
  }

  assert.match(source, /hirao\.masanori\.office@gmail\.com/);
  assert.doesNotMatch(source, /note\.com\/embed\/notes/);
  assert.match(source, /src="\/header\.png"/);
  assert.match(source, /src="\/yokonaga\.png"/);
  assert.match(source, /normalizeNumericInput/);
  assert.match(source, /amountCompositionRef/);
  assert.match(source, /onCompositionStart/);
  assert.match(source, /onCompositionEnd/);
  assert.match(
    source,
    /<label className="check-row"[^>]*>\s*<span>領収書の発行を希望する[\s\S]*?<input\s+id="receipt-request"/,
  );
  assert.match(
    source,
    /<label className="check-row nationality-check"[^>]*>\s*<span>日本国籍ですか？[\s\S]*?<input\s+id="nationality-confirmation"/,
  );
  assert.match(source, /寄附者確認および政治資金収支報告書作成/);
  assert.match(source, /目的外には使用いたしません/);
  assert.match(source, /threads\.com\/@hirao_masanori/);
  assert.match(source, /youtube\.com\/@%E5%B9%B3%E5%B0%BE%E6%AD%A3%E6%86%B2/);
});

test("keeps the note index and article body independently scrollable", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.content-panel\.note-active\s*\{[^}]*overflow:\s*hidden/);
  assert.match(styles, /\.note-index,\s*\.note-preview\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(styles, /overscroll-behavior:\s*contain/);
  assert.match(styles, /\.hero-banner\s*\{(?![^}]*min-height:\s*120px)/);
});

test("loads the complete note archive and full article bodies", async () => {
  const dataSource = await readFile(new URL("../app/note-data.ts", import.meta.url), "utf8");
  assert.match(dataSource, /api\/v2\/creators/);
  assert.match(dataSource, /isLastPage/);
  assert.match(dataSource, /api\/v3\/notes/);
  assert.match(dataSource, /fallbackArticles/);
});

test("ships all local image assets", async () => {
  await Promise.all(
    ["profile.jpg", "og.png", "note.png", "x.png", "instagram.png", "facebook.png", "threads.png", "youtube.png"].map(
      (filename) => access(new URL(`../public/${filename}`, import.meta.url)),
    ),
  );
});
