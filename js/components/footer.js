(function () {
  var footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  var root = document.body.dataset.root || '';
  var footerHTML = `
<footer class="footer" id="footer">
  <div class="footer__grid">
    <div class="footer__brand">
      <a href="${root}index.html" class="footer__name">SportPlus</a>
      <p class="footer__desc">Cửa hàng áo bóng đá: áo đội tuyển quốc gia và áo câu lạc bộ.</p>
    </div>
    <div class="footer__col">
      <h4 class="footer__title">Mua sắm</h4>
      <ul class="footer__list">
        <li><a class="footer__link" href="${root}index.html">Trang chủ</a></li>
        <li><a class="footer__link" href="${root}index.html">Áo đội tuyển</a></li>
        <li><a class="footer__link" href="${root}index.html">Áo câu lạc bộ</a></li>
        <li><a class="footer__link" href="${root}pages/cart.html">Giỏ hàng</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4 class="footer__title">Tài khoản</h4>
      <ul class="footer__list">
        <li><a class="footer__link" href="${root}pages/auth.html">Đăng nhập</a></li>
        <li><a class="footer__link" href="${root}pages/orders.html">Lịch sử mua hàng</a></li>
        <li><a class="footer__link" href="${root}pages/account.html">Tài khoản</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4 class="footer__title">Liên hệ</h4>
      <p class="footer__text">Email: support@sportplus.vn</p>
      <p class="footer__text">Hotline: 1900 0000</p>
    </div>
  </div>
  <div class="footer__bottom">© 2026 SportPlus.</div>
</footer>
`;
  footerContainer.innerHTML = footerHTML;
})();
