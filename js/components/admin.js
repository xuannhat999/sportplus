(function () {
  const productsBody = document.getElementById("adminProducts");
  const productsEmpty = document.getElementById("adminEmpty");
  const usersBody = document.getElementById("adminUsers");
  const usersEmpty = document.getElementById("adminUsersEmpty");
  const ordersBody = document.getElementById("adminOrders");
  const ordersEmpty = document.getElementById("adminOrdersEmpty");

  const ofStatus = document.getElementById("ofStatus");
  const ofCity = document.getElementById("ofCity");
  const ofDistrict = document.getElementById("ofDistrict");
  const ofCount = document.getElementById("ofCount");

  const stNote = document.getElementById("stNote");
  const stResult = document.getElementById("stResult");

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "";
    return td;
  }

  function emptyCell() {
    const td = document.createElement("td");
    td.className = "admin__actions";
    return td;
  }

  function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
  }

  /* ---------- Sản phẩm ---------- */

  function createProductRow(product) {
    const tr = document.createElement("tr");
    tr.dataset.id = product.id;

    tr.appendChild(cell(product.id));

    const imgTd = document.createElement("td");
    const images = productImages(product);
    if (images.length > 0) {
      const img = document.createElement("img");
      img.src = getAssetPath(images[0]);
      img.alt = product.name;
      img.className = "admin__thumb";
      imgTd.appendChild(img);
    }
    tr.appendChild(imgTd);

    const name = product.is_hidden ? `${product.name} (đã ẩn)` : product.name;
    if (product.is_hidden) tr.classList.add("is-hidden-product");
    tr.appendChild(cell(name));
    tr.appendChild(cell(formatPrice(product.price)));
    tr.appendChild(cell(product.oldPrice > product.price ? formatPrice(product.oldPrice) : ""));
    tr.appendChild(cell(product.team));
    tr.appendChild(cell(product.league));
    tr.appendChild(cell(product.season));
    tr.appendChild(createActionCell(product));

    return tr;
  }


  const addProductBtn = document.getElementById("addProductBtn");
  const productDialog = document.getElementById("productDialog");
  const productForm = document.getElementById("productForm");
  const pfCancel = document.getElementById("pfCancel");
  const pfSave = document.getElementById("pfSave");

  function closeProductDialog() {
    if (typeof productDialog.close === "function") {
      productDialog.close();
    } else {
      productDialog.removeAttribute("open");
    }
  }

  if (addProductBtn && productDialog) {
    addProductBtn.addEventListener("click", () => {
      if (productForm) productForm.reset();
      if (typeof productDialog.showModal === "function") {
        productDialog.showModal();
      } else {
        productDialog.setAttribute("open", "");
      }
    });
  }

  if (pfCancel && productDialog) {
    pfCancel.addEventListener("click", closeProductDialog);
  }

  if (pfSave && productDialog) {
    pfSave.addEventListener("click", closeProductDialog);
  }

  // Chặn Enter tự submit form (không còn nút submit)
  if (productForm) {
    productForm.addEventListener("submit", e => e.preventDefault());
  }

  const productsView = createListView({
    getList: () => ProductService.getAll(),
    pagerEl: document.getElementById("adminProductsPager"),
    pageSize: 8,
    renderPage(items, info) {
      productsEmpty.hidden = info.total > 0;
      productsEmpty.textContent = info.all ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào.";
      productsBody.replaceChildren(...items.map(createProductRow));
    }
  });

  function renderProductTable() {
    return productsView.render(true);
  }

  /* ---------- Người dùng ---------- */

  function createUserRow(user) {
    const tr = document.createElement("tr");
    tr.dataset.id = user.id;

    tr.appendChild(cell(user.id));
    tr.appendChild(cell(user.name));
    tr.appendChild(cell(user.email));
    tr.appendChild(cell(getUserAddress(user)));
    tr.appendChild(cell(user.role));

    const statusTd = document.createElement("td");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "admin__toggle";
    toggle.setAttribute("role", "switch");

    function paint() {
      const active = !user.is_locked;
      toggle.classList.toggle("is-on", active);
      toggle.setAttribute("aria-checked", String(active));
      toggle.innerHTML =
        '<span class="admin__toggle-track"><span class="admin__toggle-dot"></span></span>' +
        '<span class="admin__toggle-text">' + (active ? "Hoạt động" : "Đã khoá") + "</span>";
      toggle.title = active ? "Bấm để khoá tài khoản" : "Bấm để mở khoá";
    }

    toggle.addEventListener("click", () => {
      user.is_locked = !user.is_locked;
      paint();
    });

    paint();
    statusTd.appendChild(toggle);
    tr.appendChild(statusTd);

    return tr;
  }

  const usersView = createListView({
    getList: () => getUsers(),
    pagerEl: document.getElementById("adminUsersPager"),
    pageSize: 8,
    renderPage(items, info) {
      usersEmpty.hidden = info.total > 0;
      usersEmpty.textContent = info.all ? "Không tìm thấy người dùng phù hợp." : "Chưa có người dùng nào.";
      usersBody.replaceChildren(...items.map(createUserRow));
    }
  });

  function renderUserTable() {
    return usersView.render(true);
  }

  /* ---------- Đơn hàng ---------- */

  function itemLabel(item) {
    const product = ProductService.getById(item.productId);
    const name = item.name || (product ? product.name : `SP #${item.productId ?? "?"}`);
    return `${name} (${item.size || ""}) x${item.quantity ?? 0}`;
  }


  function createStatusSelect(order) {
    const td = document.createElement("td");
    const select = document.createElement("select");
    select.className = "admin__status";
    select.setAttribute("aria-label", "Trạng thái đơn hàng");

    Object.keys(STATUS_LABEL).forEach(key => {
      select.append(new Option(STATUS_LABEL[key], key));
    });

    function paint() {
      select.value = order.status;
      select.dataset.status = order.status;
    }

    select.addEventListener("change", () => {
      const next = select.value;
      if (next === order.status) return;

      if (next === ORDER_STATUS.CANCELLED &&
        !confirm(`Hủy đơn #${order.id}?`)) {
        paint();
        return;
      }

      order.status = next;

      if (typeof OrderService.updateStatus === "function") {
        OrderService.updateStatus(order.id, next);
      } else if (typeof OrderService.update === "function") {
        OrderService.update(order);
      }

      paint();
    });

    paint();
    td.appendChild(select);
    return td;
  }
  function createOrderRow(order) {
    const tr = document.createElement("tr");
    tr.dataset.id = order.id;

    const owner = getUserById(order.userId);
    const items = (order.items || []).map(itemLabel).join("; ");

    tr.appendChild(cell(`#${order.id}`));
    tr.appendChild(cell(formatDateTime(order.createdAt)));
    tr.appendChild(cell(owner ? `${owner.name} (${owner.email})` : `User #${order.userId ?? "?"}`));
    tr.appendChild(cell(items));
    tr.appendChild(cell(formatPrice(order.total)));
    tr.appendChild(cell(ORDER_PAY_METHOD_LABELS[order.payMethod] || order.payMethod));
    tr.appendChild(cell(order.address || ""));
    tr.appendChild(createStatusSelect(order));

    return tr;
  }

  // "số nhà, quận/huyện, thành phố" -> { district, city }
  function parseAddressParts(address) {
    const parts = String(address || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    return {
      city: parts.length >= 2 ? parts[parts.length - 1] : "",
      district: parts.length >= 3 ? parts[parts.length - 2] : ""
    };
  }



  function fillSelect(select, values, placeholder) {
    if (!select) return;
    select.replaceChildren(new Option(placeholder, ""));
    values.forEach(v => select.append(new Option(v, v)));
  }

  function renderFilterOptions(all) {
    if (ofStatus) {
      ofStatus.append(new Option("Tất cả trạng thái", ""));
      Object.keys(STATUS_LABEL).forEach(key => {
        ofStatus.append(new Option(STATUS_LABEL[key], key));
      });
    }

    const cities = new Set();
    const districts = new Set();
    all.forEach(order => {
      const { city, district } = parseAddressParts(order.address);
      if (city) cities.add(city);
      if (district) districts.add(district);
    });

    fillSelect(
      ofCity,
      [...cities].sort((a, b) => a.localeCompare(b, "vi")),
      "Tất cả thành phố"
    );
    fillSelect(
      ofDistrict,
      [...districts].sort((a, b) => a.localeCompare(b, "vi")),
      "Tất cả quận/huyện"
    );
  }

  function renderOrderTable() {
    const all = OrderService.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderFilterOptions(all);

    ordersEmpty.hidden = all.length > 0;
    if (ofCount) ofCount.textContent = all.length ? `${all.length} đơn` : "";
    ordersBody.replaceChildren(...all.map(createOrderRow));
    return all.length;
  }

  /* ---------- Thống kê ---------- */

  const stFrom = document.getElementById("stFrom");
  const stTo = document.getElementById("stTo");
  const stRun = document.getElementById("stRun");

  function computeCustomers() {
    const from = stFrom && stFrom.value ? new Date(stFrom.value + "T00:00:00") : null;
    const to = stTo && stTo.value ? new Date(stTo.value + "T23:59:59.999") : null;
    const byUser = new Map();

    OrderService.getAll().forEach(order => {
      if (order.status === ORDER_STATUS.CANCELLED) return; // bỏ đơn đã hủy

      const d = new Date(order.createdAt);
      if (from && d < from) return;
      if (to && d > to) return;

      const key = Number(order.userId);
      if (!byUser.has(key)) byUser.set(key, { userId: key, total: 0, orders: [] });

      const entry = byUser.get(key);
      entry.total += Number(order.total) || 0;
      entry.orders.push(order);
    });

    return [...byUser.values()]
      .sort((a, b) => b.total - a.total)
      .map((entry, i) => ({
        ...entry,
        rank: i + 1,
        orders: entry.orders.sort((a, b) => Number(b.total) - Number(a.total))
      }));
  }

  const statsView = createListView({
    getList: computeCustomers,
    pagerEl: document.getElementById("adminStatsPager"),
    pageSize: 3,
    renderPage(items, info) {
      if (stNote) {
        stNote.hidden = info.total > 0;
        stNote.textContent = "Chưa có đơn hàng nào.";
      }
      stResult.replaceChildren(...items.map(entry => createCustomerBlock(entry, entry.rank)));
    }
  });

  function renderStats() {
    return statsView.render(true);
  }

  if (stRun) stRun.addEventListener("click", () => statsView.render(true));


  function createCustomerBlock(entry, rank) {
    const owner = getUserById(entry.userId);

    const block = document.createElement("section");
    block.className = "admin__stat";

    const head = document.createElement("div");
    head.className = "admin__stat-head";

    const name = document.createElement("h2");
    name.textContent =
      `#${rank} ${owner ? `${owner.name} (${owner.email})` : `User #${entry.userId}`}`;

    const sum = document.createElement("p");
    sum.className = "admin__stat-sum";
    sum.textContent = `Tổng mua: ${formatPrice(entry.total)} · ${entry.orders.length} đơn`;

    head.append(name, sum);

    const table = document.createElement("table");
    table.className = "admin__table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Mã đơn", "Ngày đặt", "Trạng thái", "Tổng tiền", "Chi tiết"].forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement("tbody");

    entry.orders.forEach(order => {
      const tr = document.createElement("tr");
      tr.appendChild(cell(`#${order.id}`));
      tr.appendChild(cell(formatDateTime(order.createdAt)));
      tr.appendChild(cell(STATUS_LABEL[order.status] || order.status));
      tr.appendChild(cell(formatPrice(order.total)));

      const linkTd = document.createElement("td");
      const link = document.createElement("a");
      link.href = getAssetPath("pages/orders.html");
      link.textContent = "Xem chi tiết";
      link.className = "admin__link";
      linkTd.appendChild(link);
      tr.appendChild(linkTd);

      tbody.appendChild(tr);
    });

    table.append(thead, tbody);

    const wrap = document.createElement("div");
    wrap.className = "admin__table-wrap";
    wrap.appendChild(table);

    block.append(head, wrap);
    return block;
  }

  /* ---------- Khởi tạo ---------- */

  const counts = {
    products: renderProductTable(),
    users: renderUserTable(),
    orders: renderOrderTable(),
    stats: renderStats()
  };

  console.log(
    `Admin: ${counts.products} sản phẩm, ${counts.users} người dùng, ` +
    `${counts.orders} đơn hàng, ${counts.stats} khách hàng thống kê.`
  );



  const editDialog = document.getElementById("editProductDialog");
  const editForm = document.getElementById("editProductForm");
  const epfName = document.getElementById("epfName");
  const epfPrice = document.getElementById("epfPrice");
  const epfOldPrice = document.getElementById("epfOldPrice");
  const epfTeam = document.getElementById("epfTeam");
  const epfLeague = document.getElementById("epfLeague");
  const epfSeason = document.getElementById("epfSeason");
  const epfSave = document.getElementById("epfSave");
  const epfCancel = document.getElementById("epfCancel");

  function createActionCell(product) {
    const td = document.createElement("td");

    const wrap = document.createElement("div");
    wrap.className = "admin__actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "admin__btn admin__btn--edit";
    editBtn.title = "Sửa sản phẩm";
    editBtn.setAttribute("aria-label", "Sửa");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i><span>Sửa</span>';
    editBtn.addEventListener("click", () => {
      if (!editDialog) return;
      if (epfName) epfName.value = product.name ?? "";
      if (epfPrice) epfPrice.value = product.price ?? "";
      if (epfOldPrice) epfOldPrice.value = product.oldPrice ?? "";
      if (epfTeam) epfTeam.value = product.team ?? "";
      if (epfLeague) epfLeague.value = product.league ?? "";
      if (epfSeason) epfSeason.value = product.season ?? "";

      // Render product image gallery (main + thumbnails)
      renderEditDialogGallery(product);

      if (typeof editDialog.showModal === "function") {
        editDialog.showModal();
      } else {
        editDialog.setAttribute("open", "");
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "admin__btn admin__btn--delete";
    deleteBtn.title = "Xoá sản phẩm";
    deleteBtn.setAttribute("aria-label", "Xoá");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i><span>Xoá</span>';
    deleteBtn.addEventListener("click", () => {
      // Chỉ hiển thị nút, không xử lý xoá
    });

    wrap.append(editBtn, deleteBtn);
    td.appendChild(wrap);
    return td;
  }

  // Render gallery in edit dialog with main image + thumbnails
  function renderEditDialogGallery(product) {
    const mainImg = document.getElementById("epfGalleryMain")?.querySelector(".admin__gallery-image");
    const thumbsContainer = document.getElementById("epfGalleryThumbs");
    if (!mainImg || !thumbsContainer) return;

    const images = productImages(product);
    if (images.length === 0) {
      mainImg.src = "";
      mainImg.alt = product.name || "Sản phẩm";
      thumbsContainer.innerHTML = "";
      return;
    }

    // Set main image (first image)
    mainImg.src = getAssetPath(images[0]);
    mainImg.alt = product.name || "Sản phẩm";

    // Render thumbnails (up to 3)
    const thumbs = images.slice(0, 3);
    thumbsContainer.innerHTML = thumbs.map((src, i) => `
      <button type="button" class="admin__gallery-thumb${i === 0 ? ' is-active' : ''}" 
              data-index="${i}" aria-label="Ảnh ${i + 1}" aria-pressed="${i === 0}"
              role="listitem">
        <img src="${getAssetPath(src)}" alt="${product.name || 'Sản phẩm'} ${i + 1}">
      </button>
    `).join("");

    // Thumbnail click handlers
    thumbsContainer.querySelectorAll(".admin__gallery-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const newSrc = getAssetPath(images[idx]);
        mainImg.src = newSrc;
        mainImg.alt = `${product.name || 'Sản phẩm'} ${idx + 1}`;
        // Update active state
        thumbsContainer.querySelectorAll(".admin__gallery-thumb").forEach(b => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
      });
    });
  }

  function closeEditDialog() {
    if (!editDialog) return;
    if (typeof editDialog.close === "function") {
      editDialog.close();
    } else {
      editDialog.removeAttribute("open");
    }
  }

  if (epfSave) {
    epfSave.addEventListener("click", closeEditDialog);
  }

  if (epfCancel) {
    epfCancel.addEventListener("click", closeEditDialog);
  }

  // Chặn Enter tự submit form (không còn nút submit)
  if (editForm) {
    editForm.addEventListener("submit", e => e.preventDefault());
  }


  /* ---------- Tìm kiếm + phân trang dùng chung ---------- */

  // bỏ dấu + chữ thường để tìm "ao" ra "Áo"
  function normalize(s) {
    return String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function createListView({ getList, match, renderPage, searchEl, pagerEl, pageSize = 8 }) {
    let page = 1;

    function render(resetPage) {
      if (resetPage) page = 1;

      const kw = normalize(searchEl ? searchEl.value : "");
      const all = getList();
      const filtered = kw ? all.filter(item => match(item, kw)) : all;

      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (page > pages) page = pages;

      const start = (page - 1) * pageSize;
      renderPage(filtered.slice(start, start + pageSize), {
        total: filtered.length,
        all: all.length,
        keyword: kw
      });
      renderPager(pages, filtered.length);
      return filtered.length;
    }

    function goTo(p) {
      page = p;
      render();
    }

    function pageButton(label, target, opts = {}) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "admin__page-btn" + (opts.active ? " is-active" : "");
      b.textContent = label;
      b.disabled = !!opts.disabled;
      if (opts.aria) b.setAttribute("aria-label", opts.aria);
      if (opts.active) b.setAttribute("aria-current", "page");
      return b;
    }

    function renderPager(pages, total) {
      if (!pagerEl) return;
      pagerEl.replaceChildren();
      pagerEl.hidden = pages <= 1;
      if (pages <= 1) return;

      const info = document.createElement("span");
      info.className = "admin__page-info";
      info.textContent = `Trang ${page}/${pages} · ${total} kết quả`;

      const nav = document.createElement("div");
      nav.className = "admin__page-list";
      nav.appendChild(pageButton("‹", page - 1, { disabled: page === 1, aria: "Trang trước" }));

      const nums = [...new Set([1, page - 1, page, page + 1, pages])]
        .filter(n => n >= 1 && n <= pages)
        .sort((a, b) => a - b);

      let prev = 0;
      nums.forEach(n => {
        if (n - prev > 1) {
          const dots = document.createElement("span");
          dots.className = "admin__page-dots";
          dots.textContent = "…";
          nav.appendChild(dots);
        }
        nav.appendChild(pageButton(String(n), n, { active: n === page }));
        prev = n;
      });

      nav.appendChild(pageButton("›", page + 1, { disabled: page === pages, aria: "Trang sau" }));
      pagerEl.append(info, nav);
    }

    if (searchEl) searchEl.addEventListener("input", () => render(true));

    return { render, goTo };
  }
}



)();


