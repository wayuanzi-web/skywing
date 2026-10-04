"""Regenerate the app icons and the link-preview image. Needs: pip install playwright pillow (+ a Noto Sans CJK font)."""
import asyncio, pathlib
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
SRC = pathlib.Path(__file__).resolve().parent; OUT = SRC.parent   # icons live in the repo root
src = (SRC/'parts'/'30-sprites.js').read_text('utf8')
fn = src[src.index('function poly'):src.index('const SPR=')]
HTML = '''<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">
<canvas id="a" width="512" height="512"></canvas><canvas id="m" width="512" height="512"></canvas>
<script>const TAU=Math.PI*2;''' + fn + '''
function icon(id,sc,oy){const c=document.getElementById(id),g=c.getContext('2d');
  const bg=g.createRadialGradient(256,300,40,256,256,380);bg.addColorStop(0,'#24408f');bg.addColorStop(.55,'#122356');bg.addColorStop(1,'#0a0f24');
  g.fillStyle=bg;g.fillRect(0,0,512,512);
  let s=7;const r=()=>{s=(s*1664525+1013904223)|0;return((s>>>8)&0xffff)/65536};
  for(let i=0;i<46;i++){g.globalAlpha=.25+r()*.6;g.fillStyle=r()>.8?'#ffe9b0':'#dfe6ff';const z=2+r()*4;g.fillRect(r()*512,r()*512,z,z)}
  g.globalAlpha=1;
  /* speed streaks */
  g.fillStyle='rgba(98,226,255,.18)';for(let i=0;i<7;i++){g.fillRect(40+r()*432,r()*512,3,60+r()*90)}
  g.save();g.translate(256,256+oy);g.scale(sc,sc);g.lineJoin='round';
  /* twin shots */
  g.fillStyle='#ffd34a';g.fillRect(-7,-36,3,10);g.fillRect(4,-36,3,10);g.fillStyle='#fffbe6';g.fillRect(-6.3,-35,1.6,7);g.fillRect(4.7,-35,1.6,7);
  /* engine flame */
  g.fillStyle='#ffb347';g.beginPath();g.moveTo(-4,17);g.lineTo(0,31);g.lineTo(4,17);g.fill();g.fillStyle='#fff7d0';g.beginPath();g.moveTo(-1.6,17);g.lineTo(0,24);g.lineTo(1.6,17);g.fill();
  sym(g,[0,-2,22,10,22,15,0,9],'#1f5fa8','#0b1430');sym(g,[3,-11,13,-7,13,-4,3,-5],'#f4b740','#0b1430');
  jet(g,{len:36,span:36,sweep:3,bw:5,body:'#ffffff',wing:'#38a8e8',tail:.6,glass:'#ffd45c',trim:'#f4b740',pods:1});
  g.restore();
}
icon('a',9.2,-6);icon('m',6.6,-4);
</script>'''
async def main():
    (SRC/'dist').mkdir(exist_ok=True); (SRC/'dist'/'icon.html').write_text(HTML,'utf8')
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1100,'height':600})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+str(SRC/'dist'/'icon.html')); await pg.wait_for_timeout(300)
        await (await pg.query_selector('#a')).screenshot(path=str(OUT/'icon-512.png'))
        await (await pg.query_selector('#m')).screenshot(path=str(OUT/'icon-maskable-512.png'))
        await b.close(); print('icon errs', errs)
    im = Image.open(OUT/'icon-512.png').convert('RGB')
    im.resize((192,192), Image.LANCZOS).save(OUT/'icon-192.png')
    im.resize((180,180), Image.LANCZOS).save(OUT/'apple-touch-icon.png')
    # link-preview image 1200x630: title on the left, gameplay on the right
    og = Image.new('RGB',(1200,630),'#0a0f24'); d = ImageDraw.Draw(og)
    shot = Image.open(SRC/'og-shot.png').convert('RGB')   # a gameplay screenshot, portrait
    h = 630; w = int(shot.width*h/shot.height); og.paste(shot.resize((w,h), Image.LANCZOS),(1200-w-60,0))
    black = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
    def font(sz):
        for idx in range(8):
            f = ImageFont.truetype(black, sz, index=idx)
            if 'TC' in ' '.join(f.getname()): return f
        return ImageFont.truetype(black, sz, index=0)
    d.text((70,118),'蒼穹',font=font(160),fill='#eef1ff'); d.text((70,288),'戰翼',font=font(160),fill='#62e2ff')
    d.text((76,70),'VERTICAL STRIKE · 5 MISSIONS',font=font(30),fill='#f4b740')
    d.text((76,520),'五關五魔王・手機拖曳就能玩',font=font(36),fill='#eef1ff')
    og.save(OUT/'og.png', optimize=True)
    print('icons and og.png written to', OUT)
asyncio.run(main())
