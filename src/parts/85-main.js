/* ================= render, main loop, UI wiring, boot ================= */
function render(){
  ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0);
  ctx.save();
  if(G.shake>0&&!REDUCED)ctx.translate(rnd(-1,1)*G.shake*8,rnd(-1,1)*G.shake*8);
  drawBG(G.stage);
  if(G.freeze>0){ctx.fillStyle='rgba(120,210,255,.16)';ctx.fillRect(0,0,W,H)}
  drawBombs();drawHazards();drawEnemies();drawBoss();drawItems();drawPB();drawPlayer();drawEB();drawFx();
  ctx.restore();
  if(G.flash>0){ctx.globalAlpha=Math.min(.8,G.flash*(REDUCED?.6:1.6));ctx.fillStyle=G.flashCol;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
}
let last=0;
let errN=0;
function frame(ts){
  requestAnimationFrame(frame); /* scheduled first: one bad frame must never freeze the game */
  const dt=Math.min(.034,Math.max(0,(ts-last)/1000));last=ts;
  try{
    if(G.mode==='play')update(dt);
    else if(G.mode==='title')demo(dt);
    else if(G.mode!=='pause'){updFx(dt);if(G.flash>0)G.flash=Math.max(0,G.flash-dt);G.shake=0}
    render();AU.tick();
  }catch(e){if(errN++<5)console.error(e)}
}
function seg(id,key,onSet){
  const box=$(id);
  const set=v=>{box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===v)));onSet(v);store.set(key,v)};
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(b)set(+b.dataset.v)});
  return set;
}
const setDiff=seg('segDiff','diff',v=>{G.diff=v});
const setStart=seg('segStage','start',v=>{G.startStage=v});
$('btnStart').addEventListener('click',()=>{
  AU.init();AU.resume();wake();
  /* a silent utterance inside the tap lets the boss warning speak later on phones */
  try{if(G.sound){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}}catch(e){}
  startGame(G.startStage);
});
$('btnResume').addEventListener('click',resumeGame);
$('btnRetryP').addEventListener('click',()=>{AU.resume();retryStage()});
$('btnQuitP').addEventListener('click',toTitle);
$('btnRetry').addEventListener('click',()=>{AU.resume();retryStage()});
$('btnQuit').addEventListener('click',toTitle);
$('btnNext').addEventListener('click',()=>startStage(G.stage+1));
$('btnAgain').addEventListener('click',toTitle);
$('btnPause').addEventListener('click',pauseGame);
function sndUI(){$('btnSnd').classList.toggle('off',!G.sound)}
$('btnSnd').addEventListener('click',()=>{G.sound=!G.sound;store.set('snd',G.sound);AU.setMute();sndUI()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
try{const mq=matchMedia('(orientation:landscape) and (max-height:460px) and (pointer:coarse)');
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(e=>{if(e.matches)pauseGame()})}catch(e){}
window.addEventListener('blur',()=>{if(G.mode==='play'&&drag===null&&document.hidden)pauseGame()});

function boot(data){
  data=data||{};
  setDiff(clamp(data.diff!==undefined?data.diff:store.get('diff',0),0,2));
  setStart(clamp(data.stage!==undefined?data.stage:store.get('start',0),0,4));
  sndUI();setMode('title');resize();
  if(window.ResizeObserver)new ResizeObserver(resize).observe(stageEl);
  try{document.fonts&&document.fonts.load('900 12px "Noto Sans TC"','火射追核電冰洞僚盾戰機護擋下啟動加入爆彈雷凍黑神砲貫穿蹤飛魔王暴走力升級')}catch(e){}
  requestAnimationFrame(t=>{last=t;frame(t)});
}
const hot=window.claude&&window.claude.hot;
try{hot&&hot.snapshot&&hot.snapshot(()=>({diff:G.diff,stage:G.mode==='title'?G.startStage:G.stage}))}catch(e){}
if(hot&&hot.ready)hot.ready(boot);else boot(hot&&hot.data);
})();
</script>