(function () {
  const tabs = document.querySelectorAll(".admin__tab");
  const panels = document.querySelectorAll(".admin__panel");

  function showTab(name) {
    tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
    panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
  }

  tabs.forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));
  showTab("products");
}





)();

(function () {
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  document.querySelectorAll("[data-dropzone]").forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    const emptyView = zone.querySelector(".admin__dropzone-empty");
    const fileView = zone.querySelector(".admin__dropzone-file");
    const img = zone.querySelector("img");
    const nameEl = zone.querySelector(".admin__dropzone-name");
    const sizeEl = zone.querySelector(".admin__dropzone-size");
    const removeBtn = zone.querySelector(".admin__dropzone-remove");
    let url = null;

    function clear() {
      if (url) URL.revokeObjectURL(url);
      url = null;
      input.value = "";
      img.removeAttribute("src");
      emptyView.hidden = false;
      fileView.hidden = true;
      zone.classList.remove("has-file", "is-dragover");
    }

    function show(file) {
      if (!file || !file.type.startsWith("image/")) { clear(); return; }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(file);
      img.src = url;
      nameEl.textContent = file.name;
      sizeEl.textContent = formatSize(file.size);
      emptyView.hidden = true;
      fileView.hidden = false;
      zone.classList.add("has-file");
    }

    input.addEventListener("change", () => show(input.files[0]));
    removeBtn.addEventListener("click", clear);

    // Kéo thả
    ["dragenter", "dragover"].forEach(ev =>
      zone.addEventListener(ev, e => {
        e.preventDefault();
        zone.classList.add("is-dragover");
      }));
    ["dragleave", "drop"].forEach(ev =>
      zone.addEventListener(ev, e => {
        e.preventDefault();
        zone.classList.remove("is-dragover");
      }));
    zone.addEventListener("drop", e => {
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      show(file);
    });

    // Form reset (nút Thêm sản phẩm gọi productForm.reset())
    if (input.form) input.form.addEventListener("reset", () => setTimeout(clear, 0));
  });
})();
