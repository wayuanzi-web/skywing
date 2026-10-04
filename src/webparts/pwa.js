(()=>{'use strict';
const $=id=>document.getElementById(id);
/* offline: cache the game so it opens without a connection */
if('serviceWorker' in navigator)window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
document.addEventListener('gesturestart',e=>e.preventDefault()); /* iOS pinch zoom */

const ua=navigator.userAgent;
const standalone=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
const ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const inApp=/\bLine\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua);

const bar=document.createElement('div');bar.className='appbar';
bar.innerHTML='<button id="btnShare">分享給朋友</button><button id="btnInstall" hidden>安裝到主畫面</button><p id="appTip" hidden></p>';
$('ov-title').prepend(bar);
function tip(t){const p=$('appTip');p.textContent=t;p.hidden=false;clearTimeout(tip.h);tip.h=setTimeout(()=>{p.hidden=true},9000)}

/* share: system share sheet when the browser has one, otherwise copy the link.
   openExternalBrowser=1 makes LINE open the link in the phone's real browser, where installing works. */
const shareUrl=location.origin+location.pathname+'?openExternalBrowser=1';
$('btnShare').addEventListener('click',async()=>{
  try{if(navigator.share){await navigator.share({title:'蒼穹戰翼',text:'來玩飛機射擊遊戲「蒼穹戰翼」，五關五魔王！',url:shareUrl});return}}
  catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(shareUrl);tip('已複製連結，貼給朋友就能玩。')}catch(e){tip(shareUrl)}
});

/* install: native prompt on Android/desktop Chrome, written steps on iPhone and in-app browsers */
let deferred=null;const bi=$('btnInstall');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(!standalone)bi.hidden=false});
window.addEventListener('appinstalled',()=>{bi.hidden=true;tip('已安裝，之後從主畫面的圖示開啟。')});
if(!standalone&&(ios||inApp))bi.hidden=false;
bi.addEventListener('click',async()=>{
  if(deferred){deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;bi.hidden=true;return}
  if(inApp)tip('請先點右上角選單，選「以預設瀏覽器開啟」，再安裝到主畫面。');
  else if(ios)tip('點 Safari 的分享鈕，再選「加入主畫面」。');
});

/* phones in a browser tab: go full screen when the mission starts */
$('btnStart').addEventListener('click',()=>{
  if(standalone||!matchMedia('(pointer:coarse)').matches)return;
  try{const el=document.documentElement,r=el.requestFullscreen&&el.requestFullscreen({navigationUI:'hide'});if(r&&r.catch)r.catch(()=>{})}catch(e){}
  try{const o=screen.orientation;if(o&&o.lock){const r=o.lock('portrait');if(r&&r.catch)r.catch(()=>{})}}catch(e){}
});
})();
