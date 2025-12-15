window.Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(message, title = "", type = "info", duration = 500000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ""}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  },

  success(message, title = "Success") {
    return this.show(message, title, "success");
  },

  error(message, title = "Error") {
    return this.show(message, title, "error");
  },

  warning(message, title = "Warning") {
    return this.show(message, title, "warning");
  },

  info(message, title = "") {
    return this.show(message, title, "info");
  },
};
