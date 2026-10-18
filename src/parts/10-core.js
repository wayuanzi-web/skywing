/* ================= core: state, utils, sizing, input ================= */
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d'),stageEl=$('stage');
const W=360;let H=640,SC=1,DPR=1;
const TAU=Math.PI*2;
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const pick=a=>a[(Math.random()*a.length)|0];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const pad7=n=>String(Math.floor(n)).padStart(7,'0');
const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={
  get(k,d){try{const v=localStorage.getItem('skywing.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('skywing.'+k,JSON.stringify(v))}catch(e){}}
};

const STAGES=[
  {name:'海岸防線',boss:'鐵翼轟炸王',sky:['#0b3b6e','#1a6fa8'],deco:'#2f8fc4',tint:'#7fa3b8'},
  {name:'沙漠風暴',boss:'沙暴毒蠍',sky:['#7a4a1e','#c98a3c'],deco:'#a8702c',tint:'#c2a070'},
  {name:'雷雲亂流',boss:'雷雲母艦',sky:['#1c2140','#4a4f86'],deco:'#6c72ad',tint:'#9a9fd0'},
  {name:'熔岩要塞',boss:'熔核機甲',sky:['#1e0a0a','#5c1a10'],deco:'#ff6a2a',tint:'#c97a60'},
  {name:'大氣層外',boss:'大魔王・終焉星核',sky:['#04050f','#120a2e'],deco:'#b98cff',tint:'#a48ad8'},
  /* chapter 2: spd = background scroll speed (chapter 1 uses 70 + 12 per stage) */
  {name:'冰原基地',boss:'寒霜堡壘',sky:['#22506f','#5d8fb0'],spd:120},
  {name:'鋼鐵艦隊',boss:'超級航艦・怒濤號',sky:['#0a2c40','#165468'],spd:110},
  {name:'叢林遺跡',boss:'遺跡守護神',sky:['#0f2d1a','#2a5428'],spd:112},
  {name:'霓虹夜城',boss:'雙子王牌・赤影與蒼影',sky:['#08061a','#1b1036'],spd:170},
  {name:'虛空王座',boss:'虛空之王',sky:['#04010b','#1c0533'],spd:92}
];
const SSPD=i=>STAGES[i].spd||70+i*12;   /* background scroll px/s */
const GS=()=>SSPD(G.stage)*.5;          /* ground layer (parallax 0.5) */
const CH2=()=>G.stage>=5;                /* chapter 2: overdrive gauge + chain lightning */
const WEAPONS=[
  {name:'火神砲',col:'#ff6b5e'},
  {name:'貫穿雷射',col:'#62e2ff'},
  {name:'追蹤飛彈',col:'#7dff9a'},
  {name:'連鎖閃電',col:'#c79bff'}
];
const WN=()=>CH2()?4:3;                  /* weapon types a capsule can turn into */
const BOMBS=[{name:'核爆彈',col:'#ff7a3c'},{name:'雷電彈',col:'#ffe45c'},{name:'冰凍彈',col:'#8fe9ff'},{name:'黑洞彈',col:'#b98cff'}];
const DIFF=[{spd:.78,rate:1.35,hp:.85},{spd:1,rate:1,hp:1},{spd:1.22,rate:.78,hp:1.2}];

const G={mode:'title',stage:0,diff:0,startStage:0,t:0,score:0,hi:store.get('hi',0),lives:3,
  shake:0,flash:0,flashCol:'#fff',freeze:0,phase:'waves',phaseT:0,waveI:0,waveT:0,boss:null,
  extend:150000,killN:0,wind:0,subT:0,subTxt:'',subCol:'#fff',sound:store.get('snd',true),hudDirty:true,demoT:0};
const P={x:W/2,y:520,r:4,alive:true,inv:0,dead:0,wType:0,wLv:1,wing:0,shield:false,fireT:0,missT:0,wingT:0,bank:0,vx:0,od:0,odg:0};
const bombs=[1,1,1,1];
let enemies=[],eb=[],pb=[],items=[],parts=[],hazards=[],floats=[],bolts=[],vortex=null,shock=null,zaps=[],marks=[];

function resize(){
  const sw=stageEl.clientWidth,sh=stageEl.clientHeight;if(!sw||!sh)return;
  H=clamp(Math.round(W*sh/sw),480,800);SC=Math.min(sw/W,sh/H);DPR=Math.min(window.devicePixelRatio||1,2.5);
  cv.style.width=(W*SC)+'px';cv.style.height=(H*SC)+'px';
  cv.width=Math.round(W*SC*DPR);cv.height=Math.round(H*SC*DPR);
  P.y=Math.min(P.y,H-24);
}
window.addEventListener('resize',resize);

/* ---- input: relative drag (finger never has to cover the plane) + keyboard ---- */
let drag=null;const keys={};
function clampP(){P.x=clamp(P.x,12,W-12);P.y=clamp(P.y,64,H-24)}
stageEl.addEventListener('pointerdown',e=>{
  if(e.target.closest('button'))return;
  if(G.mode!=='play')return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  try{stageEl.setPointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();
});
stageEl.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id||G.mode!=='play'||!P.alive)return;
  const dx=(e.clientX-drag.x)/SC*1.25,dy=(e.clientY-drag.y)/SC*1.25;
  drag.x=e.clientX;drag.y=e.clientY;P.x+=dx;P.y+=dy;P.vx+=dx;clampP();
});
const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null};
stageEl.addEventListener('pointerup',endDrag);stageEl.addEventListener('pointercancel',endDrag);
stageEl.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
  if(e.repeat){if(e.key.startsWith('Arrow')||e.key===' ')e.preventDefault();return}
  keys[e.key.toLowerCase()]=true;
  if(G.mode==='play'){
    if(e.key>='1'&&e.key<='4')useBomb(+e.key-1);
    else if(e.key===' '){e.preventDefault();const i=bombs.findIndex(n=>n>0);if(i>=0)useBomb(i)}
    else if(e.key==='p'||e.key==='Escape')pauseGame();
    if(e.key.startsWith('Arrow'))e.preventDefault();
  }else if(G.mode==='pause'&&(e.key==='p'||e.key==='Escape'))resumeGame();
});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
function keyMove(dt){
  const sp=(keys.shift?130:270)*dt;let mx=0,my=0;
  if(keys.arrowleft||keys.a)mx--;if(keys.arrowright||keys.d)mx++;
  if(keys.arrowup||keys.w)my--;if(keys.arrowdown||keys.s)my++;
  if(mx||my){P.x+=mx*sp;P.y+=my*sp;P.vx+=mx*sp;clampP()}
}
document.querySelectorAll('.bomb').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();useBomb(+b.dataset.b)}));
