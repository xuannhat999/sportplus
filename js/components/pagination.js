window.App = window.App || {};

(function () {
  const MAX_PAGE_BUTTONS = 7;

  function createPageItem(page, label, isActive, onClick) {
    const item = document.createElement("li");
    item.className = "pagination__item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = isActive ? "pagination__btn is-active" : "pagination__btn";
    button.textContent = label;
    button.setAttribute("aria-label", `Trang ${page}`);

    if (isActive) button.setAttribute("aria-current", "page");

    button.addEventListener("click", () => onClick(page));

    item.append(button);
    return item;
  }

  function createGapItem() {
    const item = document.createElement("li");
    item.className = "pagination__item pagination__item--gap";
    item.textContent = "…";

    return item;
  }

  // Danh sách số trang cần hiển thị, dùng "…" khi bị cắt ở hai đầu
  function getPageRange(currentPage, totalPages) {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(MAX_PAGE_BUTTONS / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
    start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);

    const pages = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("…");
    }

    for (let page = start; page <= end; page++) pages.push(page);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }

    return pages;
  }

  // Vẽ thanh phân trang: nút Trước / Sau + danh sách số trang
  App.renderPagination = function (el, options) {
    if (!el) return;

    const { total, page, pageSize, onChange } = options;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (totalPages <= 1) {
      el.hidden = true;
      el.replaceChildren();
      return;
    }

    el.hidden = false;

    const prevBtn = el.querySelector("[data-page-prev]");
    const nextBtn = el.querySelector("[data-page-next]");
    const list = el.querySelector("[data-page-list]");

    if (prevBtn) {
      prevBtn.disabled = page <= 1;
      prevBtn.onclick = () => onChange(page - 1);
    }

    if (nextBtn) {
      nextBtn.disabled = page >= totalPages;
      nextBtn.onclick = () => onChange(page + 1);
    }

    if (list) {
      const items = getPageRange(page, totalPages).map(pageNumber => {
        if (pageNumber === "…") return createGapItem();
        return createPageItem(pageNumber, String(pageNumber), pageNumber === page, onChange);
      });

      list.replaceChildren(...items);
    }
  };
})();
