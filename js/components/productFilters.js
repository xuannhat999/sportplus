// Bộ lọc cho trang products-search: tìm kiếm + sắp xếp + lọc theo field.
// Toàn bộ trạng thái được lưu trong query string để F5 không mất state.
const FILTER_FIELDS = [
  { field: "brand", label: "Brand", values: () => BRANDS },
  { field: "category", label: "Category", values: () => CATEGORIES },
  { field: "kit_type", label: "Kit type", values: () => KIT_TYPES },
  { field: "league", label: "League", values: () => LEAGUES },
  { field: "team", label: "Team", values: () => TEAMS },
  { field: "season", label: "Season", values: () => SEASONS }
];

const FILTER_SORTERS = {
  az: (a, b) => a.name.localeCompare(b.name),
  za: (a, b) => b.name.localeCompare(a.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price
};

const FILTER_DEFAULT_SORT = "az";

function initProductFilters(products) {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

  const list = Array.isArray(products) ? products : [];
  const params = new URLSearchParams(location.search);

  // --- đọc trạng thái từ URL ---
  const sortParam = params.get("sort");
  const validSort = sortParam && Object.prototype.hasOwnProperty.call(FILTER_SORTERS, sortParam);

  const state = {
    keyword: (params.get("q") || "").trim(),
    sort: validSort ? sortParam : FILTER_DEFAULT_SORT,
    selected: {}
  };

  FILTER_FIELDS.forEach(item => {
    const valid = item.values();
    const picked = params.getAll(item.field).filter(value => valid.includes(value));
    state.selected[item.field] = new Set(picked);
  });

  // --- ghi trạng thái ngược lại URL ---
  function syncUrl() {
    const next = new URLSearchParams();

    if (state.keyword) {
      next.set("q", state.keyword);
    }

    next.set("sort", state.sort);

    FILTER_FIELDS.forEach(item => {
      state.selected[item.field].forEach(value => next.append(item.field, value));
    });

    const query = next.toString();
    const url = location.pathname + (query ? `?${query}` : "");

    try {
      history.replaceState(null, "", url);
    } catch (e) {
      // một số trình duyệt chặn replaceState khi mở file://
    }
  }

  function countByField(field, value) {
    return list.filter(p => p[field] === value).length;
  }

  function fieldBoxId(field) {
    return `filter-${field.replace(/_/g, "-")}`;
  }

  // Mở / thu gọn một nhóm filter
  function setGroupExpanded(field, expanded) {
    const id = fieldBoxId(field);
    const toggle = panel.querySelector(`.filter-panel__toggle[aria-controls="${id}"]`);
    const box = document.getElementById(id);
    if (!toggle || !box) return;

    toggle.setAttribute("aria-expanded", String(expanded));
    box.hidden = !expanded;

    const icon = toggle.querySelector(".filter-panel__toggle-icon");
    if (icon) {
      icon.classList.toggle("fa-chevron-down", !expanded);
      icon.classList.toggle("fa-chevron-up", expanded);
    }
  }

  // Badge số giá trị đang chọn của 1 nhóm
  function updateFieldBadge(item) {
    const toggle = panel.querySelector(`.filter-panel__toggle[aria-controls="${fieldBoxId(item.field)}"]`);
    if (!toggle) return;

    const badge = toggle.querySelector(".filter-panel__label-count");
    if (!badge) return;

    const count = state.selected[item.field].size;
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  function renderOptions(item) {
    const box = document.getElementById(fieldBoxId(item.field));
    if (!box) return;

    box.replaceChildren(...item.values().map(value => {
      const label = document.createElement("label");
      label.className = "filter-panel__option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = `filter-${item.field}`;
      input.value = value;
      input.checked = state.selected[item.field].has(value);
      input.addEventListener("change", () => {
        if (input.checked) {
          state.selected[item.field].add(value);
        } else {
          state.selected[item.field].delete(value);
        }
        updateFieldBadge(item);
        applyFilters();
      });

      const text = document.createElement("span");
      text.textContent = value;

      const count = document.createElement("span");
      count.className = "filter-panel__option-count";
      count.textContent = countByField(item.field, value);

      label.append(input, text, count);
      return label;
    }));

    updateFieldBadge(item);
  }

  function applyFilters() {
    const keyword = state.keyword.toLowerCase();

    let result = list.filter(product => {
      if (keyword && !product.name.toLowerCase().includes(keyword)) return false;

      return FILTER_FIELDS.every(item => {
        const selected = state.selected[item.field];
        if (selected.size === 0) return true;
        return selected.has(product[item.field]);
      });
    });

    const sorter = FILTER_SORTERS[state.sort] || FILTER_SORTERS.az;
    result = [...result].sort(sorter);

    renderProducts(result);
    syncUrl();
  }

  function initToggles() {
    const toggles = panel.querySelectorAll(".filter-panel__toggle");

    toggles.forEach(toggle => {
      const id = toggle.getAttribute("aria-controls");
      const field = FILTER_FIELDS.find(item => fieldBoxId(item.field) === id);
      if (!field) return;

      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        setGroupExpanded(field.field, !isOpen);
      });
    });
  }

  FILTER_FIELDS.forEach(renderOptions);
  initToggles();

  // Mở sẵn nhóm đang có giá trị được chọn để sau khi reload vẫn thấy đúng trạng thái
  FILTER_FIELDS.forEach(item => {
    if (state.selected[item.field].size > 0) {
      setGroupExpanded(item.field, true);
    }
  });

  const searchInput = document.getElementById("filter-search");
  if (searchInput) {
    searchInput.value = state.keyword;
    searchInput.addEventListener("input", () => {
      state.keyword = searchInput.value.trim();
      applyFilters();
    });
  }

  const sortSelect = document.getElementById("filter-sort");
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      applyFilters();
    });
  }

  applyFilters();
}
