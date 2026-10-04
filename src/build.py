#!/usr/bin/env python3
"""Build 蒼穹戰翼.

    python3 src/build.py [public base URL]

Reads src/parts/* in filename order and writes:
  index.html, sw.js, manifest.webmanifest   the installable web app (repo root, served by GitHub Pages)
  src/dist/skywing.html                      the same game as one page fragment (for a Claude artifact)
"""
import pathlib, shutil, subprocess, sys, time

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else 'https://wayuanzi-web.github.io/skywing/'

game = ''.join(p.read_text('utf8') for p in sorted((SRC / 'parts').iterdir()) if p.is_file())
(SRC / 'dist').mkdir(exist_ok=True)
(SRC / 'dist' / 'skywing.html').write_text(game, 'utf8')

# optional syntax check of the game script when node is installed
a, b = game.index('<script>') + 8, game.rindex('</script>')
(SRC / 'dist' / '_script.js').write_text(game[a:b], 'utf8')
if shutil.which('node'):
    subprocess.run(['node', '--check', str(SRC / 'dist' / '_script.js')], check=True)

i = game.index('<div id="cab">')
head, body = game[:i].rstrip(), game[i:].rstrip()
build = time.strftime('%Y%m%d%H%M%S')
web = SRC / 'webparts'
doc = f'''<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#0a0f24">
<meta name="color-scheme" content="dark">
<meta name="description" content="直向飛機射擊遊戲：五關五魔王、三種可升級武器、四種炸彈。手機拖曳就能玩。">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="蒼穹戰翼">
<meta property="og:type" content="website">
<meta property="og:title" content="蒼穹戰翼">
<meta property="og:description" content="五關五魔王的飛機射擊遊戲，手機拖曳就能玩。">
<meta property="og:url" content="{BASE}">
<meta property="og:image" content="{BASE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
:root{{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}}
[hidden]{{display:none!important}}
img{{max-width:100%}}
</style>
{head}
<style>
{(web / 'pwa.css').read_text('utf8').strip()}
</style>
</head>
<body>
{body}
<script>
{(web / 'pwa.js').read_text('utf8').strip()}
</script>
</body>
</html>
'''
(ROOT / 'index.html').write_text(doc, 'utf8')
# the build stamp names the offline cache, so every deploy replaces the old one
(ROOT / 'sw.js').write_text((web / 'sw.js').read_text('utf8').replace('__BUILD__', build), 'utf8')
shutil.copy(web / 'manifest.webmanifest', ROOT / 'manifest.webmanifest')
(ROOT / '.nojekyll').touch()
print(f'built {build}: index.html {len(doc.encode("utf8"))} bytes, base {BASE}')
