import { getNoteArticleBody } from "../../../note-data";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^n[a-zA-Z0-9]{12}$/.test(id)) {
      return Response.json({ error: "Invalid article ID" }, { status: 400 });
    }

    const body = await getNoteArticleBody(id);
    if (!body) return Response.json({ error: "Article not found" }, { status: 404 });
    return Response.json({ body }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ error: "Article is temporarily unavailable" }, { status: 502 });
  }
}
