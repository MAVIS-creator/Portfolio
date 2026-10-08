const crypto = require("crypto");
const { callGateway } = require("../lib/gateway");
module.exports = async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
      const action = req.query?.slug ? "get_post" : "list_posts",
        result = await callGateway(
          action,
          req.query?.slug ? { slug: String(req.query.slug) } : {},
        );
      if (action === "get_post" && !result.post)
        return res.status(404).json({ error: "Post not found." });
      const metadata = await callGateway("admin_list_posts");
      const bySlug = new Map(
        (metadata.posts || []).map((post) => [post.slug, decodeFeatured(post)]),
      );
      if (action === "get_post") {
        const full = bySlug.get(String(req.query.slug));
        if (full) {
          result.post.featured_image = full.featured_image;
          result.post.category = full.category;
          result.post.content_html = contentHtml(full.content);
        }
        return res.json(result);
      }
      return res.json(
        (result.posts || []).map((post) => ({
          ...post,
          featured_image: bySlug.get(post.slug)?.featured_image || "",
          category: bySlug.get(post.slug)?.category || "Software",
        })),
      );
    }
    if (req.method === "POST") {
      res.setHeader("Cache-Control", "no-store");
      const body = req.body || {},
        slug = String(body.slug || "").slice(0, 190);
      if (!slug) return res.status(422).json({ error: "A post is required." });
      if (body.action === "like") {
        const ip = String(
            req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
          ).split(",")[0],
          visitor = crypto
            .createHash("sha256")
            .update(
              `${ip}|${req.headers["user-agent"] || ""}|${process.env.ADMIN_SESSION_SECRET || ""}`,
            )
            .digest("hex");
        return res.json(await callGateway("like_post", { slug, visitor }));
      }
      if (body.action === "comment") {
        const name = String(body.name || "").trim(),
          email = String(body.email || "").trim(),
          comment = String(body.comment || "").trim(),
          website = String(body.website || "").trim();
        if (website) return res.json({ message: "Comment received." });
        if (
          !name ||
          name.length > 80 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          comment.length < 3 ||
          comment.length > 1500
        )
          return res
            .status(422)
            .json({ error: "Please check your comment details." });
        return res.json(
          await callGateway("submit_comment", { slug, name, email, comment }),
        );
      }
      return res.status(422).json({ error: "Unknown action." });
    }
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Posts bridge failed:", error.message);
    return res.status(502).json({ error: "Blog service unavailable." });
  }
};
function decodeFeatured(post) {
  const content = String(post.content || ""),
    imageMatch = content.match(/\[featured_image\](.*?)\[\/featured_image\]/s),
    categoryMatch = content.match(/\[category\](.*?)\[\/category\]/s);
  return {
    ...post,
    featured_image: imageMatch?.[1] || "",
    category: categoryMatch?.[1] || "Software",
    content: content.replace(
      /^(?:\[(?:featured_image|category)\].*?\[\/(?:featured_image|category)\]\s*)+/s,
      "",
    ),
  };
}
function contentHtml(content) {
  if (/<[a-z][\s\S]*>/i.test(String(content))) return String(content);
  return String(content)
    .split(/\r?\n\r?\n/)
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`,
    )
    .join("");
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}
