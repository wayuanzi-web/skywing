/* ================= render, main loop, UI wiring, boot ================= */
function render(){
  ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0);
  ctx.save();
  if(G.shake>0&&!REDUCED)ctx.translate(rnd(-1,1)*G.shake*8,rnd(-1,1)*G.shake*8);
  drawBG(G.stage);drawGround();
  if(G.freeze>0){ctx.fillStyle='rgba(120,210,255,.16)';ctx.fillRect(0,0,W,H)}
  drawBombs();drawHazards();drawEnemies();drawBoss();drawItems();drawPB();drawZaps();drawPlayer();drawEB();drawMarks();drawFx();
  ctx.restore();
  drawSub();
  if(G.flash>0){ctx.globalAlpha=Math.min(.8,G.flash*(REDUCED?.6:1.6));ctx.fillStyle=G.flashCol;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
}
/* ground layer: sea/land targets and a ship boss sit under everything that flies */
function drawGround(){
  const B=G.boss;if(B&&B.i>=5&&B.ground)drawBoss2(B);
  drawEnemies(true);
  if(G.wind){ctx.strokeStyle='rgba(235,248,255,.35)';ctx.lineWidth=1.2;const s=Math.sign(G.wind);
    for(let j=0;j<26;j++){const y=(j*61+G.t*40)%H,x=((j*137+G.t*s*260)%(W+80)+W+80)%(W+80)-40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-s*18,y-2);ctx.stroke()}
    ctx.fillStyle='rgba(235,248,255,.8)';ctx.font='900 12px '+CF;ctx.textAlign='center';ctx.fillText(s>0?'暴風雪 →':'← 暴風雪',W/2,H*.5)}
}
/* warning marks: chevrons where a raider will climb in from below, and icicle drop lines */
function drawMarks(){
  for(const m of marks){
    ctx.globalAlpha=Math.sin(m.t*28)>0?1:.35;
    if(m.kind==='rear'){ctx.fillStyle='#ff4a5c';for(let j=0;j<2;j++){const y=H-16-j*13;ctx.beginPath();ctx.moveTo(m.x-11,y+6);ctx.lineTo(m.x,y-5);ctx.lineTo(m.x+11,y+6);ctx.lineTo(m.x+11,y+11);ctx.lineTo(m.x,y);ctx.lineTo(m.x-11,y+11);ctx.closePath();ctx.fill()}}
    else{ctx.strokeStyle='rgba(159,232,255,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m.x,60);ctx.lineTo(m.x,H);ctx.stroke();
      ctx.fillStyle='#bfeaff';ctx.beginPath();ctx.moveTo(m.x-8,62);ctx.lineTo(m.x+8,62);ctx.lineTo(m.x,76);ctx.closePath();ctx.fill()}
  }
  ctx.globalAlpha=1;
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
  setStart(clamp(data.stage!==undefined?data.stage:store.get('start',0),0,9));
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
