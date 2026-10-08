window.Swal = {
  fire(options = {}) {
    return new Promise((resolve) => {
      document.querySelector(".local-alert-layer")?.remove();
      const layer = document.createElement("div");
      layer.className = "local-alert-layer";
      const icon =
        options.icon === "success"
          ? "✓"
          : options.icon === "warning"
            ? "!"
            : "×";
      layer.innerHTML = `<section class="local-alert" role="alertdialog" aria-modal="true"><span class="local-alert-icon ${options.icon || "info"}">${icon}</span><h2>${safe(options.title || "Notice")}</h2>${options.text ? `<p>${safe(options.text)}</p>` : ""}<div class="local-alert-actions">${options.showCancelButton ? '<button class="button secondary" data-cancel>Cancel</button>' : ""}<button class="button primary" data-confirm>${safe(options.confirmButtonText || "OK")}</button></div></section>`;
      document.body.append(layer);
      const finish = (isConfirmed) => {
        if (!layer.isConnected) return;
        layer.remove();
        resolve({ isConfirmed });
      };
      layer
        .querySelector("[data-confirm]")
        .addEventListener("click", () => finish(true));
      layer
        .querySelector("[data-cancel]")
        ?.addEventListener("click", () => finish(false));
      if (options.timer) setTimeout(() => finish(true), options.timer);
    });
  },
};
function safe(value) {
  const node = document.createElement("div");
  node.textContent = String(value);
  return node.innerHTML;
}
