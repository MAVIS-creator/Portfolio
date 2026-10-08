document.addEventListener("DOMContentLoaded", () => {
  renderShell();
  applyBrand();
  initTheme();
  initMenu();
  initReveal();
  initContact();
  loadBlog();
  loadHomeNews();
  loadArticle();
});
function applyBrand() {
  document
    .querySelectorAll(".site-brand img")
    .forEach((image) => (image.src = "/assets/klyvex_logo.png"));
  document
    .querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')
    .forEach((link) => link.remove());
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/png";
  icon.href = "/assets/klyvex_logo.png";
  document.head.append(icon);
  const social = location.origin + "/assets/klyvex_logo.png";
  document
    .querySelector('meta[property="og:image"]')
    ?.setAttribute("content", social);
  document
    .querySelector('meta[name="twitter:image"]')
    ?.setAttribute("content", social);
}
function renderShell() {
  const active = location.pathname.split("/").filter(Boolean)[0] || "home",
    header = document.querySelector("body > header"),
    footer = document.querySelector("body > footer"),
    links = [
      ["home", "Home", "/"],
      ["about", "About", "/about"],
      ["portfolio", "Portfolio", "/portfolio/"],
      ["blog", "Blog", "/blog/"],
      ["contact", "Contact", "/contact"],
    ];
  if (header)
    header.outerHTML = `<header class="site-header sticky top-0 z-50"><div class="site-nav max-w-7xl mx-auto px-6"><a class="site-brand" href="/"><img src="/assets/mind-control_klyvex_logo.svg" alt="Klyvex Studios"><span><strong>Klyvex Studios</strong><small>Technology · Games · Software</small></span></a><nav id="siteNav" aria-label="Main navigation"><button class="menu-close" type="button" aria-label="Close menu"><i data-lucide="x"></i></button>${links.map(([id, label, url]) => `<a href="${url}"${active === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}<a href="/cv" target="_blank">CV</a><button class="themeToggleBtn" type="button" aria-label="Toggle colour theme"><i data-lucide="sun-moon"></i></button></nav><button id="mobileMenuToggle" class="site-menu" type="button" aria-expanded="false" aria-controls="siteNav"><i data-lucide="menu"></i><span>Menu</span></button><button class="menu-scrim" type="button" aria-label="Close menu"></button></div></header>`;
  if (footer)
    footer.outerHTML = `<footer class="site-footer"><div class="max-w-7xl mx-auto px-6"><p>© ${new Date().getFullYear()} Klyvex Studios · Built by Akintunde Dolapo Elisha</p><nav><a href="/portfolio/">Portfolio</a><a href="/blog/">Blog</a><a href="/contact">Contact</a><a href="https://github.com/MAVIS-creator" target="_blank" rel="noopener noreferrer">GitHub</a></nav></div></footer>`;
}
function initTheme() {
  document.documentElement.dataset.theme =
    localStorage.getItem("theme") || "light";
  document.querySelector(".themeToggleBtn")?.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });
}
function initMenu() {
  const button = document.querySelector("#mobileMenuToggle"),
    nav = document.querySelector("#siteNav"),
    scrim = document.querySelector(".menu-scrim"),
    close = () => {
      nav?.classList.remove("open");
      scrim?.classList.remove("open");
      button?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };
  button?.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    scrim?.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  scrim?.addEventListener("click", close);
  nav?.querySelector(".menu-close")?.addEventListener("click", close);
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}
function initReveal() {
  document
    .querySelectorAll(".fade-in-on-scroll")
    .forEach((x) => x.classList.add("visible"));
  if (window.lucide) lucide.createIcons();
}
function initContact() {
  const form = document.querySelector("#contactForm");
  if (!form) return;
  form.removeAttribute("onsubmit");
  const fields = [...form.querySelectorAll("input,textarea")];
  ["name", "email", "subject", "message"].forEach((name, index) => {
    if (fields[index]) fields[index].name = name;
  });
  const trap = document.createElement("input");
  trap.name = "website";
  trap.tabIndex = -1;
  trap.autocomplete = "off";
  trap.className = "form-trap";
  form.append(trap);
  const notice = document.createElement("p");
  notice.className = "form-notice";
  notice.setAttribute("role", "status");
  form.append(notice);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    notice.textContent = "Sending...";
    try {
      const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        }),
        data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to send message.");
      form.reset();
      notice.textContent = data.message;
      notice.dataset.state = "success";
    } catch (error) {
      notice.textContent = error.message;
      notice.dataset.state = "error";
    } finally {
      button.disabled = false;
    }
  });
}
const postCard = (post) =>
  `<article class="simple-card blog-card">${post.featured_image ? `<img class="blog-card-image" src="${escapeHtml(post.featured_image)}" alt="">` : ""}<div class="blog-card-body"><span class="blog-category">${escapeHtml(post.category || "Software")}</span><time>${date(post.published_at)}</time><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.excerpt)}</p><div class="post-meta"><span><i data-lucide="heart"></i>${Number(post.likes_count || 0)}</span><span><i data-lucide="message-circle"></i>${Number(post.comments_count || 0)}</span></div><a href="/blog/article/${encodeURIComponent(post.slug)}">Read article <i data-lucide="arrow-right"></i></a></div></article>`;
async function loadBlog() {
  const list = document.querySelector("[data-blog-list]");
  if (!list) return;
  try {
    const response = await fetch("/api/posts"),
      posts = await response.json();
    const render = (category = "all") => {
      const visible =
        category === "all"
          ? posts
          : posts.filter((post) => post.category === category);
      list.innerHTML = visible.length
        ? visible.map(postCard).join("")
        : "<p>No posts in this category yet.</p>";
      if (window.lucide) lucide.createIcons();
    };
    render();
    document
      .querySelector("[data-blog-filters]")
      ?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        document
          .querySelectorAll("[data-category]")
          .forEach((item) => item.classList.toggle("active", item === button));
        render(button.dataset.category);
      });
  } catch {
    list.innerHTML = "<p>The blog is temporarily unavailable.</p>";
  }
}
async function loadHomeNews() {
  const list = document.querySelector("[data-home-news]");
  if (!list) return;
  try {
    const response = await fetch("/api/posts"),
      posts = await response.json();
    list.innerHTML = posts.length
      ? posts.slice(0, 3).map(postCard).join("")
      : "<p>Fresh cybersecurity notes are coming soon.</p>";
    if (window.lucide) lucide.createIcons();
  } catch {
    list.innerHTML = "<p>Recent notes are temporarily unavailable.</p>";
  }
}
async function loadArticle() {
  const article = document.querySelector("[data-blog-post]");
  if (!article) return;
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) return location.assign("/blog/");
  try {
    const response = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`),
      data = await response.json();
    if (!response.ok) throw new Error();
    const post = data.post;
    document.title = `${post.title} | Klyvex Studios`;
    article.innerHTML = `<p class="page-kicker">${date(post.published_at)}</p><h1>${escapeHtml(post.title)}</h1><div class="article-body">${post.content_html}</div><section class="engagement"><div class="engagement-actions"><button class="icon-action" data-like type="button"><i data-lucide="heart"></i><span>${Number(post.likes_count || 0)}</span> Like</button><button class="icon-action" data-share type="button"><i data-lucide="share-2"></i> Share</button><a class="icon-action" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer"><i data-lucide="linkedin"></i> LinkedIn</a><a class="icon-action" href="https://x.com/intent/post?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer"><i data-lucide="twitter"></i> X</a></div><div class="comments"><h2>Comments</h2>${(data.comments || []).map((c) => `<article class="comment"><strong>${escapeHtml(c.name)}</strong><time>${date(c.created_at)}</time><p>${escapeHtml(c.comment)}</p></article>`).join("") || "<p>No approved comments yet.</p>"}${data.comments_enabled ? commentForm() : compactNotice("Comments are currently closed.")}</div></section>`;
    if (post.featured_image) {
      const image = document.createElement("img");
      image.className = "article-featured-image";
      image.src = post.featured_image;
      image.alt = "";
      article.querySelector("h1").after(image);
    }
    bindEngagement(slug, article);
    if (window.lucide) lucide.createIcons();
  } catch {
    article.innerHTML =
      '<h1>Post not found</h1><p><a href="/blog/">Return to the blog</a></p>';
  }
}
function commentForm() {
  return `<form class="comment-form"><h3>Join the conversation</h3><label>Name<input name="name" required maxlength="80"></label><label>Email<input name="email" type="email" required maxlength="190"></label><input class="form-trap" name="website" tabindex="-1" autocomplete="off"><label>Comment<textarea name="comment" required minlength="3" maxlength="1500"></textarea></label><button class="btn-pill-blue" type="submit"><i data-lucide="send"></i> Submit for review</button><p class="form-notice" role="status"></p></form>`;
}
function compactNotice(message) {
  return `<p class="comment-closed">${message}</p>`;
}
function bindEngagement(slug, article) {
  article.querySelector("[data-like]")?.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "like", slug }),
        }),
        data = await response.json();
      button.querySelector("span").textContent = data.likes_count;
    } catch {
    } finally {
      button.disabled = false;
    }
  });
  article.querySelector("[data-share]")?.addEventListener("click", async () => {
    if (navigator.share)
      await navigator.share({ title: document.title, url: location.href });
    else await navigator.clipboard.writeText(location.href);
  });
  article
    .querySelector(".comment-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const notice = e.currentTarget.querySelector(".form-notice");
      try {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "comment",
              slug,
              ...Object.fromEntries(new FormData(e.currentTarget)),
            }),
          }),
          data = await response.json();
        if (!response.ok) throw new Error(data.error);
        e.currentTarget.reset();
        notice.textContent = data.message;
        notice.dataset.state = "success";
      } catch (error) {
        notice.textContent = error.message || "Unable to submit comment.";
        notice.dataset.state = "error";
      }
    });
}
function date(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function escapeHtml(value = "") {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}
