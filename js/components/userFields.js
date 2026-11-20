window.App = window.App || {};

(function () {
  // Điền địa chỉ của người dùng hiện tại vào ô nhập.
  App.setupAddressField = function (root, user) {
    const input = root.querySelector('[data-field="address"]');
    if (!input) return;

    input.value = user.address || "";
  };

  // Điền phương thức thanh toán của người dùng hiện tại vào select.
  // Dùng chung cho trang tài khoản và trang giỏ hàng.
  App.setupPayMethodField = function (root, user) {
    const select = root.querySelector('[data-field="pay_method"]');
    if (!select) return;

    select.value = user.pay_method || "online";
  };
})();
