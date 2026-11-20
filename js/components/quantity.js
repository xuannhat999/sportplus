window.App = window.App || {};

(function () {
  // Bộ chỉnh số lượng chỉ để hiển thị: không xử lý sự kiện.
  App.createQuantityControl = function (options) {
    const opts = options || {};
    const sizeClass = opts.size === "sm" ? " qty--sm" : "";

    const element = document.createElement("div");
    element.className = `qty${sizeClass}`;

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty__btn qty__btn--minus";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Giảm số lượng");

    const input = document.createElement("input");
    input.type = "number";
    input.className = "qty__input";
    input.min = opts.min ?? 1;
    input.max = opts.max ?? 99;
    input.step = 1;
    input.inputMode = "numeric";
    input.value = opts.value ?? 1;
    input.setAttribute("aria-label", "Số lượng");
    input.readOnly = true;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty__btn qty__btn--plus";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Tăng số lượng");

    element.append(minus, input, plus);

    return {
      element,
      input,
      getValue: () => Number(input.value) || 0
    };
  };
})();
