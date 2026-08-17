// テーマ切り替え: 明示選択を localStorage に保存、未選択時はOS設定に追従
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.dataset.theme = saved;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ease-out で 0 → target までカウントアップ
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const durationMs = 1100;
    let startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ターミナル風に1行ずつタイプ表示する Run 演出
  function playRunOutput(outputEl) {
    const lines = [
      { text: '$ pytest portfolio.py', cls: 'out-cmd' },
      { text: 'collected 1 item', cls: 'out-dim' },
      { text: 'portfolio.py .                    [100%]', cls: 'out-dim' },
      { text: '======= 1 passed in 0.01s =======', cls: 'out-pass' },
      { text: '', cls: '' },
      { text: "print('Nice to meet you')", cls: 'out-cmd' },
      { text: 'Nice to meet you 👋', cls: 'out-hello' },
    ];
    outputEl.hidden = false;
    outputEl.textContent = '';

    if (prefersReducedMotion) {
      lines.forEach(function (line) {
        const p = document.createElement('span');
        p.className = line.cls;
        p.textContent = line.text + '\n';
        outputEl.appendChild(p);
      });
      return;
    }

    let lineIndex = 0;
    function typeLine() {
      if (lineIndex >= lines.length) return;
      const line = lines[lineIndex];
      const span = document.createElement('span');
      span.className = line.cls;
      outputEl.appendChild(span);

      let charIndex = 0;
      // コマンド行は1文字ずつ、出力行は一括表示（実際のターミナルの挙動に寄せる）
      const isTyped = line.cls === 'out-cmd';
      const interval = setInterval(function () {
        if (isTyped && charIndex < line.text.length) {
          charIndex += 1;
          span.textContent = line.text.slice(0, charIndex);
          return;
        }
        span.textContent = line.text + '\n';
        clearInterval(interval);
        lineIndex += 1;
        setTimeout(typeLine, isTyped ? 120 : 180);
      }, isTyped ? 28 : 0);
    }
    typeLine();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('theme-toggle').addEventListener('click', function () {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const current = document.documentElement.dataset.theme || (prefersDark ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
    });

    const runBtn = document.getElementById('run-btn');
    const runOutput = document.getElementById('run-output');
    runBtn.addEventListener('click', function () {
      playRunOutput(runOutput);
    });

    // 同じ親の中では 90ms ずつ遅らせて時差フェードインにする
    document.querySelectorAll('.cards, .practice-grid, .skill-groups').forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, index) {
        if (child.classList.contains('reveal')) {
          child.style.transitionDelay = (index % 3) * 90 + 'ms';
        }
      });
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('stats') && !prefersReducedMotion) {
            entry.target.querySelectorAll('.stat-num').forEach(countUp);
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  });
})();
