const { callGateway } = require("../lib/gateway");
const {
  createSession,
  readSession,
  verifyPassword,
} = require("../lib/admin-auth");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const action = String(req.query?.action || "status");
  if (action === "login" && req.method === "POST") {
    const { username = "", password = "" } = req.body || {};
    if (
      !process.env.ADMIN_USERNAME ||
      String(username) !== process.env.ADMIN_USERNAME ||
      !verifyPassword(String(password))
    )
      return res.status(401).json({ error: "Invalid credentials." });
    const token = createSession();
    res.setHeader(
      "Set-Cookie",
      `portfolio_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
    );
    const session = readToken(token);
    return res.json({ authenticated: true, csrf: session.csrf });
  }
  const session = readSession(req);
  if (action === "status")
    return res.json({ authenticated: !!session, csrf: session?.csrf || null });
  if (!session)
    return res.status(401).json({ error: "Authentication required." });
  if (req.headers["x-csrf-token"] !== session.csrf)
    return res.status(419).json({ error: "Invalid security token." });
  if (action === "logout" && req.method === "POST") {
    res.setHeader(
      "Set-Cookie",
      "portfolio_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    );
    return res.json({ authenticated: false });
  }
  try {
    if (action === "health" && req.method === "GET") {
      const posts = await callGateway("admin_list_posts");
      const visible = (posts.posts || []).filter((post) => !isSystemPost(post));
      return res.json({
        connected: true,
        posts: visible.length,
        comments: 0,
        checked_at: new Date().toISOString(),
      });
    }
    if (action === "posts" && req.method === "GET") {
      const result = await callGateway("admin_list_posts");
      return res.json(
        (result.posts || [])
          .filter((post) => !isSystemPost(post))
          .map(decodeFeaturedImage),
      );
    }
    if (action === "posts" && ["POST", "PUT"].includes(req.method)) {
      const body = req.body || {};
      return res.json(
        await callGateway("save_post", {
          ...body,
          content: encodePostMetadata(
            body.content,
            body.featured_image,
            body.category,
          ),
          id: req.method === "PUT" ? Number(req.body?.id) : null,
        }),
      );
    }
    if (action === "posts" && req.method === "DELETE")
      return res.json(
        await callGateway("delete_post", { id: Number(req.body?.id) }),
      );
    if (action === "comments" && req.method === "GET") {
      const setting = await readCompatibilitySettings();
      return res.json({ comments: [], comments_enabled: setting.enabled });
    }
    if (action === "comments" && req.method === "PUT")
      return res.json(
        await callGateway("moderate_comment", {
          id: Number(req.body?.id),
          status: String(req.body?.status),
        }),
      );
    if (action === "comments" && req.method === "DELETE")
      return res.json(
        await callGateway("delete_comment", { id: Number(req.body?.id) }),
      );
    if (action === "settings" && req.method === "GET")
      return res.json(await readCompatibilitySettings());
    if (action === "settings" && req.method === "PUT") {
      const current = await findSettingsPost();
      const enabled = !!req.body?.comments_enabled;
      await callGateway("save_post", {
        id: current?.id || null,
        title: "Klyvex system settings",
        slug: "klyvex-settings",
        excerpt: "Internal portfolio configuration",
        content: JSON.stringify({ comments_enabled: enabled }),
        status: "draft",
      });
      return res.json({ enabled, comments_enabled: enabled });
    }
    return res.status(405).json({ error: "Unsupported action." });
  } catch (error) {
    console.error("Admin bridge failed:", error.message);
    return res.status(502).json({
      error: "The admin service could not reach the portfolio database.",
    });
  }
};
function readToken(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
  } catch {
    return {};
  }
}
async function findSettingsPost() {
  const result = await callGateway("admin_list_posts");
  return (result.posts || []).find((post) => post.slug === "klyvex-settings");
}
async function readCompatibilitySettings() {
  const post = await findSettingsPost();
  if (!post) return { enabled: true, comments_enabled: true };
  try {
    const value = JSON.parse(post.content || "{}");
    const enabled = value.comments_enabled !== false;
    return { enabled, comments_enabled: enabled };
  } catch {
    return { enabled: true, comments_enabled: true };
  }
}
function isSystemPost(post) {
  return (
    post.slug === "klyvex-settings" ||
    String(post.slug).startsWith("klyvex-comment-")
  );
}
function encodePostMetadata(content = "", image = "", category = "") {
  const clean = String(content).replace(
    /^(?:\[(?:featured_image|category)\].*?\[\/(?:featured_image|category)\]\s*)+/s,
    "",
  );
  const featured = String(image || "").trim();
  const selectedCategory = String(category || "Software").trim();
  return `${featured ? `[featured_image]${featured}[/featured_image]\n` : ""}[category]${selectedCategory}[/category]\n\n${clean}`;
}
function decodeFeaturedImage(post) {
  const content = String(post.content || "");
  const imageMatch = content.match(
    /\[featured_image\](.*?)\[\/featured_image\]/s,
  );
  const categoryMatch = content.match(/\[category\](.*?)\[\/category\]/s);
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
