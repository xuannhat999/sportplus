(function () {
  const nav = document.getElementById("header-filters");
  if (!nav) return;

  // Trang tìm kiếm đã có bộ lọc riêng ở cột bên trái
  if (document.body.dataset.page === "products_search") {
    nav.hidden = true;
    return;
  }

  const root = document.body.dataset.root || "";
  const searchUrl = root + "pages/products_search.html";

  const PRICE_PRESETS = [
    { label: "Dưới 500.000đ",           min: null,    max: 500000 },
    { label: "500.000đ - 1.000.000đ",   min: 500000,  max: 1000000 },
    { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
    { label: "Trên 2.000.000đ",         min: 2000000, max: null }
  ];

  const GROUPS = [
    { field: "brand",    label: "Hãng",        data: () => typeof BRANDS !== "undefined" ? BRANDS : null },
    { field: "category", label: "Thể loại",    data: () => typeof CATEGORIES !== "undefined" ? CATEGORIES : null },
    { field: "kit_type", label: "Loại áo đấu", data: () => typeof KIT_TYPES !== "undefined" ? KIT_TYPES : null },
    { field: "league",   label: "Giải đấu",    data: () => typeof LEAGUES !== "undefined" ? LEAGUES : null },
    { field: "team",     label: "Đội",         data: () => typeof TEAMS !== "undefined" ? TEAMS : null },
    { field: "season",   label: "Mùa giải",    data: () => typeof SEASONS !== "undefined" ? SEASONS : null }
  ];

  function toOption(item) {
    if (item && typeof item === "object") {
      const label = item.name ?? item.label ?? item.title ?? item.id;
      return { value: item.id ?? label, label: String(label) };
    }
    return { value: item, label: String(item) };
  }

  // Trang không nạp file data thì lấy giá trị có thật từ sản phẩm
  function optionsFor(group) {
    const data = group.data();
    if (data && [].concat(data).length) return [].concat(data).map(toOption);
    if (typeof ProductService === "undefined") return [];
    const set = new Set();
    ProductService.getAll().forEach(p => { if (p[group.field]) set.add(String(p[group.field])); });
    return [...set].sort((a, b) => a.localeCompare(b, "vi")).map(v => ({ value: v, label: v }));
  }

  function go() {
  location.href = searchUrl;
}

  function makeGroup(field, label) {
    const wrap = document.createElement("div");
    wrap.className = "header-filters__group";
    wrap.dataset.field = field;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "header-filters__toggle";
    btn.innerHTML = "<span></span><i class='fa-solid fa-chevron-down'></i>";
    btn.firstChild.textContent = label;

    const menu = document.createElement("div");
    menu.className = "header-filters__menu";

    wrap.append(btn, menu);
    nav.appendChild(wrap);
    return { wrap, menu };
  }

  /* ---------- Các nhóm loại ---------- */
  GROUPS.forEach(group => {
    const options = optionsFor(group);
    if (options.length === 0) return;

    const { menu } = makeGroup(group.field, group.label);
    options.forEach(opt => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "header-filters__item";
      item.textContent = opt.label;
      item.addEventListener("click", () => go({ [group.field]: opt.value }));
      menu.appendChild(item);
    });
  });

  /* ---------- Nhóm giá ---------- */
  (function () {
    const { menu } = makeGroup("price", "Giá");
    menu.classList.add("header-filters__menu--price");

    PRICE_PRESETS.forEach(p => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "header-filters__item";
      item.textContent = p.label;
      item.addEventListener("click", () => go({ pmin: p.min, pmax: p.max }));
      menu.appendChild(item);
    });

    const custom = document.createElement("div");
    custom.className = "header-filters__price-custom";

    const mk = (ph, aria) => {
      const el = document.createElement("input");
      el.type = "number";
      el.min = "0";
      el.placeholder = ph;
      el.setAttribute("aria-label", aria);
      return el;
    };
    const minInput = mk("Từ", "Giá thấp nhất");
    const maxInput = mk("Đến", "Giá cao nhất");
    const sep = document.createElement("span");
    sep.textContent = "–";

    const apply = () => {
      let a = minInput.value === "" ? null : Number(minInput.value);
      let b = maxInput.value === "" ? null : Number(maxInput.value);
      if (a !== null && b !== null && a > b) [a, b] = [b, a];
      go({ pmin: a, pmax: b });
    };
    [minInput, maxInput].forEach(el =>
      el.addEventListener("keydown", e => { if (e.key === "Enter") apply(); }));

    custom.append(minInput, sep, maxInput);
    menu.appendChild(custom);
  })();
})();