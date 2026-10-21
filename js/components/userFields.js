window.App = window.App || {};

(function () {
  const FIELD_ERROR_CLASS = "field__hint--error";

  function showFieldHint(el, message, isError = false) {
    if (!el) return;

    el.textContent = message;
    el.hidden = !message;
    el.classList.toggle(FIELD_ERROR_CLASS, isError);
  }

  App.setupAddressField = function (root, user) {
    const input = root.querySelector('[data-field="address"]');
    const hintEl = root.querySelector('[data-hint="address"]');
    if (!input) return;

    input.value = user.address || "";

    input.addEventListener("change", () => {
      const value = input.value.trim();
      if (!value) {
        showFieldHint(hintEl, "Vui lòng nhập địa chỉ.", true);
        input.value = user.address || "";
        return;
      }

      const updated = updateUserAddress(user.id, value);
      if (!updated) {
        showFieldHint(hintEl, "Không lưu được địa chỉ.", true);
        return;
      }

      user.address = updated.address;
      showFieldHint(hintEl, "Đã cập nhật địa chỉ.");
    });
  };

  // Select phương thức thanh toán, lưu lại khi thay đổi.
  // Dùng chung cho trang tài khoản và trang giỏ hàng.
  App.setupPayMethodField = function (root, user) {
    const select = root.querySelector('[data-field="pay_method"]');
    const hintEl = root.querySelector('[data-hint="pay_method"]');
    if (!select) return;

    select.value = user.pay_method || "online";

    select.addEventListener("change", () => {
      const updated = updatePayMethod(user.id, select.value);
      if (!updated) {
        showFieldHint(hintEl, "Không cập nhật được phương thức thanh toán.", true);
        return;
      }

      user.pay_method = updated.pay_method;
      showFieldHint(hintEl, "Đã cập nhật phương thức thanh toán.");
    });
  };

  App.showFieldHint = showFieldHint;
})();
