# 蒼穹戰翼

直向飛機射擊遊戲，做成可安裝的網頁 App（PWA）。不需要帳號，手機點開就能玩：

**https://wayuanzi-web.github.io/skywing/**

傳給 LINE 上的朋友時，網址後面加 `?openExternalBrowser=1`，連結會用手機的瀏覽器開啟（LINE 內建瀏覽器不能安裝到主畫面）。

## 玩法

- 在畫面上拖曳移動戰機，子彈自動連發。只有機身中央的紅點會被擊中。
- 擊落金色補給機會掉膠囊；每擊落 16 架敵機也會掉一顆武器膠囊。
- 下方四顆按鈕投炸彈：核爆（全畫面清場）、雷電（連續落雷）、冰凍（子彈變獎牌）、黑洞（吸走子彈）。
- 五關，每關尾端一個魔王。標題畫面可選難度與起始關卡。
- 電腦鍵盤：方向鍵／WASD 移動、Shift 慢速、1–4 投炸彈、P 暫停。

## 檔案

| 路徑 | 內容 |
| --- | --- |
| `index.html` `sw.js` `manifest.webmanifest` | 上線的網頁 App，由建置腳本產生，不要直接改 |
| `icon-*.png` `apple-touch-icon.png` `og.png` | App 圖示與連結預覽圖 |
| `src/parts/` | 遊戲原始碼，依檔名順序串接 |
| `src/webparts/` | 網頁 App 專用：分享與安裝按鈕、離線快取、manifest |
| `src/build.py` | 建置腳本 |
| `src/gen_icons.py` | 重新產生圖示與預覽圖（需要 playwright、pillow） |

## 修改與上線

```
python3 src/build.py      # 重新產生 index.html、sw.js、manifest
git add -A && git commit -m "..." && git push
```

GitHub Pages 從 `main` 分支根目錄發布，推上去約一分鐘後生效。每次建置會換一個離線快取名稱，玩家下次連線開啟就會拿到新版。

`sw.js` 換版時只清自己的舊快取（名稱以 `skywing-` 開頭）。同帳號的 GitHub Pages 網站（`wayuanzi-web.github.io/…`）共用同一個網域的快取空間，不能動到別的網站的。

主要調整參數都在 `src/parts/` 前段：`DIFF`（難度倍率）、`BDEF`（魔王血量）、`ED`（敵機血量與分數）、`WAVES`（各關波次）、`fire()`（武器火力）。
