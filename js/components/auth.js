window.App = window.App || {};

(function () {
  function initAuth() {
    const authForm = document.querySelector(".auth__form");
    const switchBtn = document.querySelector("[data-auth-switch]");

    // Submit form: chặn hành vi mặc định rồi điều hướng về trang chủ.
    if (authForm) {
      authForm.addEventListener("submit", function (e) {
        e.preventDefault();
        location.href = getAssetPath("index.html");
      });
    }

    // Nút chuyển đổi đăng nhập/đăng ký: điều hướng về trang chủ.
    if (switchBtn) {
      switchBtn.addEventListener("click", function () {
        location.href = getAssetPath("index.html");
      });
    }
  }

  // Gắn vào App object để hệ thống gọi khởi tạo
  window.App.initAuth = initAuth;
})();
