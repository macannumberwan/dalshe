// Переходник из профилей соцсетей в Telegram (ресерч: channels/tech-tips/research/tt-bio-links-2026-10-23/).
// Встроенный браузер TikTok не передаёт ссылку t.me в приложение: кнопка «Открыть в Telegram» падает с ошибкой.
//  • Android — сразу открываем Telegram через intent:// (системная ссылка, встроенные браузеры её пропускают);
//  • iPhone внутри TikTok — tg:// и выход в Safari не работают (проверка scribo-ai.com/tt, 16.09.2026):
//    только подсказка «⋯ › Открыть в браузере» и копирование ссылки;
//  • iPhone в Safari и других встроенных браузерах — tg://, запасной путь t.me;
//  • компьютер и прочее — сразу на t.me.
// Настройка на странице: window.LINK = { invite: "хеш из t.me/+…" } или { domain: "имя", start: "метка" }.
(function () {
  var c = window.LINK || {};
  var path = c.invite
    ? "join?invite=" + c.invite
    : "resolve?domain=" + c.domain + (c.start ? "&start=" + encodeURIComponent(c.start) : "");
  var tme = c.invite
    ? "https://t.me/+" + c.invite
    : "https://t.me/" + c.domain + (c.start ? "?start=" + encodeURIComponent(c.start) : "");
  var tg = "tg://" + path;
  var intent = "intent://" + path + "#Intent;scheme=tg;S.browser_fallback_url=" + encodeURIComponent(tme) + ";end";

  var ua = navigator.userAgent || "";
  var android = /Android/i.test(ua);
  var ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var tiktok = /musical_ly|BytedanceWebview|TikTok|trill_/i.test(ua);
  var inApp = tiktok || /Instagram|FBAN|FBAV|VKClient|Line\//i.test(ua) || (ios && !/Safari\//.test(ua));

  var btn = document.getElementById("open");
  var copy = document.getElementById("copy");
  var showHint = function () { document.body.classList.add("hint"); };
  // Метки для статистики: запрос /e?e=… сервер отвечает пустым 204 и пишет в журнал (tools/link-site/stats.py).
  var ev = function (name) {
    var u = "/e?e=" + name + "&p=" + encodeURIComponent(location.pathname);
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(u))) new Image().src = u; } catch (e) {}
  };
  btn.addEventListener("click", function () { ev("btn"); });

  copy.addEventListener("click", function () {
    ev("copy");
    var done = function () { copy.textContent = copy.getAttribute("data-done"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(tme).then(done, fallback);
    } else fallback();
    function fallback() {
      var t = document.createElement("textarea");
      t.value = tme; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(t);
    }
  });

  btn.href = tme;
  if (android) {
    btn.href = intent;
    // Страница ушла в фон за 2,5 с — открылся Telegram (and-left); осталась на экране — подсказка (and-hint).
    var start = Date.now();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && Date.now() - start < 2500) ev("and-left");
    }, { once: true });
    location.href = intent;
    setTimeout(function () { if (!document.hidden) { showHint(); ev("and-hint"); } }, 2500);
  } else if (ios && tiktok) {
    document.body.classList.add("blocked");
    showHint();
  } else if (ios && inApp) {
    btn.href = tg;
    showHint();
  } else if (ios) {
    btn.href = tg;
    location.href = tg;
    // Telegram не установлен — Safari не откроет tg://, тогда кнопка ведёт на t.me (там ссылка на App Store).
    setTimeout(function () { if (!document.hidden) btn.href = tme; }, 1500);
  } else {
    location.replace(tme);
  }
})();
