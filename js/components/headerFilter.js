(function () {
  const nav = document.getElementById("header-filters");
  const main = document.querySelector("main");
  const tpl = document.getElementById("products-tpl");
  if (!nav || !main || !tpl) return;

  const root = document.body.dataset.root || "";

  const searchInput = document.querySelector(".search-bar__input");
  const searchForm = document.querySelector(".search-bar__form");
  let keyword = "";
  let priceMin = null;
  let priceMax = null;
  const priceUI = {}; // { btn, minInput, maxInput }

  // Mức chọn nhanh: sửa cho hợp với thang giá của shop bạn
  const PRICE_PRESETS = [
    { label: "Dưới 500.000đ",           min: null,    max: 500000 },
    { label: "500.000đ - 1.000.000đ",   min: 500000,  max: 1000000 },
    { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
    { label: "Trên 2.000.000đ",         min: 2000000, max: null }
  ];

  const norm = s => String(s ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

  // Tên biến dữ liệu: sửa cho đúng với các file data của bạn
  const GROUPS = [
    { field: "brand",    label: "Hãng",        data: () => typeof BRANDS !== "undefined" ? BRANDS : [] },
    { field: "category", label: "Thể loại",    data: () => typeof CATEGORIES !== "undefined" ? CATEGORIES : [] },
    { field: "kit_type", label: "Loại áo đấu", data: () => typeof KIT_TYPES !== "undefined" ? KIT_TYPES : [] },
    { field: "league",   label: "Giải đấu",    data: () => typeof LEAGUES !== "undefined" ? LEAGUES : [] },
    { field: "team",     label: "Đội",         data: () => typeof TEAMS !== "undefined" ? TEAMS : [] },
    { field: "season",   label: "Mùa giải",    data: () => typeof SEASONS !== "undefined" ? SEASONS : [] }
  ];

  // Link tới trang chi tiết: sửa cho đúng với products.js của bạn
  // Chuyển thẳng tới trang chi tiết, không kèm id
function productUrl() {
  const sample = document.querySelector(".all-products--rail .product[href]");
  if (sample) {
    // giữ nguyên đường dẫn, bỏ phần ?query và #hash
    return sample.getAttribute("href").split(/[?#]/)[0];
  }
  // Dự phòng: sửa tên file cho đúng với thư mục pages/ của bạn
  return `${root}pages/product_detail.html`;
}

  function toOption(item) {
    if (item && typeof item === "object") {
      const label = item.name ?? item.label ?? item.title ?? item.id;
      return { value: item.id ?? label, label: String(label) };
    }
    return { value: item, label: String(item) };
  }

  const selected = {}; // { field: {value, label} }
  const toggles = {};  // { field: button }

  /* ---------- Vùng kết quả ---------- */
  const results = document.createElement("section");
  results.className = "product-rail";
  results.hidden = true;
  results.innerHTML =
    '<div class="product-rail__head"><h2 class="product-rail__title">Kết quả lọc</h2>' +
    '<button type="button" class="header-filters__clear">Xoá lọc</button></div>' +
    '<p class="products-empty" hidden>Không có sản phẩm phù hợp.</p>' +
    '<div class="all-products"></div>';
  const rails = main.querySelectorAll(".product-rail");
  main.insertBefore(results, rails[0] || null);

  const grid = results.querySelector(".all-products");
  const empty = results.querySelector(".products-empty");

  function resetPrice() {
    priceMin = null;
    priceMax = null;
    if (priceUI.minInput) priceUI.minInput.value = "";
    if (priceUI.maxInput) priceUI.maxInput.value = "";
  }

  results.querySelector(".header-filters__clear").addEventListener("click", () => {
    Object.keys(selected).forEach(k => delete selected[k]);
    keyword = "";
    if (searchInput) searchInput.value = "";
    resetPrice();
    update();
  });

  function matches(p) {
    if (keyword && !norm(p.name).includes(keyword)) return false;
    const price = Number(p.price) || 0;
    if (priceMin !== null && price < priceMin) return false;
    if (priceMax !== null && price > priceMax) return false;
    return Object.entries(selected).every(([field, s]) => {
      const v = String(p[field] ?? "");
      return v === String(s.value) || v === s.label;
    });
  }

  function createCard(p) {
    const node = tpl.content.cloneNode(true);
    const a = node.querySelector(".product");
    const img = node.querySelector(".product__image");
    const imgs = typeof productImages === "function" ? productImages(p) : [];
    if (a) a.href = productUrl(p);
    if (img) {
      img.src = imgs.length ? getAssetPath(imgs[0]) : "";
      img.alt = p.name || "";
    }
    node.querySelector(".product__name").textContent = p.name || "";
    node.querySelector(".product__price").textContent = formatPrice(p.price);
    const old = node.querySelector(".product__price-old");
    if (old && p.oldPrice > p.price) {
      old.textContent = formatPrice(p.oldPrice);
      old.hidden = false;
    }
    return node;
  }

  function update() {
    const hasPrice = priceMin !== null || priceMax !== null;
    const active = Object.keys(selected).length > 0 || keyword !== "" || hasPrice;

    // nút tiêu đề hiện giá trị đang chọn
    GROUPS.forEach(g => {
      const btn = toggles[g.field];
      if (!btn) return;
      const s = selected[g.field];
      btn.firstChild.textContent = s ? `${g.label}: ${s.label}` : g.label;
      btn.classList.toggle("is-selected", !!s);
    });

    // nút Giá
    if (priceUI.btn) {
      const fmt = n => Number(n).toLocaleString("vi-VN") + "đ";
      let text = "Giá";
      if (priceMin !== null && priceMax !== null) text = `Giá: ${fmt(priceMin)} - ${fmt(priceMax)}`;
      else if (priceMin !== null) text = `Giá: từ ${fmt(priceMin)}`;
      else if (priceMax !== null) text = `Giá: đến ${fmt(priceMax)}`;
      priceUI.btn.firstChild.textContent = text;
      priceUI.btn.classList.toggle("is-selected", hasPrice);
    }

    nav.querySelectorAll(".header-filters__item[data-field]").forEach(el => {
      const s = selected[el.dataset.field];
      el.classList.toggle("is-active", !!s && String(s.value) === el.dataset.value);
    });

    rails.forEach(r => { r.hidden = active; });
    results.hidden = !active;
    if (!active) return;

    const list = ProductService.getAll().filter(p => !p.is_hidden && matches(p));
    empty.hidden = list.length > 0;
    grid.replaceChildren(...list.map(createCard));
  }

  /* ---------- Menu thả xuống ---------- */
  GROUPS.forEach(group => {
    const options = [].concat(group.data()).map(toOption);
    if (options.length === 0) return;

    const wrap = document.createElement("div");
    wrap.className = "header-filters__group";
    wrap.dataset.field = group.field;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "header-filters__toggle";
    btn.innerHTML = "<span></span><i class='fa-solid fa-chevron-down'></i>";
    btn.firstChild.textContent = group.label;
    toggles[group.field] = btn;

    const menu = document.createElement("div");
    menu.className = "header-filters__menu";

    options.forEach(opt => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "header-filters__item";
      item.dataset.field = group.field;
      item.dataset.value = String(opt.value);
      item.textContent = opt.label;
      item.addEventListener("click", () => {
        const cur = selected[group.field];
        if (cur && String(cur.value) === String(opt.value)) delete selected[group.field]; // bấm lại để bỏ chọn
        else selected[group.field] = opt;
        update();
        if (document.activeElement) document.activeElement.blur(); // đóng menu
      });
      menu.appendChild(item);
    });

    wrap.append(btn, menu);
    nav.appendChild(wrap);
  });

  /* ---------- Nhóm lọc theo giá ---------- */
  (function buildPriceGroup() {
    const wrap = document.createElement("div");
    wrap.className = "header-filters__group";
    wrap.dataset.field = "price";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "header-filters__toggle";
    btn.innerHTML = "<span></span><i class='fa-solid fa-chevron-down'></i>";
    btn.firstChild.textContent = "Giá";

    const menu = document.createElement("div");
    menu.className = "header-filters__menu header-filters__menu--price";

    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.min = "0";
    minInput.placeholder = "Từ";
    minInput.setAttribute("aria-label", "Giá thấp nhất");

    const maxInput = document.createElement("input");
    maxInput.type = "number";
    maxInput.min = "0";
    maxInput.placeholder = "Đến";
    maxInput.setAttribute("aria-label", "Giá cao nhất");

    // Mức chọn nhanh
    PRICE_PRESETS.forEach(p => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "header-filters__item";
      item.textContent = p.label;
      item.addEventListener("click", () => {
        priceMin = p.min;
        priceMax = p.max;
        minInput.value = p.min ?? "";
        maxInput.value = p.max ?? "";
        update();
        if (document.activeElement) document.activeElement.blur();
      });
      menu.appendChild(item);
    });

    // Nhập khoảng giá tuỳ ý
    const custom = document.createElement("div");
    custom.className = "header-filters__price-custom";

    const sep = document.createElement("span");
    sep.textContent = "–";

    const readNum = el => (el.value === "" ? null : Math.max(0, Number(el.value)));
    const apply = () => {
      priceMin = readNum(minInput);
      priceMax = readNum(maxInput);
      // nếu nhập ngược (từ > đến) thì tự đổi chỗ
      if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
        [priceMin, priceMax] = [priceMax, priceMin];
      }
      update();
    };
    minInput.addEventListener("input", apply);
    maxInput.addEventListener("input", apply);

    custom.append(minInput, sep, maxInput);
    menu.appendChild(custom);

    Object.assign(priceUI, { btn, minInput, maxInput });
    wrap.append(btn, menu);
    nav.appendChild(wrap);
  })();

  /* ---------- Tìm kiếm trên header ---------- */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      keyword = norm(searchInput.value);
      update();
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", e => e.preventDefault());
  }
})();