window.App = window.App || {};

(function () {
  App.setupAddressField = function (root, user) {
    const input = root.querySelector('[data-field="address"]');
    if (!input) return;

    input.value = user.address || "";
  };
  App.setupPayMethodField = function (root, user) {
    const select = root.querySelector('[data-field="pay_method"]');
    if (!select) return;

    select.value = user.pay_method || "online";
  };
  App.setupEmailField = function (root, user) {
    const input = root.querySelector('[data-field="email"]');
    if (!input) return;
    input.value = user.email || "";
  };

  App.setupPhoneField = function (root, user) {
    const input = root.querySelector('[data-field="phone"]');
    if (!input) return;
    input.value = user.phone || "";
  };
})();
