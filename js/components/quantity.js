window.App = window.App || {};

(function () {
  const QUANTITY_MIN = 1;
  const QUANTITY_MAX = 99;

  // Bộ chỉnh số lượng dùng chung: nút trừ - ô nhập - nút cộng.
  // Dùng lại cho trang chi tiết sản phẩm và trang giỏ hàng.
  App.createQuantityControl = function (options) {
    const opts = options || {};

    const min = Number.isNaN(Number(opts.min)) ? QUANTITY_MIN : Number(opts.min);
    const max = Number.isNaN(Number(opts.max)) ? QUANTITY_MAX : Number(opts.max);
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
    input.min = min;
    input.max = max;
    input.step = 1;
    input.inputMode = "numeric";
    input.setAttribute("aria-label", "Số lượng");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty__btn qty__btn--plus";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Tăng số lượng");

    const clamp = value => Math.min(max, Math.max(min, value));

    let current = clamp(Number.isNaN(Number(opts.value)) ? min : Number(opts.value));

    const syncButtons = qty => {
      minus.disabled = qty <= min;
      plus.disabled = qty >= max;
    };

    const apply = (value, notify = true) => {
      const qty = clamp(Number.isNaN(value) ? min : value);
      const changed = qty !== current;

      current = qty;
      input.value = qty;
      syncButtons(qty);

      if (notify && changed && typeof opts.onChange === "function") {
        opts.onChange(qty);
      }

      return qty;
    };

    const parse = () => {
      const value = Number.parseInt(input.value, 10);
      return Number.isNaN(value) ? min : clamp(value);
    };

    minus.addEventListener("click", () => apply(parse() - 1));
    plus.addEventListener("click", () => apply(parse() + 1));

    // kẹp giá trị ngay khi gõ
    input.addEventListener("input", () => {
      const value = Number.parseInt(input.value, 10);
      if (Number.isNaN(value)) {
        syncButtons(min);
        return;
      }

      if (value < min) input.value = min;
      else if (value > max) input.value = max;

      syncButtons(clamp(value));
    });

    input.addEventListener("change", () => apply(parse()));
    input.addEventListener("blur", () => apply(parse()));

    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        apply(parse());
        input.blur();
      }
    });

    element.append(minus, input, plus);
    apply(current, false);

    return {
      element,
      input,
      getValue: () => current,
      setValue: value => apply(value, false)
    };
  };
})();
