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

  // 全テストが通った瞬間に紙吹雪を舞わせる（依存ゼロのDOMパーティクル）
  function burstConfetti(originEl) {
    if (prefersReducedMotion) return;
    const colors = ['#2dd4bf', '#7c6cf0', '#4ade80', '#febc2e', '#ff5f57'];
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 3;

    for (let i = 0; i < 44; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.background = colors[i % colors.length];
      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      document.body.appendChild(piece);

      const angle = (Math.PI * 2 * i) / 44 + Math.random() * 0.5;
      const distance = 90 + Math.random() * 180;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - 60 + Math.random() * 220;
      const rotation = 360 + Math.random() * 540;

      piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + destX + 'px, ' + destY + 'px) rotate(' + rotation + 'deg)', opacity: 0 },
        ],
        { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(0.15, 0.6, 0.4, 1)', fill: 'forwards' },
      ).onfinish = function () { piece.remove(); };
    }
  }

  // ターミナル風に1行ずつタイプ表示する Run 演出。全テスト PASSED → 紙吹雪
  function playRunOutput(outputEl, cardEl) {
    const lines = [
      { text: '$ pytest portfolio.py -v', cls: 'out-cmd' },
      { text: 'collected 4 items', cls: 'out-dim' },
      { text: '', cls: '' },
      { text: 'test_ships_games_solo (25 released) ....... ', cls: 'out-dim', pass: true },
      { text: 'test_proves_quality_with_machines ......... ', cls: 'out-dim', pass: true },
      { text: 'test_keeps_learning (8 certifications) .... ', cls: 'out-dim', pass: true },
      { text: 'test_ready_to_join_your_team .............. ', cls: 'out-dim', pass: true },
      { text: '', cls: '' },
      { text: '======= 4 passed in 0.04s ✅ =======', cls: 'out-pass', confetti: true },
      { text: '', cls: '' },
      { text: '$ python portfolio.py', cls: 'out-cmd' },
      { text: 'Nice to meet you 👋', cls: 'out-hello' },
    ];
    outputEl.hidden = false;
    outputEl.textContent = '';

    function appendPassBadge(afterSpan) {
      const badge = document.createElement('span');
      badge.className = 'out-passed';
      badge.textContent = 'PASSED\n';
      afterSpan.after(badge);
      return badge;
    }

    if (prefersReducedMotion) {
      lines.forEach(function (line) {
        const span = document.createElement('span');
        span.className = line.cls;
        span.textContent = line.text + (line.pass ? '' : '\n');
        outputEl.appendChild(span);
        if (line.pass) appendPassBadge(span);
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
        clearInterval(interval);
        span.textContent = line.text + (line.pass ? '' : '\n');
        // テスト行は少し「実行中」の間を置いてから PASSED を点灯させる
        if (line.pass) {
          setTimeout(function () {
            appendPassBadge(span);
            lineIndex += 1;
            typeLine();
          }, 260);
          return;
        }
        if (line.confetti) burstConfetti(cardEl);
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
    const codeCard = document.querySelector('.code-card');
    runBtn.addEventListener('click', function () {
      playRunOutput(runOutput, codeCard);
    });

    // ロゴ(>_)はターミナルプロンプトの見た目なので、クリックで実際に「実行」する。
    // 最上部で押しても必ず何かが起きるようにするため（見た目だけクリッカブルの防止）。
    document.querySelector('.brand').addEventListener('click', function (event) {
      event.preventDefault();
      const isNearTop = window.scrollY < window.innerHeight * 0.3;
      if (!isNearTop) {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      codeCard.classList.remove('card-glow');
      void codeCard.offsetWidth; // アニメーションを最初から再生し直すためのリフロー
      codeCard.classList.add('card-glow');
      setTimeout(function () {
        playRunOutput(runOutput, codeCard);
      }, isNearTop ? 150 : 600);
    });

    // ヒーローを過ぎたら「↑ 先頭へ戻る」ボタンを出す
    const toTopBtn = document.getElementById('to-top');
    toTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', function () {
      toTopBtn.classList.toggle('shown', window.scrollY > window.innerHeight * 0.6);
    }, { passive: true });

    // タッチ端末はホバーが効かないので、タップでツールチップを開閉する
    document.querySelectorAll('.chips li[data-tip]').forEach(function (chip) {
      chip.addEventListener('click', function (event) {
        event.stopPropagation();
        const isOpen = chip.classList.contains('tip-open');
        document.querySelectorAll('.chips li.tip-open').forEach(function (open) {
          open.classList.remove('tip-open');
        });
        if (!isOpen) chip.classList.add('tip-open');
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.chips li.tip-open').forEach(function (open) {
        open.classList.remove('tip-open');
      });
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
