import type { Metadata } from "next";
import SiteHome from "./SiteHome";
import { getNoteArticleBody, getNoteArticles } from "./note-data";

export const metadata: Metadata = {
  title: "平尾正憲（三鷹市）公式サイト",
  description:
    "平尾正憲（三鷹市）の公式サイト。将来世代に責任ある政治へ。安定と調和を次世代へ。",
};

export default async function Home() {
  const articles = await getNoteArticles();
  let initialArticleBody = "";

  try {
    if (articles[0]) initialArticleBody = await getNoteArticleBody(articles[0].noteId);
  } catch {
    initialArticleBody = articles[0]?.excerpt ? `<p>${articles[0].excerpt}</p>` : "";
  }

  return <SiteHome articles={articles} initialArticleBody={initialArticleBody} />;
}
