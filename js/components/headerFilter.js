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
})();