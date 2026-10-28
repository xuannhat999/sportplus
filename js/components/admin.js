(function () {
  if (!isAdmin()) {
    if (isLoggedIn()) {
      location.replace(getAssetPath("index.html"));  // đã đăng nhập nhưng không phải admin
    } else {
      goToAuth("pages/admin.html");                  // chưa đăng nhập: sang trang login
    }
    return;
  }
   

  const productsBody = document.getElementById("adminProducts");
  const productsEmpty = document.getElementById("adminEmpty");
  const usersBody = document.getElementById("adminUsers");
  const usersEmpty = document.getElementById("adminUsersEmpty");

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "";
    return td;
  }

  function button(label, className, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  /* ---------- Sản phẩm ---------- */

  function inputCell(value, type = "text") {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = type;
    input.className = "admin__input";
    input.value = value ?? "";
    if (type === "number") input.min = "0";
    td.appendChild(input);
    return td;
  }

  function keepType(original, value) {
    return typeof original === "number" ? Number(value) : value.trim();
  }

  // Dòng nào đang sửa thì lưu id ở đây (chỉ 1 dòng một lúc)
  let editingId = null;
  function deleteOrHideProduct(product) {
    if (!isAdmin()) return;

    if (ProductService.isSold(product.id)) {
      const ok = confirm(
        `"${product.name}" đã được bán nên không thể xoá hẳn.\n` +
        `Ẩn sản phẩm này khỏi website?`
      );
      if (!ok) return;
      ProductService.hide(product.id);
    } else {
      const ok = confirm(`Xoá vĩnh viễn "${product.name}"? Không thể hoàn tác.`);
      if (!ok) return;
      ProductService.remove(product.id);
    }

    editingId = null;
    renderProductTable();
  }

  function createProductRow(product, editing = false) {
    const tr = document.createElement("tr");
    tr.dataset.id = product.id;
    if (editing) tr.classList.add("is-editing");

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

    const actionTd = document.createElement("td");
    actionTd.className = "admin__actions";

    if (!editing) {
      tr.appendChild(cell(product.is_hidden ? `${product.name} (đã ẩn)` : product.name));
      if (product.is_hidden) tr.classList.add("is-hidden-product");
      tr.appendChild(cell(formatPrice(product.price)));
      tr.appendChild(cell(product.oldPrice > product.price ? formatPrice(product.oldPrice) : ""));
      tr.appendChild(cell(product.team));
      tr.appendChild(cell(product.league));
      tr.appendChild(cell(product.season));

      const editBtn = button("Sửa", "admin__edit", () => {
        editingId = product.id;
        renderProductTable(); // vẽ lại: chỉ dòng này ở chế độ sửa
      });
      const deleteBtn = product.is_hidden
        ? button("Hiện lại", "admin__edit", () => {
            ProductService.unhide(product.id);
            renderProductTable();
          })
        : button("Xoá", "admin__delete", () => deleteOrHideProduct(product));

      // Đang sửa dòng khác thì khoá nút của dòng này
      if (editingId !== null) {
        editBtn.disabled = true;
        deleteBtn.disabled = true;
      }

      actionTd.append(editBtn, deleteBtn);
    } else {
      const nameTd = inputCell(product.name);
      const priceTd = inputCell(product.price, "number");
      const oldPriceTd = inputCell(product.oldPrice || "", "number");
      const teamTd = inputCell(product.team);
      const leagueTd = inputCell(product.league);
      const seasonTd = inputCell(product.season);

      tr.append(nameTd, priceTd, oldPriceTd, teamTd, leagueTd, seasonTd);

      const val = td => td.querySelector("input").value;

      const saveBtn = button("Lưu", "admin__save", () => {
        if (!isAdmin()) return;

        const name = val(nameTd).trim();
        const price = Number(val(priceTd));
        const oldPrice = val(oldPriceTd) === "" ? 0 : Number(val(oldPriceTd));

        if (!name) return alert("Tên sản phẩm không được để trống.");
        if (!Number.isFinite(price) || price < 0) return alert("Giá không hợp lệ.");
        if (!Number.isFinite(oldPrice) || oldPrice < 0) return alert("Giá cũ không hợp lệ.");

        ProductService.update(product.id, {
          name,
          price,
          oldPrice,
          team: keepType(product.team, val(teamTd)),
          league: keepType(product.league, val(leagueTd)),
          season: keepType(product.season, val(seasonTd))
        });

        editingId = null;
        renderProductTable();
      });

      const cancelBtn = button("Hủy", "admin__cancel", () => {
        editingId = null;
        renderProductTable();
      });

      actionTd.append(saveBtn, cancelBtn);

      tr.addEventListener("keydown", e => {
        if (e.key === "Enter") saveBtn.click();
        if (e.key === "Escape") cancelBtn.click();
      });
    }

    tr.appendChild(actionTd);
    return tr;
  }

  function renderProductTable() {
    const list = ProductService.getAllRaw();
    productsEmpty.hidden = list.length > 0;
    productsBody.replaceChildren(
      ...list.map(p => createProductRow(p, p.id === editingId))
    );
  }


  /* ---------- Người dùng ---------- */
  function createUserRow(user) {
    const tr = document.createElement("tr");
    tr.dataset.id = user.id;

    const current = getCurrentUser();
    const isSelf = current && Number(current.id) === Number(user.id);

    tr.appendChild(cell(user.id));
    tr.appendChild(cell(user.name));
    tr.appendChild(cell(user.email));
    tr.appendChild(cell(getUserAddress(user)));
    tr.appendChild(cell(user.role));
    tr.appendChild(cell(user.is_locked ? "Đã khoá" : "Hoạt động"));

    const actionTd = document.createElement("td");
    actionTd.className = "admin__actions";

    if (!isSelf) {
      actionTd.appendChild(
        button(user.is_locked ? "Mở khoá" : "Khoá", "admin__edit", () => {
          if (!isAdmin()) return;
          updateUser(user.id, { is_locked: !user.is_locked });
          renderUserTable();
        })
      );
    }

    tr.appendChild(actionTd);
    return tr;
  }

  function renderUserTable() {
    const list = getUsers();
    usersEmpty.hidden = list.length > 0;
    usersBody.replaceChildren(...list.map(createUserRow));
  }

    /* ---------- Đơn hàng ---------- */
  const ordersBody = document.getElementById("adminOrders");
  const ordersEmpty = document.getElementById("adminOrdersEmpty");

  function createOrderRow(order) {
    const tr = document.createElement("tr");
    tr.dataset.id = order.id;

    const owner = getUserById(order.userId);
    const items = order.items
      .map(i => `${i.name} (${i.size}) x${i.quantity}`)
      .join("; ");

    tr.appendChild(cell(`#${order.id}`));
    tr.appendChild(cell(order.createdAt ? new Date(Number(order.createdAt)).toLocaleString("vi-VN") : ""));
    tr.appendChild(cell(owner ? `${owner.name} (${owner.email})` : `User #${order.userId ?? "?"}`));
    tr.appendChild(cell(items));
    tr.appendChild(cell(formatPrice(order.total)));
    tr.appendChild(cell(ORDER_PAY_METHOD_LABELS[order.payMethod] || order.payMethod));
    tr.appendChild(cell(order.address || ""));

    const statusTd = document.createElement("td");
    const nextList = NEXT_STATUS[order.status] || [];

    if (nextList.length === 0) {
      statusTd.textContent = STATUS_LABEL[order.status] || order.status;
    } else {
      const select = document.createElement("select");
      select.className = "admin__input";

      [order.status, ...nextList].forEach(key => {
        select.append(new Option(STATUS_LABEL[key], key));
      });
      select.value = order.status;

      select.addEventListener("change", () => {
        const next = select.value;

        if (next === ORDER_STATUS.CANCELLED &&
            !confirm(`Hủy đơn #${order.id}? Không thể hoàn tác.`)) {
          select.value = order.status;
          return;
        }

        const result = OrderService.updateStatus(order.id, next);
        if (!result.ok) alert(result.message);
        renderOrderTable();
      });

      statusTd.appendChild(select);
    }

    tr.appendChild(statusTd);
    return tr;
  }

    /* ---------- Lọc đơn hàng ---------- */
  const ofStatus = document.getElementById("ofStatus");
  const ofFrom = document.getElementById("ofFrom");
  const ofTo = document.getElementById("ofTo");
  const ofCity = document.getElementById("ofCity");
  const ofDistrict = document.getElementById("ofDistrict");
  const ofCount = document.getElementById("ofCount");

  // Trạng thái: tạo một lần từ STATUS_LABEL
  ofStatus.append(new Option("Tất cả trạng thái", ""));
  Object.keys(STATUS_LABEL).forEach(key => {
    ofStatus.append(new Option(STATUS_LABEL[key], key));
  });

  // "số nhà, quận/huyện, thành phố" -> { district, city }
  function parseAddress(address) {
    const parts = String(address || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    return {
      city: parts.length >= 2 ? parts[parts.length - 1] : "",
      district: parts.length >= 3 ? parts[parts.length - 2] : ""
    };
  }

  // Đổ lại options nhưng giữ lựa chọn hiện tại nếu còn hợp lệ
  function fillSelect(select, values, placeholder) {
    const current = select.value;
    select.replaceChildren(new Option(placeholder, ""));
    values.forEach(v => select.append(new Option(v, v)));
    select.value = values.includes(current) ? current : "";
  }

  function refreshLocationOptions(all) {
    const cities = new Set();
    all.forEach(order => {
      const { city } = parseAddress(order.address);
      if (city) cities.add(city);
    });
    fillSelect(ofCity, [...cities].sort((a, b) => a.localeCompare(b, "vi")), "Tất cả thành phố");

    // Quận/huyện chỉ lấy trong thành phố đang chọn
    const districts = new Set();
    all.forEach(order => {
      const { city, district } = parseAddress(order.address);
      if (district && (!ofCity.value || city === ofCity.value)) districts.add(district);
    });
    fillSelect(ofDistrict, [...districts].sort((a, b) => a.localeCompare(b, "vi")), "Tất cả quận/huyện");
  }

  function matchesFilters(order) {
    if (ofStatus.value && order.status !== ofStatus.value) return false;

    const time = Number(order.createdAt);
    if (ofFrom.value && time < new Date(`${ofFrom.value}T00:00:00`).getTime()) return false;
    if (ofTo.value && time > new Date(`${ofTo.value}T23:59:59.999`).getTime()) return false;

    const { city, district } = parseAddress(order.address);
    if (ofCity.value && city !== ofCity.value) return false;
    if (ofDistrict.value && district !== ofDistrict.value) return false;

    return true;
  }

  function renderOrderTable() {
    const all = OrderService.getAll()
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    refreshLocationOptions(all);

    const list = all.filter(matchesFilters);

    ordersEmpty.textContent = all.length === 0
      ? "Chưa có đơn hàng nào."
      : "Không có đơn hàng nào khớp bộ lọc.";
    ordersEmpty.hidden = list.length > 0;

    ofCount.textContent = all.length ? `${list.length} / ${all.length} đơn` : "";
    ordersBody.replaceChildren(...list.map(createOrderRow));
  }

  [ofStatus, ofFrom, ofTo, ofCity, ofDistrict].forEach(el => {
    el.addEventListener("change", renderOrderTable);
  });

  document.getElementById("ofReset").addEventListener("click", () => {
    ofStatus.value = "";
    ofFrom.value = "";
    ofTo.value = "";
    ofCity.value = "";
    ofDistrict.value = "";
    renderOrderTable();
  });

    /* ---------- Thống kê ---------- */
  const stFrom = document.getElementById("stFrom");
  const stTo = document.getElementById("stTo");
  const stNote = document.getElementById("stNote");
  const stResult = document.getElementById("stResult");
  const orderDialog = document.getElementById("orderDialog");
  const orderDetail = document.getElementById("orderDetail");

  function toDateInput(d) {
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDateTime(ts) {
    return ts ? new Date(Number(ts)).toLocaleString("vi-VN") : "";
  }

  // Top khách mua nhiều nhất trong khoảng [from, to], giảm dần theo tổng tiền
  function computeTopCustomers(fromStr, toStr, limit = 5) {
    const from = new Date(`${fromStr}T00:00:00`).getTime();
    const to = new Date(`${toStr}T23:59:59.999`).getTime();
    const byUser = new Map();

    OrderService.getAll().forEach(order => {
      if (order.status === ORDER_STATUS.CANCELLED) return;  // bỏ đơn đã hủy

      const time = Number(order.createdAt);
      if (time < from || time > to) return;

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

  // Chi tiết một đơn trong hộp thoại
  function showOrderDetail(order) {
    const owner = getUserById(order.userId);

    const title = document.createElement("h2");
    title.textContent = `Đơn hàng #${order.id}`;

    const info = document.createElement("div");
    info.className = "admin__order-info";
    [
      ["Khách hàng", owner ? `${owner.name} (${owner.email})` : `User #${order.userId}`],
      ["Ngày đặt", formatDateTime(order.createdAt)],
      ["Trạng thái", STATUS_LABEL[order.status] || order.status],
      ["Thanh toán", ORDER_PAY_METHOD_LABELS[order.payMethod] || order.payMethod],
      ["Địa chỉ giao", order.address || "Chưa cập nhật"]
    ].forEach(([label, value]) => {
      const p = document.createElement("p");
      const b = document.createElement("strong");
      b.textContent = `${label}: `;
      p.append(b, document.createTextNode(value));
      info.appendChild(p);
    });

    const table = document.createElement("table");
    table.className = "admin__table";
    table.innerHTML =
      "<thead><tr><th>Ảnh</th><th>Sản phẩm</th><th>Size</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>";
    const tbody = document.createElement("tbody");

    order.items.forEach(item => {
      const tr = document.createElement("tr");

      const imgTd = document.createElement("td");
      if (item.image) {
        const img = document.createElement("img");
        img.src = getAssetPath(item.image);
        img.alt = item.name;
        img.className = "admin__thumb";
        imgTd.appendChild(img);
      }
      tr.appendChild(imgTd);

      tr.appendChild(cell(item.name));
      tr.appendChild(cell(item.size));
      tr.appendChild(cell(item.quantity));
      tr.appendChild(cell(formatPrice(item.price)));
      tr.appendChild(cell(formatPrice(item.getLineTotal())));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const total = document.createElement("p");
    total.className = "admin__order-total";
    total.textContent = `Tổng tiền: ${formatPrice(order.total)}`;

    const wrap = document.createElement("div");
    wrap.className = "admin__table-wrap";
    wrap.appendChild(table);

    orderDetail.replaceChildren(title, info, wrap, total);
    orderDialog.showModal();
  }

  document.getElementById("odClose").addEventListener("click", () => orderDialog.close());

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
    table.innerHTML =
      "<thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Trạng thái</th><th>Tổng tiền</th><th>Chi tiết</th></tr></thead>";
    const tbody = document.createElement("tbody");

    entry.orders.forEach(order => {
      const tr = document.createElement("tr");
      tr.appendChild(cell(`#${order.id}`));
      tr.appendChild(cell(formatDateTime(order.createdAt)));
      tr.appendChild(cell(STATUS_LABEL[order.status] || order.status));
      tr.appendChild(cell(formatPrice(order.total)));

      const linkTd = document.createElement("td");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Xem chi tiết";
      link.className = "admin__link";
      link.addEventListener("click", e => {
        e.preventDefault();
        showOrderDetail(order);
      });
      linkTd.appendChild(link);
      tr.appendChild(linkTd);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrap = document.createElement("div");
    wrap.className = "admin__table-wrap";
    wrap.appendChild(table);

    block.append(head, wrap);
    return block;
  }

  function runStats() {
    stNote.hidden = true;
    stResult.replaceChildren();

    if (!stFrom.value || !stTo.value) {
      stNote.textContent = "Hãy chọn đủ từ ngày và đến ngày.";
      stNote.hidden = false;
      return;
    }
    if (stFrom.value > stTo.value) {
      stNote.textContent = "Từ ngày không được lớn hơn đến ngày.";
      stNote.hidden = false;
      return;
    }

    const top = computeTopCustomers(stFrom.value, stTo.value, 5);

    if (top.length === 0) {
      stNote.textContent = "Không có đơn hàng nào trong khoảng thời gian này.";
      stNote.hidden = false;
      return;
    }

    stResult.replaceChildren(...top.map((entry, i) => createCustomerBlock(entry, i + 1)));
  }

  // Mặc định 30 ngày gần nhất, chỉ đặt một lần
  function renderStats() {
    if (!stFrom.value && !stTo.value) {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 30);
      stFrom.value = toDateInput(start);
      stTo.value = toDateInput(today);
    }
    runStats();
  }

  document.getElementById("stRun").addEventListener("click", runStats);

  /* ---------- Tab ---------- */
  const renderers = { products: renderProductTable, users: renderUserTable, orders: renderOrderTable, stats: renderStats };

  function showTab(name) {
    document.querySelectorAll(".admin__tab").forEach(tab => {
      tab.classList.toggle("is-active", tab.dataset.tab === name);
    });
    document.querySelectorAll(".admin__panel").forEach(panel => {
      panel.hidden = panel.dataset.panel !== name;
    });
    renderers[name]();
  }

  document.querySelectorAll(".admin__tab").forEach(tab => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
  });

  /* ---------- Thêm sản phẩm ---------- */

  // key: tên field trong product. source: mảng dữ liệu dùng làm combobox.
  // ĐỔI cho khớp với data thật của bạn.
  const SELECT_FIELDS = [
    { key: "category", label: "Danh mục",
      list:   () => (typeof CATEGORIES !== "undefined" ? CATEGORIES : null),
      labels: () => (typeof CATEGORY_LABELS !== "undefined" ? CATEGORY_LABELS : null)
     },
    { key: "team",     label: "Đội",
      list:   () => (typeof TEAMS !== "undefined" ? TEAMS : null),
      labels: () => (typeof TEAM_LABELS !== "undefined" ? TEAM_LABELS : null)
     },
    { key: "league",   label: "Giải đấu" ,
      list:   () => (typeof LEAGUES !== "undefined" ? LEAGUES : null),
      labels: () => (typeof LEAGUE_LABELS !== "undefined" ? LEAGUE_LABELS : null)
    },
    { key: "season",   label: "Mùa giải",
      list: () => (typeof SEASONS !== "undefined" ? SEASONS : null)
     },
    { key: "brand",    label: "Thương hiệu" ,
      list: () => (typeof BRANDS !== "undefined" ? BRANDS : null)
    },
    { key: "kit_type", label: "Loại áo",
      list:   () => (typeof KIT_TYPES !== "undefined" ? KIT_TYPES : null),
      labels: () => (typeof KIT_TYPE_LABELS !== "undefined" ? KIT_TYPE_LABELS : null)
     }
  ];

  const dialog = document.getElementById("productDialog");
  const form = document.getElementById("productForm");
  const selectsBox = document.getElementById("pfSelects");
  const fileInput = document.getElementById("pfImage");
  const preview = document.getElementById("pfPreview");
  const errorEl = document.getElementById("pfError");

  function distinctValues(key) {
    const set = new Set();
    ProductService.getAllRaw().forEach(p => {
      if (p[key] !== undefined && p[key] !== null && p[key] !== "") set.add(p[key]);
    });
    return [...set].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function buildSelects() {
    selectsBox.replaceChildren();

    SELECT_FIELDS.forEach(field => {
      const fromFile = field.list ? field.list() : null;
      const values = Array.isArray(fromFile) ? fromFile : distinctValues(field.key);
      const labels = (field.labels && field.labels()) || {};

      const label = document.createElement("label");
      label.className = "admin__field";

      const span = document.createElement("span");
      span.textContent = field.label;

      const select = document.createElement("select");
      select.className = "admin__input";
      select.dataset.key = field.key;

      select.append(new Option("-- Chọn --", ""));
      values.forEach(v => select.append(new Option(labels[v] || v, v)));

      label.append(span, select);
      selectsBox.appendChild(label);
    });
  }

  // Nén ảnh về tối đa 600px, JPEG chất lượng 0.8
  function imageToDataUrl(file, maxSize = 600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  function openProductDialog() {
    form.reset();
    preview.hidden = true;
    showError("");
    buildSelects();
    dialog.showModal();
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) { preview.hidden = true; return; }
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  });

  document.getElementById("pfCancel").addEventListener("click", () => dialog.close());

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!isAdmin()) return;

    const name = document.getElementById("pfName").value.trim();
    const price = Number(document.getElementById("pfPrice").value);
    const oldRaw = document.getElementById("pfOldPrice").value;
    const oldPrice = oldRaw === "" ? 0 : Number(oldRaw);
    const file = fileInput.files[0];

    if (!name) return showError("Hãy nhập tên sản phẩm.");
    if (!Number.isFinite(price) || price <= 0) return showError("Giá không hợp lệ.");
    if (!Number.isFinite(oldPrice) || oldPrice < 0) return showError("Giá cũ không hợp lệ.");
    if (!file) return showError("Hãy chọn hình ảnh.");

    const product = { name, price, oldPrice: oldPrice || price };

    for (const select of selectsBox.querySelectorAll("select")) {
      if (select.value === "") {
        return showError("Hãy chọn đủ các mục trong danh sách.");
      }
      product[select.dataset.key] = select.value;
    }

    try {
      product.images = [await imageToDataUrl(file)];
    } catch {
      return showError("Không đọc được ảnh, hãy thử ảnh khác.");
    }

    ProductService.add(product);
    dialog.close();
    editingId = null;
    renderProductTable();
  });

  // Thay cho addProduct() cũ
  document.getElementById("addProductBtn").addEventListener("click", openProductDialog);

  showTab("products");
})();