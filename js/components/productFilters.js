const PRICE_PRESETS = [
  { label: "Dưới 500.000đ", min: null, max: 500000 },
  { label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
  { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000đ", min: 2000000, max: null }
];

const FILTER_FIELDS = [
  { field: "brand", label: "Hãng", values: () => BRANDS },
  { field: "category", label: "Thể loại", values: () => CATEGORIES, labels: () => CATEGORY_LABELS },
  { field: "kit_type", label: "Loại áo đấu", values: () => KIT_TYPES, labels: () => KIT_TYPE_LABELS },
  { field: "league", label: "Giải đấu", values: () => LEAGUES, labels: () => LEAGUE_LABELS },
  { field: "team", label: "Đội", values: () => TEAMS, labels: () => TEAM_LABELS },
  { field: "season", label: "Mùa giải", values: () => SEASONS },
  { field: "price", label: "Giá", values: () => PRICE_PRESETS.map(item => item.label) }
];

function initProductFilters() {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

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

  function renderOptions(item) {
    const box = document.getElementById(fieldBoxId(item.field));
    if (!box) return;

    if (item.field === "price") {
      const wrap = document.createElement("div");
      wrap.className = "filter-panel__price-range";

      const mk = (placeholder, aria) => {
        const el = document.createElement("input");
        el.type = "number";
        el.min = "0";
        el.className = "filter-panel__price-input";
        el.placeholder = placeholder;
        el.setAttribute("aria-label", aria);
        return el;
      };

      const minInput = mk("Từ", "Giá thấp nhất");
      const sep = document.createElement("span");
      sep.className = "filter-panel__price-sep";
      sep.textContent = "-";
      const maxInput = mk("Đến", "Giá cao nhất");

      wrap.append(minInput, sep, maxInput);
      box.replaceChildren(wrap);
      return;
    }

    box.replaceChildren(...item.values().map(value => {
      const label = document.createElement("label");
      label.className = "filter-panel__option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = `filter-${item.field}`;
      input.value = value;

      const text = document.createElement("span");
      text.textContent = getFilterLabel(item, value);

      label.append(input, text);
      return label;
    }));
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
}
