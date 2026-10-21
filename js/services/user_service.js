const AUTH_KEY = "currentUser";
const USERS_KEY = "users";
const USERS_SEED_VERSION_KEY = "users_seed_version";

const USERS_SEED_VERSION = 3;
const USER_ROLE_BUYER = "buyer";
const AUTH_PAGE_PATH = "pages/auth.html";

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

// Danh sách user: seed lần đầu từ js/data/users.js, sau đó lưu ở localStorage
// để các tài khoản đăng kí mới không bị mất khi tải lại trang.
function getUsers() {
  const users = readStorage(USERS_KEY);
  const version = readStorage(USERS_SEED_VERSION_KEY);

  if (!Array.isArray(users) || version !== USERS_SEED_VERSION) {
    const seed = typeof USERS !== "undefined" && Array.isArray(USERS) ? USERS : [];
    const seeded = seed.map(user => ({ ...user, address: getUserAddress(user) }));

    writeStorage(USERS_KEY, seeded);
    writeStorage(USERS_SEED_VERSION_KEY, USERS_SEED_VERSION);

    return seeded;
  }

  return users;
}

// Địa chỉ được lưu dưới dạng chuỗi, mỗi user có một địa chỉ duy nhất.
function getUserAddress(user) {
  if (!user) return "";

  if (Array.isArray(user.address)) {
    return String(user.address[0] || "").trim();
  }

  return String(user.address || "").trim();
}

function getUserById(id) {
  return getUsers().find(user => Number(user.id) === Number(id)) || null;
}

function findUserByEmail(email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return null;

  return getUsers().find(user => String(user.email).trim().toLowerCase() === target) || null;
}

function authenticate(email, password) {
  const user = findUserByEmail(email);

  if (!user) {
    return { ok: false, user: null, message: "Email hoặc mật khẩu không đúng." };
  }

  if (user.is_locked) {
    return { ok: false, user: null, message: "Tài khoản này đã bị khoá." };
  }

  if (String(user.password) !== String(password)) {
    return { ok: false, user: null, message: "Email hoặc mật khẩu không đúng." };
  }

  return { ok: true, user, message: "" };
}

function registerUser({ name, email, password }) {
  const users = getUsers();
  const id = users.length ? Math.max(...users.map(user => Number(user.id) || 0)) + 1 : 1;

  const user = {
    id,
    name: name || "",
    address: "",
    pay_method: "online",
    email: String(email || "").trim(),
    password: String(password || ""),
    role: USER_ROLE_BUYER,
    is_locked: false
  };

  users.push(user);
  writeStorage(USERS_KEY, users);

  return user;
}

// Cập nhật hồ sơ user và đồng bộ luôn session hiện tại.
function updateUser(id, changes) {
  const users = getUsers();
  const index = users.findIndex(user => Number(user.id) === Number(id));
  if (index === -1) return null;

  users[index] = { ...users[index], ...changes };
  writeStorage(USERS_KEY, users);

  const current = getCurrentUser();
  if (current && Number(current.id) === Number(users[index].id)) {
    login(users[index]);
  }

  return users[index];
}

function updatePayMethod(id, payMethod) {
  return updateUser(id, { pay_method: payMethod });
}

function updateUserEmail(id, email) {
  return updateUser(id, { email: String(email || "").trim() });
}

function updateUserAddress(id, address) {
  return updateUser(id, { address: String(address || "").trim() });
}

function login(user) {
  const { id, name, email, role, pay_method, is_locked } = user;

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      id,
      name,
      email,
      role,
      address: getUserAddress(user),
      pay_method,
      is_locked
    })
  );
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Chuyển tới trang đăng nhập, nhớ luôn trang cần quay lại sau khi đăng nhập
function goToAuth(redirectPath) {
  const target = redirectPath || "index.html";
  location.href = getAssetPath(`${AUTH_PAGE_PATH}?redirect=${encodeURIComponent(target)}`);
}

// Chặn thao tác cần đăng nhập: trả về false nếu đã chuyển tới trang đăng nhập
function requireLogin(redirectPath) {
  if (getCurrentUser()) return true;

  goToAuth(redirectPath);
  return false;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  const home = typeof getAssetPath === "function" ? getAssetPath("index.html") : "index.html";
  location.replace(home);
}
