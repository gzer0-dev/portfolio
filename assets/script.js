// テーマ切り替え: 明示選択を localStorage に保存、未選択時はOS設定に追従
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.dataset.theme = saved;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('theme-toggle');
    toggle.addEventListener('click', function () {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const current = document.documentElement.dataset.theme || (prefersDark ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
    });

    // スクロール時のフェードイン
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  });
})();
