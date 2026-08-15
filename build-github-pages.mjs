import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist-github-pages");
const creator = "hirao_masanori";

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return "";
  return parsed.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function cleanExcerpt(value = "") {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/続きをみる/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function sanitizeNoteHtml(value = "") {
  return value
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(meta|link|base)\b[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\sstyle\s*=\s*(["'])[\s\S]*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/<a\b([^>]*)>/gi, (_tag, attributes) => {
      const safeAttributes = attributes
        .replace(/\starget\s*=\s*(["'])[\s\S]*?\1/gi, "")
        .replace(/\srel\s*=\s*(["'])[\s\S]*?\1/gi, "");
      return `<a${safeAttributes} target="_blank" rel="noopener noreferrer">`;
    });
}

const fallbackArticles = [
  ["憲法改正に賛成。だからこそ、改正の進め方には慎重であるべき", "n337e6b9002ff", "2026-08-15T00:00:00+09:00", ""],
  ["城内経済財政相の説明では「骨太ショック」を否定できない", "nb941efa10777", "2026-08-11T22:21:52+09:00", ""],
  ["核兵器は不要。国防と平和のための合理的な解ではない。", "n25c94121e927", "2026-08-09T19:01:41+09:00", ""],
  ["為替介入で得た円は、減税の財源にはなり得ない。", "nc42d57e6a1bd", "2026-08-06T19:02:26+09:00", ""],
  ["「骨太ショック」が示した「責任ある積極財政」の無責任さと危うさ。", "n744689fbcdee", "2026-07-29T01:47:54+09:00", ""],
  ["皇室典範改正と養子案について。天皇を天皇たらしめる象徴性とは。", "nb32d072289ac", "2026-07-10T12:03:46+09:00", ""],
  ["議員定数削減について。定数ではなく民意の反映、国民の利益に主軸を置くべき。", "n1ded685c4e93", "2026-07-07T17:18:10+09:00", ""],
  ["皇統を男系のみに限定する根拠とされるY染色体とは。", "n411bbbc695d0", "2026-06-27T20:56:55+09:00", ""],
  ["消費税は減税せず引き上げ、社会保険料と年金負担を下げるべき。", "n70eefb85282f", "2026-06-26T17:15:44+09:00", ""],
  ["国旗損壊罪について。守るべきは国旗そのものより「国旗への敬意」。法律を発動できる機関や条件を限定すべき。", "n168ae727dfe9", "2026-06-14T17:58:50+09:00", ""],
  ["女性天皇・女系天皇、皇籍の議論について。血統だけでなく、「継承性」から考える。", "n12237fe23752", "2026-06-13T22:29:17+09:00", ""],
  ["自己紹介", "n0dcc8540c30e", "2026-06-12T21:50:43+09:00", ""],
].map(([title, noteId, publishedAt, image]) => ({
  title,
  noteId,
  date: formatDate(publishedAt),
  publishedAt,
  image,
  excerpt: "",
  body: "",
  url: `https://note.com/${creator}/n/${noteId}`,
}));

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "hirao-homepage-github-pages" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function getArticles() {
  try {
    const collected = [];
    for (let page = 1; page <= 50; page += 1) {
      const payload = await getJson(`https://note.com/api/v2/creators/${creator}/contents?kind=note&page=${page}`);
      const contents = payload?.data?.contents ?? [];
      collected.push(...contents);
      if (payload?.data?.isLastPage || contents.length === 0) break;
    }
    const articles = collected
      .filter((item) => item.name && item.key && item.publishAt)
      .sort((left, right) => new Date(right.publishAt).valueOf() - new Date(left.publishAt).valueOf())
      .map((item) => ({
        title: item.name,
        noteId: item.key,
        date: formatDate(item.publishAt),
        publishedAt: item.publishAt,
        image: item.eyecatch ?? "",
        excerpt: cleanExcerpt(item.description ?? item.body ?? ""),
        body: "",
        url: item.noteUrl ?? `https://note.com/${creator}/n/${item.key}`,
      }));
    return articles.length ? articles : fallbackArticles;
  } catch (error) {
    console.warn("NOTE一覧を取得できなかったため、保存済み一覧を使います。", error.message);
    return fallbackArticles;
  }
}

async function addBodies(articles) {
  const results = [];
  for (let index = 0; index < articles.length; index += 4) {
    const group = articles.slice(index, index + 4);
    const completed = await Promise.all(group.map(async (article) => {
      try {
        const payload = await getJson(`https://note.com/api/v3/notes/${article.noteId}`);
        return { ...article, body: sanitizeNoteHtml(payload?.data?.body ?? "") };
      } catch (error) {
        console.warn(`NOTE本文を取得できませんでした: ${article.noteId}`, error.message);
        return article;
      }
    }));
    results.push(...completed);
  }
  return results;
}

async function exists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function copyAssets() {
  const publicDir = path.join(root, "public");
  for (const entry of await readdir(publicDir, { withFileTypes: true })) {
    if (entry.isFile()) await cp(path.join(publicDir, entry.name), path.join(output, entry.name));
  }
  for (const name of ["header.png", "yokonaga.png"]) {
    const publicAsset = path.join(publicDir, name);
    const rootAsset = path.join(root, name);
    if (await exists(publicAsset)) await cp(publicAsset, path.join(output, name));
    else if (await exists(rootAsset)) await cp(rootAsset, path.join(output, name));
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const articles = await addBodies(await getArticles());
const template = await readFile(path.join(root, "github-pages", "index.template.html"), "utf8");
const serialized = JSON.stringify(articles).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const html = template.replace("__NOTE_DATA__", serialized);
const css = (await readFile(path.join(root, "app", "globals.css"), "utf8"))
  .replace(/^@import\s+["']tailwindcss["'];\s*/m, "")
  .concat("\n[hidden] { display: none !important; }\n");

await writeFile(path.join(output, "index.html"), html);
await writeFile(path.join(output, "styles.css"), css);
await cp(path.join(root, "github-pages", "site.js"), path.join(output, "site.js"));
await writeFile(path.join(output, "CNAME"), "hiraomasanori.com\n");
await writeFile(path.join(output, ".nojekyll"), "");
await copyAssets();

console.log(`GitHub Pages用サイトを生成しました（NOTE ${articles.length}件）。`);
