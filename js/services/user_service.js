const USER_ROLE_BUYER = "buyer";
const USER_ROLE_ADMIN = "admin";

function getUsers() {
  return (typeof USERS !== "undefined" && Array.isArray(USERS)) ? USERS : [];
}

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

function getCurrentUser() {
  return getUsers()[0] || null;
}
