let csrf = "";
const $ = (selector) => document.querySelector(selector),
  page = document.body.dataset.page || "overview";
if (page === "posts" && window.tinymce)
  tinymce.init({
    selector: "#content",
    height: 440,
    menubar: false,
    branding: false,
    promotion: false,
    plugins: "autolink lists link image code table wordcount",
    toolbar:
      "undo redo | blocks | bold italic | bullist numlist | link image table | blockquote code",
    content_style:
      "body{font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;padding:12px}",
  });
async function api(action, options = {}) {
  options.headers = { Accept: "application/json", ...(options.headers || {}) };
  if (csrf) options.headers["X-CSRF-Token"] = csrf;
  let response, data;
  try {
    response = await fetch(
      `/api/admin?action=${encodeURIComponent(action)}`,
      options,
    );
    data = await response.json();
  } catch {
    throw new Error(
      "The server could not be reached. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 && action !== "login")
      location.assign("/admin");
    throw new Error(data.error || "The request could not be completed.");
  }
  return data;
}
const alertError = (error) =>
  Swal.fire({
    icon: "error",
    title: "Something went wrong",
    text: error.message || String(error),
    confirmButtonColor: "#2457d6",
  });
const alertSuccess = (title, text = "") =>
  Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1700,
    showConfirmButton: false,
  });
