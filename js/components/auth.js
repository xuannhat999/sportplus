window.App = window.App || {};

(function () {
  const AUTH_MODE_LOGIN = "login";
  const AUTH_MODE_REGISTER = "register";

  const AUTH_MIN_PASSWORD_LENGTH = 6;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let mode = AUTH_MODE_LOGIN;

  // Trang sẽ quay lại sau khi đăng nhập, chỉ nhận đường dẫn nội bộ của site
  function getSafeRedirect() {
    const target = new URLSearchParams(location.search).get("redirect") || "";
    if (!target) return "index.html";
    if (/^(https?:)?\/\//i.test(target) || target.includes("..")) return "index.html";
    return target;
  }

  function showError(message) {
    const box = document.querySelector("[data-auth-error]");
    if (!box) return;

    box.textContent = message;
    box.hidden = false;
  }

  function hideError() {
    const box = document.querySelector("[data-auth-error]");
    if (!box) return;

    box.textContent = "";
    box.hidden = true;
  }

  // Chuyển giữa 2 chế độ: đăng nhập / đăng kí.
  // Chế độ đăng kí bổ sung ô nhập lại mật khẩu.
  function setMode(nextMode) {
    mode = nextMode === AUTH_MODE_REGISTER ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN;

    const isRegister = mode === AUTH_MODE_REGISTER;

    const title = document.querySelector(".auth__title");
    const subtitle = document.querySelector("[data-auth-subtitle]");
    const submitBtn = document.querySelector("[data-auth-submit]");
    const switchBtn = document.querySelector("[data-auth-switch]");
    const confirmField = document.querySelector("[data-auth-confirm]");
    const confirmInput = document.getElementById("auth-confirm-password");
    const passwordInput = document.getElementById("auth-password");

    if (title) title.textContent = isRegister ? "Đăng kí" : "Đăng nhập";
    if (subtitle) {
      subtitle.textContent = isRegister
        ? "Tạo tài khoản mới để tiếp tục mua sắm."
        : "Đăng nhập để tiếp tục mua sắm.";
    }
    if (submitBtn) submitBtn.textContent = isRegister ? "Đăng kí" : "Đăng nhập";
    if (switchBtn) switchBtn.textContent = isRegister ? "Đăng nhập" : "Đăng kí";
    if (confirmField) confirmField.hidden = !isRegister;
    if (confirmInput) confirmInput.required = isRegister;
    if (passwordInput) {
      passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
    }

    hideError();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const confirmInput = document.getElementById("auth-confirm-password");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email) return showError("Vui lòng nhập email.");
    if (!EMAIL_PATTERN.test(email)) return showError("Email không hợp lệ.");
    if (!password) return showError("Vui lòng nhập mật khẩu.");
    if (password.length < AUTH_MIN_PASSWORD_LENGTH) {
      return showError(`Mật khẩu phải có ít nhất ${AUTH_MIN_PASSWORD_LENGTH} ký tự.`);
    }

    if (mode === AUTH_MODE_REGISTER) {
      const confirm = confirmInput ? confirmInput.value : "";
      if (!confirm) return showError("Vui lòng nhập lại mật khẩu.");
      if (confirm !== password) return showError("Mật khẩu xác nhận không khớp.");

      if (findUserByEmail(email)) return showError("Email này đã được đăng ký.");

      const newUser = registerUser({ name: nameFromEmail(email), email, password });
      if (!newUser) return showError("Đăng kí không thành công, vui lòng thử lại.");

      login(newUser);
    } else {
      const result = authenticate(email, password);
      if (!result.ok) return showError(result.message);

      login(result.user);
    }

    document.dispatchEvent(new CustomEvent("auth:change", { detail: getCurrentUser() }));
    location.replace(getAssetPath(getSafeRedirect()));
  }

  function nameFromEmail(email) {
    const raw = String(email || "").split("@")[0].replace(/[._-]+/g, " ").trim();
    if (!raw) return "Người dùng";
    return raw.replace(/\b\w/g, char => char.toUpperCase());
  }

  App.initAuth = function () {
    const form = document.querySelector(".auth__form");
    if (!form) return;

    // đã đăng nhập rồi -> vào thẳng trang được yêu cầu
    if (getCurrentUser()) {
      location.replace(getAssetPath(getSafeRedirect()));
      return;
    }

    form.addEventListener("submit", handleSubmit);

    const switchBtn = document.querySelector("[data-auth-switch]");
    if (switchBtn) {
      switchBtn.addEventListener("click", () => {
        setMode(mode === AUTH_MODE_LOGIN ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
        const emailInput = document.getElementById("auth-email");
        if (emailInput) emailInput.focus();
      });
    }

    setMode(AUTH_MODE_LOGIN);
  };
})();
