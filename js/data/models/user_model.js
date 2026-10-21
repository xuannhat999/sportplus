class UserModel {
  constructor(id, name, email, password, address, pay_method, role, is_locked) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.address = address;
    this.pay_method = pay_method;
    this.role = role;
    this.is_locked = is_locked;
  }
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.address = user.address;
    this.pay_method = user.pay_method;
    this.role = user.role;
    this.is_locked = user.is_locked;
  }
}
