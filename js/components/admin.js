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
    pfCancel.addEventListener("click", () => {
      if (typeof productDialog.close === "function") {
        productDialog.close();
      } else {
        productDialog.removeAttribute("open");
      }
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Chỉ hiển thị form, bấm nút không làm gì
    });
  }

  function renderProductTable() {
    const list = ProductService.getAll();
    productsEmpty.hidden = list.length > 0;
    productsBody.replaceChildren(...list.map(createProductRow));
    return list.length;
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
    const statusText = document.createElement("span");
    statusText.textContent = user.is_locked ? "Đã khoá" : "Hoạt động";

    const lockBtn = document.createElement("button");
    lockBtn.type = "button";
    lockBtn.className = "admin__lock-btn";
    lockBtn.textContent = user.is_locked ? "Mở khoá" : "Khoá";

    statusTd.append(statusText, lockBtn);
    tr.appendChild(statusTd);

    tr.appendChild(emptyCell());

    return tr;
  }

  function renderUserTable() {
    const list = getUsers();
    usersEmpty.hidden = list.length > 0;
    usersBody.replaceChildren(...list.map(createUserRow));
    return list.length;
  }

  /* ---------- Đơn hàng ---------- */

  function itemLabel(item) {
    const product = ProductService.getById(item.productId);
    const name = item.name || (product ? product.name : `SP #${item.productId ?? "?"}`);
    return `${name} (${item.size || ""}) x${item.quantity ?? 0}`;
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
    tr.appendChild(cell(STATUS_LABEL[order.status] || order.status));

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

  function computeTopCustomers(limit = 5) {
    const byUser = new Map();

    OrderService.getAll().forEach(order => {
      if (order.status === ORDER_STATUS.CANCELLED) return; // bỏ đơn đã hủy

      const key = Number(order.userId);
      if (!byUser.has(key)) byUser.set(key, { userId: key, total: 0, orders: [] });

      const entry = byUser.get(key);
      entry.total += Number(order.total) || 0;
      entry.orders.push(order);
    });

    return [...byUser.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map(entry => ({
        ...entry,
        orders: entry.orders.sort((a, b) => Number(b.total) - Number(a.total))
      }));
  }

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
      const link = document.createElement("span");
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

  function renderStats() {
    if (stNote) stNote.hidden = true;
    stResult.replaceChildren();

    const top = computeTopCustomers(5);

    if (top.length === 0) {
      if (stNote) {
        stNote.textContent = "Chưa có đơn hàng nào.";
        stNote.hidden = false;
      }
      return 0;
    }

    stResult.replaceChildren(...top.map((entry, i) => createCustomerBlock(entry, i + 1)));
    return top.length;
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
  const epfSave = document.getElementById("epfSave");
  const epfCancel = document.getElementById("epfCancel");

  function createActionCell(product) {
    const td = document.createElement("td");
    td.className = "admin__actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "admin__edit-btn";
    editBtn.textContent = "Sửa";
    editBtn.addEventListener("click", () => {
      if (!editDialog) return;
      if (epfName) epfName.value = product.name ?? "";
      if (epfPrice) epfPrice.value = product.price ?? "";
      if (epfOldPrice) epfOldPrice.value = product.oldPrice ?? "";
      if (typeof editDialog.showModal === "function") {
        editDialog.showModal();
      } else {
        editDialog.setAttribute("open", "");
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "admin__delete-btn";
    deleteBtn.textContent = "Xoá";
    deleteBtn.addEventListener("click", () => {
      // Chỉ hiển thị nút, không xử lý xoá
    });

    td.append(editBtn, deleteBtn);
    return td;
  }

  if (epfSave) {
    epfSave.addEventListener("click", () => {
      // Chỉ hiển thị nút, bấm Lưu không làm gì
    });
  }

  if (epfCancel) {
    epfCancel.addEventListener("click", () => {
      if (!editDialog) return;
      if (typeof editDialog.close === "function") {
        editDialog.close();
      } else {
        editDialog.removeAttribute("open");
      }
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
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
