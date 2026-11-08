/* 딱딜 기획전 전용 페이지 공용 렌더러 (예: /xmas)
   - 페이지가 열릴 때 이 함수로 목록을 다시 그리고,
   - 매일 아침 갱신 작업도 같은 함수로 정적 HTML(<!--XIDX-->, <!--XSSR-->)과 JSON-LD를 만들어 넣는다.
   데이터 형식은 메인 페이지 기획전과 같다: {id,code,name,sale,orig,img,pt,rc,ra,tag,n,unit,note,con} */
(function () {
  var CDN = "https://thumbnail.coupangcdn.com/thumbnails/remote/";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function won(n) { return Number(n).toLocaleString("ko-KR") + "원"; }
  function rate(d) { return Math.round((1 - d.sale / d.orig) * 100); }
  function attrs(d) { return 'href="https://link.coupang.com/a/' + esc(d.code) + '" target="_blank" rel="sponsored nofollow noopener" data-id="' + esc(d.id) + '"'; }

  window.ddEvIndex = function (L) {
    return '<ol class="xidx">' + (L || []).map(function (d, i) {
      return '<li><a href="#x-' + esc(d.id) + '"><span class="no">' + (i + 1) + '</span><span class="nm">' + esc(d.name) +
        '</span><span class="pr">' + won(d.sale) + '</span></a></li>';
    }).join("") + "</ol>";
  };

  window.ddEvCards = function (L) {
    return (L || []).map(function (d, i) {
      var r = rate(d);
      var unit = d.n > 0 ? '<span class="punit">' + (/^\d/.test(d.unit) ? "" : "1") + esc(d.unit) + "당 <b>" + won(Math.round(d.sale / d.n)) + "</b></span>" : "";
      return '<article class="xcard" id="x-' + esc(d.id) + '"><div class="in">' +
        '<div class="xc-top"><span class="xc-no">' + (i + 1) + '</span><span class="ptag">' + esc(d.tag) + "</span>" + unit + "</div>" +
        '<a class="xc-main" ' + attrs(d) + ">" +
          '<div class="pthumb"><img src="' + CDN + "492x492ex/" + esc(d.img) + '" alt="' + esc(d.name) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>' +
          '<div class="pinfo"><h3 class="pname">' + esc(d.name) + "</h3>" +
            '<div class="price-row">' + (r > 0 ? '<span class="rate">' + r + "%</span>" : "") + '<span class="price">' + won(d.sale) + "</span></div>" +
            (r > 0 || d.pt === "wow" ? '<div class="sub">' + (r > 0 ? "<s>" + won(d.orig) + "</s>" : "") + (d.pt === "wow" ? '<span class="wow">와우가</span>' : "") + "</div>" : "") +
            '<div class="pstar">' + (d.ra > 0 ? "<span>★</span> " + Number(d.ra).toFixed(1) + " · " : "") + "리뷰 " + Number(d.rc).toLocaleString("ko-KR") + "개</div>" +
          "</div></a>" +
        '<p class="pnote"><em>리뷰 요약</em>' + esc(d.note) + "</p>" +
        (d.con ? '<p class="pcon">아쉬운 점 · ' + esc(d.con) + "</p>" : "") +
        '<a class="xc-cta" ' + attrs(d) + ">쿠팡에서 지금 가격 보기</a>" +
      "</div></article>";
    }).join("");
  };

  /* opts: {url, name, desc, kst:'YYYY-MM-DD', dateText:'M월 D일'} */
  window.ddEvLd = function (L, o) {
    var S = "https://ddakdeal.github.io/";
    var g = [
      { "@type": "WebPage", "@id": o.url + "#page", "url": o.url, "name": o.name, "description": o.desc, "isPartOf": { "@id": S + "#site" }, "dateModified": o.kst, "inLanguage": "ko-KR" },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "딱딜", "item": S },
        { "@type": "ListItem", "position": 2, "name": o.name, "item": o.url } ] },
      { "@type": "ItemList", "name": o.name + " " + (L || []).length + "가지 (" + o.dateText + " 기준)", "numberOfItems": (L || []).length,
        "itemListElement": (L || []).map(function (d, i) { return { "@type": "ListItem", "position": i + 1, "name": d.name, "url": o.url + "#x-" + d.id }; }) }
    ];
    return JSON.stringify({ "@context": "https://schema.org", "@graph": g }).replace(/</g, "\\u003c");
  };
})();