async function boot() {
  if (page === "login") return bootLogin();
  try {
    const state = await api("status");
    if (!state.authenticated) return location.replace("/admin");
    csrf = state.csrf;
    document.querySelector(".admin-app").hidden = false;
    bindShell();
    if (page === "overview") await loadOverview();
    if (page === "posts") await loadPosts();
    if (page === "comments") await loadComments();
    if (page === "settings") await loadSettings();
  } catch (error) {
    alertError(error);
  }
}
function bindShell() {
  document
    .querySelector(`[data-nav="${page}"]`)
    ?.setAttribute("aria-current", "page");
  $("#logout")?.addEventListener("click", async () => {
    try {
      await api("logout", { method: "POST" });
      location.assign("/admin");
    } catch (error) {
      alertError(error);
    }
  });
}
function bootLogin() {
  $("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    button.disabled = true;
    try {
      await api("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      location.assign("/admin/overview");
    } catch (error) {
      alertError(error);
    } finally {
      button.disabled = false;
    }
  });
  api("status")
    .then((state) => {
      if (state.authenticated) location.replace("/admin/overview");
    })
    .catch(() => {});
}
async function loadOverview() {
  try {
    const health = await api("health");
    $("#dbStatus").textContent = health.connected ? "Connected" : "Unavailable";
    $("#dbStatus").dataset.state = health.connected ? "good" : "bad";
    $("#postCount").textContent = health.posts;
    $("#commentCount").textContent = health.comments ?? "Pending bridge update";
    $("#healthTime").textContent = new Date(health.checked_at).toLocaleString();
  } catch (error) {
    $("#dbStatus").textContent = "Connection failed";
    $("#dbStatus").dataset.state = "bad";
    alertError(error);
  }
}
let posts = [];
async function loadPosts() {
  try {
    posts = await api("posts");
    renderPosts();
  } catch (error) {
    alertError(error);
  }
}
function renderPosts() {
  $("#postList").innerHTML = posts.length
    ? posts
        .map(
          (post) =>
            `<article class="admin-list-item post-row">${post.featured_image ? `<img src="${esc(post.featured_image)}" alt="">` : '<span class="post-image-placeholder">K</span>'}<div class="post-row-copy"><div class="post-labels"><span class="status-pill">${esc(post.status)}</span><span class="category-pill">${esc(post.category || "Software")}</span></div><h3>${esc(post.title)}</h3><p>${esc(post.excerpt)}</p><div class="admin-actions"><button class="button secondary" data-edit="${post.id}">Edit</button><button class="button danger" data-delete="${post.id}">Delete</button></div></div></article>`,
        )
        .join("")
    : '<div class="empty-state">No posts yet.</div>';
}
$("#postForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = Number($("#postId").value) || null,
    payload = {
      id,
      title: $("#title").value,
      slug: $("#slug").value,
      excerpt: $("#excerpt").value,
      content:
        window.tinymce?.get("content")?.getContent() || $("#content").value,
      status: $("#status").value,
      category: $("#category").value,
      featured_image: $("#featuredImage").value,
    };
  try {
    await api("posts", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    clearPost();
    await loadPosts();
    alertSuccess("Post saved");
  } catch (error) {
    alertError(error);
  }
});
$("#cancelEdit")?.addEventListener("click", clearPost);
$("#postList")?.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit]"),
    remove = event.target.closest("[data-delete]");
  if (edit) {
    const post = posts.find((item) => item.id == edit.dataset.edit);
    for (const key of ["id", "title", "slug", "excerpt", "status", "category"])
      $(`#${key === "id" ? "postId" : key}`).value = post[key] ?? "";
    $("#content").value = post.content ?? "";
    window.tinymce?.get("content")?.setContent(post.content ?? "");
    $("#featuredImage").value = post.featured_image ?? "";
    showImagePreview(post.featured_image);
    $("#editorTitle").textContent = "Edit post";
    scrollTo({ top: 0, behavior: "smooth" });
  }
  if (remove) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this post?",
      text: "Its likes and comments will also be deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#b43434",
    });
    if (!result.isConfirmed) return;
    try {
      await api("posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(remove.dataset.delete) }),
      });
      await loadPosts();
      alertSuccess("Post deleted");
    } catch (error) {
      alertError(error);
    }
  }
});
function clearPost() {
  $("#postForm")?.reset();
  if ($("#postId")) $("#postId").value = "";
  if ($("#editorTitle")) $("#editorTitle").textContent = "New post";
  if ($("#category")) $("#category").value = "Cybersecurity trends";
  window.tinymce?.get("content")?.setContent("");
  showImagePreview("");
}
$("#newPost")?.addEventListener("click", () => {
  clearPost();
  document
    .querySelector(".editor-card")
    ?.scrollIntoView({ behavior: "smooth" });
});
$("#excerpt")?.addEventListener("input", (event) => {
  $("#excerptCount").textContent = event.target.value.length;
});
$("#featuredImage")?.addEventListener("input", (event) =>
  showImagePreview(event.target.value),
);
$("#featuredImageFile")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 1572864) {
    event.target.value = "";
    return alertError(new Error("Featured images must be 1.5 MB or smaller."));
  }
  const reader = new FileReader();
  reader.onload = () => {
    $("#featuredImage").value = reader.result;
    showImagePreview(reader.result);
  };
  reader.onerror = () =>
    alertError(new Error("The selected image could not be read."));
  reader.readAsDataURL(file);
});
function showImagePreview(source) {
  const preview = $("#imagePreview");
  if (!preview) return;
  preview.innerHTML = source
    ? `<img src="${esc(source)}" alt="Featured image preview">`
    : "<span>No image selected</span>";
}
let comments = [];
async function loadComments() {
  try {
    const data = await api("comments");
    comments = data.comments || [];
    $("#commentList").innerHTML = comments.length
      ? comments
          .map(
            (comment) =>
              `<article class="admin-list-item"><div><span class="status-pill">${esc(comment.status)}</span><h3>${esc(comment.name)} on ${esc(comment.post_title)}</h3><p>${esc(comment.comment)}</p><small>${esc(comment.email)}</small></div><div class="admin-actions"><button class="button secondary" data-approve="${comment.id}">${comment.status === "approved" ? "Move to pending" : "Approve"}</button><button class="button danger" data-remove="${comment.id}">Delete</button></div></article>`,
          )
          .join("")
      : '<div class="empty-state">No comments yet.</div>';
  } catch (error) {
    alertError(error);
  }
}
$("#commentList")?.addEventListener("click", async (event) => {
  const approve = event.target.closest("[data-approve]"),
    remove = event.target.closest("[data-remove]");
  try {
    if (approve) {
      const item = comments.find(
        (comment) => comment.id == approve.dataset.approve,
      );
      await api("comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          status: item.status === "approved" ? "pending" : "approved",
        }),
      });
      await loadComments();
      alertSuccess("Comment updated");
    }
    if (remove) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Delete this comment?",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#b43434",
      });
      if (!result.isConfirmed) return;
      await api("comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(remove.dataset.remove) }),
      });
      await loadComments();
      alertSuccess("Comment deleted");
    }
  } catch (error) {
    alertError(error);
  }
});
async function loadSettings() {
  try {
    const data = await api("settings");
    $("#commentsEnabled").checked = !!data.comments_enabled;
    $("#settingsState").textContent = data.comments_enabled
      ? "Comments are open"
      : "Comments are closed";
  } catch (error) {
    alertError(error);
  }
}
$("#settingsForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const enabled = $("#commentsEnabled").checked;
    await api("settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments_enabled: enabled }),
    });
    $("#settingsState").textContent = enabled
      ? "Comments are open"
      : "Comments are closed";
    alertSuccess("Settings saved");
  } catch (error) {
    alertError(error);
  }
});
function esc(value = "") {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}
boot();
