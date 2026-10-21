window.App = window.App || {};

(function () {
  const ACCOUNT_ROLE_LABELS = {
    admin: "Quản trị viên",
    buyer: "Người mua"
  };

  const ACCOUNT_STATUS_LABELS = {
    active: "Đang hoạt động",
    locked: "Đã bị khoá"
  };

  const ACCOUNT_EMPTY_TEXT = "Chưa cập nhật";
  const ACCOUNT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function formatAccountValue(value, fallback = ACCOUNT_EMPTY_TEXT) {
    const text = value === null || value === undefined ? "" : String(value).trim();
    return text || fallback;
  }

  function getAccountValues(user) {
    return {
      id: formatAccountValue(user.id),
      name: formatAccountValue(user.name),
      role: formatAccountValue(ACCOUNT_ROLE_LABELS[user.role] || user.role),
      status: user.is_locked ? ACCOUNT_STATUS_LABELS.locked : ACCOUNT_STATUS_LABELS.active
    };
  }

  function showHint(el, message, isError = false) {
    if (!el) return;

    el.textContent = message;
    el.hidden = !message;
    el.classList.toggle("account__hint--error", isError);
  }

  function setupEmailField(root, user) {
    const input = root.querySelector('[data-field="email"]');
    const errorEl = root.querySelector('[data-error="email"]');
    if (!input) return;

    input.value = user.email || "";

    input.addEventListener("change", () => {
      const value = input.value.trim();

      if (!value) {
        showHint(errorEl, "Vui lòng nhập email.", true);
        return;
      }

      if (!ACCOUNT_EMAIL_PATTERN.test(value)) {
        showHint(errorEl, "Email không hợp lệ.", true);
        return;
      }

      const owner = findUserByEmail(value);
      if (owner && Number(owner.id) !== Number(user.id)) {
        showHint(errorEl, "Email này đã được sử dụng.", true);
        return;
      }

      const updated = updateUserEmail(user.id, value);
      if (!updated) {
        showHint(errorEl, "Không cập nhật được email.", true);
        return;
      }

      user.email = updated.email;
      showHint(errorEl, "");
    });
  }

  function renderAccountEmpty(container, text) {
    const tpl = document.getElementById("account-empty-tpl");
    if (!tpl) return;

    const node = tpl.content.cloneNode(true);
    const empty = node.querySelector(".account__empty");

    node.querySelector(".account__empty-text").textContent = text;

    const btn = empty.querySelector(".account__btn-login");
    if (btn) {
      btn.addEventListener("click", () => goToAuth("pages/account.html"));
    }

    container.replaceChildren(empty);
  }

  function renderAccountInfo(user) {
    const container = document.getElementById("account-info");
    const tpl = document.getElementById("account-tpl");
    if (!container || !tpl) return;

    if (!user) {
      renderAccountEmpty(container, "Bạn chưa đăng nhập.");
      return;
    }

    const node = tpl.content.cloneNode(true);
    const values = getAccountValues(user);

    node.querySelectorAll("[data-field]").forEach(el => {
      const field = el.dataset.field;
      if (!(field in values)) return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return;
      el.textContent = values[field];
    });

    setupEmailField(node, user);
    App.setupPayMethodField(node, user);
    App.setupAddressField(node, user);

    const logoutBtn = node.querySelector(".account__btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => logout());
    }

    container.replaceChildren(node);
  }

  App.initAccount = function () {
    const user = getCurrentUser();

    renderAccountInfo(user);

    document.addEventListener("auth:change", () => {
      renderAccountInfo(getCurrentUser());
    });
  };
})();
