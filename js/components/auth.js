window.App = window.App || {};

(function () {
  // Hàm lấy đường dẫn chuyển hướng an toàn (hoặc về thẳng index.html)
  function getSafeRedirect() {
    const target = new URLSearchParams(location.search).get("redirect") || "";
    if (!target) return "index.html";
    if (/^(https?:)?\/\//i.test(target) || target.includes("..")) return "index.html";
    return target;
  }

  function initAuth() {
    const authForm = document.querySelector(".auth__form");
    if (!authForm) return;

    // Xử lý sự kiện bấm nút chuyển qua lại giữa Đăng nhập và Đăng ký (nếu giao diện có dùng)
    const switchBtn = document.querySelector("[data-auth-switch]");
    const titleEl = document.querySelector(".auth__title");
    const submitBtn = document.querySelector("[data-auth-submit]");
    const confirmField = document.querySelector("[data-auth-confirm]");
    const subtitleEl = document.querySelector("[data-auth-subtitle]");

    if (switchBtn) {
      switchBtn.addEventListener("click", function () {
        const isRegisterMode = confirmField && confirmField.hasAttribute("hidden");
        
        if (isRegisterMode) {
          // Chuyển sang giao diện Đăng ký
          if (confirmField) confirmField.removeAttribute("hidden");
          if (titleEl) titleEl.textContent = "Đăng ký";
          if (submitBtn) submitBtn.textContent = "Đăng nhập";
          if (switchBtn) switchBtn.textContent = "Đăng ký";
          if (subtitleEl) subtitleEl.textContent = "Tạo tài khoản mới để bắt đầu mua sắm.";
        } else {
          // Chuyển lại giao diện Đăng nhập
          if (confirmField) confirmField.setAttribute("hidden", "true");
          if (titleEl) titleEl.textContent = "Đăng nhập";
          if (submitBtn) submitBtn.textContent = "Đăng nhập";
          if (switchBtn) switchBtn.textContent = "Đăng kí";
          if (subtitleEl) subtitleEl.textContent = "Đăng nhập để tiếp tục mua sắm.";
        }
      });
    }

    // Xử lý chung sự kiện submit cho CẢ ĐĂNG NHẬP VÀ ĐĂNG KÝ
    authForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Chặn hành vi submit mặc định của trình duyệt

      // Tạo sẵn đối tượng user giả lập quyền admin
      const adminUser = {
        id: 1,
        name: "Administrator",
        email: "admin@sportplus.com",
        role: "admin",
        address: "Sài Gòn",
        pay_method: "online",
        is_locked: false
      };

      // Gọi trực tiếp hàm login lưu vào bộ nhớ tạm
      if (typeof login === "function") {
        login(adminUser);
      }

      // Xác định đường dẫn đích để quay về trang chủ hoặc trang trước đó
      const rootPath = document.body.dataset.root || "";
      const targetHome = typeof getAssetPath === "function" ? getAssetPath("index.html") : `${rootPath}index.html`;

      const safeTarget = getSafeRedirect();
      const destination = (safeTarget === "index.html") 
        ? targetHome 
        : (typeof getAssetPath === "function" ? getAssetPath(safeTarget) : `${rootPath}${safeTarget}`);

      // Chuyển hướng thẳng về trang chủ ngay lập tức mà không cần kiểm tra gì thêm
      location.href = destination;
    });
  }

  // Gắn vào App object để hệ thống gọi khởi tạo
  window.App.initAuth = initAuth;

  // Tự động chạy khi DOM đã sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    initAuth();
  });
})();