# Portfolio

自己紹介サイト。

**Live:** https://gzer0-dev.github.io/portfolio/

## 構成

- 静的サイト（ビルド不要）。GitHub Pages が `master` ブランチ直下を配信。
- 依存ライブラリなし（vanilla HTML / CSS / JS）。フォントのみ Google Fonts。
- ダーク/ライトテーマ対応（OS設定追従 + 手動トグル、localStorage 保存）。

| ファイル | 役割 |
|---|---|
| `index.html` | 全コンテンツ（Hero / Works / Practice / Skills / Contact） |
| `assets/style.css` | デザイントークン + スタイル |
| `assets/script.js` | テーマ切り替えとスクロールフェードイン |

## 更新方法

`index.html` を直接編集して `master` に push するだけで反映される（Pages の再ビルドに数分かかる）。
