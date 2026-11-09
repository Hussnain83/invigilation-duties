// Floating digits behind the layout, plus count-up for stat numbers.
// Both are decoration only: the page is complete without this script, and
// reduced-motion users get a still background and final numbers at once.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Floating digits -------------------------------------------------
  var canvas = document.getElementById('floaters');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var items = [];
    var colors = ['#7c3aed', '#f5b53b', '#18181b'];

    var size = function () {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var seed = function () {
      items = [];
      var n = Math.min(40, Math.round(innerWidth * innerHeight / 30000));
      for (var i = 0; i < n; i++) {
        items.push({
          x: Math.random() * innerWidth,
          y: Math.random() * innerHeight,
          s: 14 + Math.random() * 26,
          v: 0.1 + Math.random() * 0.25,
          d: String(Math.floor(Math.random() * 10000)),
          a: 0.05 + Math.random() * 0.07,
          c: colors[i % colors.length],
          drift: Math.random() * 6.28
        });
      }
    };

    var frame = function (t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!reduce) {
          it.y -= it.v;
          it.x += Math.sin(t / 3000 + it.drift) * 0.15;
          if (it.y < -40) { it.y = innerHeight + 40; it.x = Math.random() * innerWidth; }
        }
        ctx.globalAlpha = it.a;
        ctx.fillStyle = it.c;
        ctx.font = '600 ' + it.s + 'px Inter, system-ui, sans-serif';
        ctx.fillText(it.d, it.x, it.y);
      }
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(frame);
    };

    size();
    seed();
    requestAnimationFrame(frame);
    if (!reduce) {
      addEventListener('resize', function () { size(); seed(); });
    }
  }

  // ---- Count-up for stat numbers --------------------------------------
  // Any .stat whose text is a plain whole number counts up from zero once.
  var numbers = document.querySelectorAll('.stat');
  for (var j = 0; j < numbers.length; j++) {
    var el = numbers[j];
    var text = el.textContent.trim();
    if (!/^\d[\d,]*$/.test(text) || reduce) continue;
    var target = parseInt(text.replace(/,/g, ''), 10);
    var start = null;
    el.textContent = '0';
    (function (node, goal) {
      var step = function (now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / 1200);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(goal * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    })(el, target);
  }
})();
