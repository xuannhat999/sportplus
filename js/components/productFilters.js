const FILTER_FIELDS = [
  { field: "brand", label: "Hãng", values: () => BRANDS },
  { field: "category", label: "Thể loại", values: () => CATEGORIES, labels: () => CATEGORY_LABELS },
  { field: "kit_type", label: "Loại áo đấu", values: () => KIT_TYPES, labels: () => KIT_TYPE_LABELS },
  { field: "league", label: "Giải đấu", values: () => LEAGUES, labels: () => LEAGUE_LABELS },
  { field: "team", label: "Đội", values: () => TEAMS, labels: () => TEAM_LABELS },
  { field: "season", label: "Mùa giải", values: () => SEASONS }
];

const FILTER_SORTERS = {
  az: (a, b) => a.name.localeCompare(b.name),
  za: (a, b) => b.name.localeCompare(a.name),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price
};

const FILTER_DEFAULT_SORT = "az";

// Lưới kết quả luôn 5 cột, mỗi trang tối đa 6 dòng
const FILTER_PAGE_COLUMNS = 5;
const FILTER_PAGE_ROWS = 6;
const FILTER_PAGE_SIZE = FILTER_PAGE_COLUMNS * FILTER_PAGE_ROWS;

function initProductFilters(products) {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

  const list = Array.isArray(products) ? products : [];
  const params = new URLSearchParams(location.search);

  const sortParam = params.get("sort");
  const validSort = sortParam && Object.prototype.hasOwnProperty.call(FILTER_SORTERS, sortParam);

  const pageParam = Number.parseInt(params.get("page"), 10);
  const validPage = !Number.isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

  const state = {
    keyword: (params.get("q") || "").trim(),
    sort: validSort ? sortParam : FILTER_DEFAULT_SORT,
    page: validPage,
    selected: {}
  };

  FILTER_FIELDS.forEach(item => {
    const valid = item.values();
    const picked = params.getAll(item.field).filter(value => valid.includes(value));
    state.selected[item.field] = new Set(picked);
  });

  function syncUrl() {
    const next = new URLSearchParams();

    if (state.keyword) {
      next.set("q", state.keyword);
    }

    next.set("sort", state.sort);

    if (state.page > 1) {
      next.set("page", state.page);
    }

    FILTER_FIELDS.forEach(item => {
      state.selected[item.field].forEach(value => next.append(item.field, value));
    });

    const query = next.toString();
    const url = location.pathname + (query ? `?${query}` : "");

    try {
      history.replaceState(null, "", url);
    } catch (e) {
    }
  }

  function countByField(field, value) {
    return list.filter(p => p[field] === value).length;
  }

  function fieldBoxId(field) {
    return `filter-${field.replace(/_/g, "-")}`;
  }

  function getFilterLabel(item, value) {
    const labels = item.labels ? item.labels() : null;
    return (labels && labels[value]) || value;
  }

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
        state.page = 1;
        applyFilters();
      });

      const text = document.createElement("span");
      text.textContent = getFilterLabel(item, value);

      label.append(input, text);
      return label;
    }));

    updateFieldBadge(item);
  }

  function renderPagination(total) {
    const el = document.getElementById("pagination");

    App.renderPagination(el, {
      total,
      page: state.page,
      pageSize: FILTER_PAGE_SIZE,
      onChange: page => {
        state.page = page;
        applyFilters();
        scrollToResults();
      }
    });
  }

  function scrollToResults() {
    const results = document.querySelector(".search-page__results");
    if (!results || typeof results.scrollIntoView !== "function") return;

    results.scrollIntoView({ behavior: "smooth", block: "start" });
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

    // giới hạn trang hợp lệ
    const totalPages = Math.max(1, Math.ceil(result.length / FILTER_PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    const start = (state.page - 1) * FILTER_PAGE_SIZE;
    renderProducts(result.slice(start, start + FILTER_PAGE_SIZE));

    renderPagination(result.length);
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
      state.page = 1;
      applyFilters();
    });
  }

  const sortSelect = document.getElementById("filter-sort");
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.page = 1;
      applyFilters();
    });
  }

  applyFilters();
}
