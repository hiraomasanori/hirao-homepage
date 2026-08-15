import type { NoteArticle } from "./SiteHome";

type NoteListItem = {
  name?: string;
  key?: string;
  publishAt?: string;
  noteUrl?: string;
  eyecatch?: string | null;
  body?: string | null;
  description?: string | null;
};

type NoteListResponse = {
  data?: {
    contents?: NoteListItem[];
    isLastPage?: boolean;
  };
};

type NoteDetailResponse = {
  data?: {
    body?: string;
  };
};

const NOTE_CREATOR = "hirao_masanori";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return "";
  return parsed.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const fallbackArticles: NoteArticle[] = [
  ["城内経済財政相の説明では「骨太ショック」を否定できない", "nb941efa10777", "2026-08-11T22:21:52+09:00", "https://assets.st-note.com/production/uploads/images/302583417/rectangle_large_type_2_17d99674e8f0693a1f15f4f05cce5c03.jpeg?fit=bounds&quality=85&width=1280"],
  ["核兵器は不要。国防と平和のための合理的な解ではない。", "n25c94121e927", "2026-08-09T19:01:41+09:00", "https://assets.st-note.com/production/uploads/images/301590695/rectangle_large_type_2_04b284435b09174777c16b1cea078ff0.png?fit=bounds&quality=85&width=1280"],
  ["為替介入で得た円は、減税の財源にはなり得ない。", "nc42d57e6a1bd", "2026-08-06T19:02:26+09:00", "https://assets.st-note.com/production/uploads/images/300925319/rectangle_large_type_2_e2968a091fa5e5456de0e9f39a996e6d.jpeg?fit=bounds&quality=85&width=1280"],
  ["「骨太ショック」が示した「責任ある積極財政」の無責任さと危うさ。", "n744689fbcdee", "2026-07-29T01:47:54+09:00", "https://assets.st-note.com/production/uploads/images/298422293/rectangle_large_type_2_7065e6ad7c8379c28a95640c350a703a.jpeg?fit=bounds&quality=85&width=1280"],
  ["皇室典範改正と養子案について。天皇を天皇たらしめる象徴性とは。", "nb32d072289ac", "2026-07-10T12:03:46+09:00", "https://assets.st-note.com/production/uploads/images/293070489/rectangle_large_type_2_82f9fb8a57ec57b35ccda885773a46cc.png?fit=bounds&quality=85&width=1280"],
  ["議員定数削減について。定数ではなく民意の反映、国民の利益に主軸を置くべき。", "n1ded685c4e93", "2026-07-07T17:18:10+09:00", "https://assets.st-note.com/production/uploads/images/292251175/rectangle_large_type_2_8d60d96ae1f745b5aaf9e98cead34eab.jpeg?fit=bounds&quality=85&width=1280"],
  ["皇統を男系のみに限定する根拠とされるY染色体とは。", "n411bbbc695d0", "2026-06-27T20:56:55+09:00", "https://assets.st-note.com/production/uploads/images/289313937/rectangle_large_type_2_cdda0419d5923cd4425e6ef91a0c2391.png?fit=bounds&quality=85&width=1280"],
  ["消費税は減税せず引き上げ、社会保険料と年金負担を下げるべき。", "n70eefb85282f", "2026-06-26T17:15:44+09:00", "https://assets.st-note.com/production/uploads/images/288939955/rectangle_large_type_2_86627c854104296f8cd4a56f212966fe.jpeg?fit=bounds&quality=85&width=1280"],
  ["国旗損壊罪について。守るべきは国旗そのものより「国旗への敬意」。法律を発動できる機関や条件を限定すべき。", "n168ae727dfe9", "2026-06-14T17:58:50+09:00", "https://assets.st-note.com/production/uploads/images/285393894/rectangle_large_type_2_626aa60c307cc49cca6d2b0d02d6ff70.png?fit=bounds&quality=85&width=1280"],
  ["女性天皇・女系天皇、皇籍の議論について。血統だけでなく、「継承性」から考える。", "n12237fe23752", "2026-06-13T22:29:17+09:00", "https://assets.st-note.com/production/uploads/images/286643880/rectangle_large_type_2_2dbebe8679b34cd8438f369d7a1a7e06.jpeg?fit=bounds&quality=85&width=1280"],
  ["自己紹介", "n0dcc8540c30e", "2026-06-12T21:50:43+09:00", "https://assets.st-note.com/production/uploads/images/284859214/rectangle_large_type_2_c9961b43de17aee5d48682ace8587dd2.png?fit=bounds&quality=85&width=1280"],
].map(([title, noteId, publishedAt, image]) => ({
  title,
  date: formatDate(publishedAt),
  url: `https://note.com/${NOTE_CREATOR}/n/${noteId}`,
  noteId,
  image,
  excerpt: "",
}));

function cleanExcerpt(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/続きをみる/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function sanitizeNoteHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(meta|link|base)\b[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\sstyle\s*=\s*(["'])[\s\S]*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/<a\b([^>]*)>/gi, (_tag, attributes: string) => {
      const safeAttributes = attributes
        .replace(/\starget\s*=\s*(["'])[\s\S]*?\1/gi, "")
        .replace(/\srel\s*=\s*(["'])[\s\S]*?\1/gi, "");
      return `<a${safeAttributes} target="_blank" rel="noopener noreferrer">`;
    });
}

export async function getNoteArticleBody(noteId: string) {
  if (!/^n[a-zA-Z0-9]{12}$/.test(noteId)) return "";

  const response = await fetch(`https://note.com/api/v3/notes/${noteId}`, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("note article is unavailable");

  const payload = (await response.json()) as NoteDetailResponse;
  return sanitizeNoteHtml(payload.data?.body ?? "");
}

export async function getNoteArticles(): Promise<NoteArticle[]> {
  try {
    const collected: NoteListItem[] = [];

    for (let page = 1; page <= 50; page += 1) {
      const response = await fetch(
        `https://note.com/api/v2/creators/${NOTE_CREATOR}/contents?kind=note&page=${page}`,
        { next: { revalidate: 1800 }, headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error("note article list is unavailable");

      const payload = (await response.json()) as NoteListResponse;
      const contents = payload.data?.contents ?? [];
      collected.push(...contents);
      if (payload.data?.isLastPage || contents.length === 0) break;
    }

    const articles = collected
      .filter((item) => item.name && item.key && item.publishAt)
      .sort(
        (left, right) =>
          new Date(right.publishAt ?? 0).valueOf() - new Date(left.publishAt ?? 0).valueOf(),
      )
      .map((item) => ({
        title: item.name ?? "",
        date: formatDate(item.publishAt ?? ""),
        url: item.noteUrl ?? `https://note.com/${NOTE_CREATOR}/n/${item.key}`,
        noteId: item.key ?? "",
        image: item.eyecatch ?? "",
        excerpt: cleanExcerpt(item.description ?? item.body ?? ""),
      }));

    return articles.length ? articles : fallbackArticles;
  } catch {
    return fallbackArticles;
  }
}
