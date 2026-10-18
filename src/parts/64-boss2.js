/* ================= chapter 2 bosses (stages 6–10): breakable parts, shields, voice lines ================= */
const BDEF2=[
  {hp:3600,hw:46,hh:30,ty:118,th:[.5]},             /* 寒霜堡壘 */
  {hp:3000,hw:22,hh:30,ty:112,th:[.55,.25],ground:1},/* 怒濤號: body = bridge */
  {hp:4200,hw:30,hh:30,ty:132,th:[.6,.3]},           /* 遺跡守護神 */
  {hp:0,hw:0,hh:0,ty:140,th:[],body:false},          /* 雙子王牌: two parts, no body */
  {hp:6400,hw:48,hh:40,ty:126,th:[.75,.5,.25]}       /* 虛空之王 */
];
const VOICE=[
  {in:'入侵者，你們將在此冰封。',ph:['暴風雪，降臨吧！'],out:'堡壘……崩塌了……'},
  {in:'全艦，迎擊準備！',ph:['主砲，齊射！','全機出擊，不留活口！'],out:'怒濤號……沉沒了……'},
  {in:'擅闖聖地者，受死。',ph:['石盾，飛散吧。','覺醒吧，守護之眼！'],out:'封印……解除了……'},
  {in:'就是你嗎？讓我們兄弟陪你玩玩。',ph:[],out:'我們……輸了……'},
  {in:'渺小的存在，竟然走到了這裡。',ph:['看看你打倒的那些魔王吧。','這個世界，將歸於虛空！','不可能……我是永恆的！'],out:'虛空……消散了……'}
];
function mkPart(B,o){
  const q=Object.assign({part:true,B,x:B.x+(o.ox||0),y:B.y+(o.oy||0),ox:0,oy:0,r:16,hp:400,flash:0,dead:false,gone:false,chunk:.06,a:Math.PI/2},o);
  q.hp*=DIFF[G.diff].hp;q.mhp=q.hp;return q;
}
function spawnBoss2(){
  const i=G.stage,d=BDEF2[i-5],hp=d.hp*DIFF[G.diff].hp;
  const B={i,x:W/2,y:-90,ty:d.ty,hp,mhp:hp,hw:d.hw,hh:d.hh,t:0,ph:0,pause:0,active:false,dying:0,flash:0,a:0,tm:{},dir:1,gone:false,
    th:d.th,ground:!!d.ground,body:d.body!==false,parts:null,coreMul:null};
  BOSS2[i-5].init(B);G.boss=B;
}
function hurtBoss2(B,d,quiet){
  if(!B.body){const L=B.parts.filter(q=>!q.dead);for(const q of L)hurtPart(q,d/L.length,quiet);return}
  const m=B.coreMul?B.coreMul():1;
  B.hp-=d*m;B.flash=.05;G.hudDirty=true;if(!quiet&&Math.random()<.2)(m<1?AU.shieldHit():AU.hit());
  if(B.hp<=0){B.hp=0;killBoss();return}
  bossPhase2(B);
}
function bossPhase2(B){
  const f=B.hp/B.mhp;let ph=0;for(const t of B.th)if(f<t)ph++;
  if(ph>B.ph)setPhase2(B,ph);
}
function setPhase2(B,ph){
  B.ph=ph;B.pause=1.4;B.tm={};clearBullets(true);hazards.length=0;LQ.length=0;marks.length=0;
  ringFx(B.x,B.y,130,'#ff4a5c',.6,5);boom(B.x,B.y,true);G.shake=.45;AU.charge();
  const v=VOICE[B.i-5].ph[ph-1];if(v)say2(v);
  const S=BOSS2[B.i-5];if(S.phase)S.phase(B,ph);
}
function hurtPart(q,d,quiet){
  const B=q.B;if(q.dead||!B||B!==G.boss||!B.active||B.dying>0)return;
  q.hp-=d;q.flash=.06;if(!quiet&&Math.random()<.15)AU.hit();
  if(!B.body){B.hp=B.parts.reduce((s,p)=>s+Math.max(0,p.hp),0);G.hudDirty=true}
  if(q.hp<=0)partKill(q);
}
function partKill(q){
  const B=q.B;q.dead=q.gone=true;q.hp=0;
  boom(q.x,q.y,true);boom(q.x+rnd(-12,12),q.y+rnd(-12,12),false);addScore(5000);medals(q.x,q.y,6);odAdd(6);
  floatTxt(q.x,q.y-22,q.label||'部位破壞','#ffe45c');
  const S=BOSS2[B.i-5];
  if(!B.body){
    B.hp=B.parts.reduce((s,p)=>s+Math.max(0,p.hp),0);G.hudDirty=true;
    if(B.parts.every(p=>p.dead)){B.x=clamp(q.x,40,W-40);B.y=clamp(q.y,90,H-180);killBoss();return}
    if(S.part)S.part(B,q);return;
  }
  if(S.part)S.part(B,q);
  B.hp-=B.mhp*q.chunk;G.hudDirty=true;   /* breaking a part also cracks the core */
  if(B.hp<=0){B.hp=0;killBoss();return}
  bossPhase2(B);
}
function updBoss2(B,dt){
  const S=BOSS2[B.i-5];B.t+=dt;
  if(B.parts)for(const q of B.parts){q.flash=Math.max(0,q.flash-dt);if(!q.free){q.x=B.x+q.ox;q.y=B.y+q.oy}}
  if(!B.active){S.enter(B,dt);if(B.active){B.t=0;G.hudDirty=true;say2(VOICE[B.i-5].in);if(S.hint)tip(S.hint)}return}
  if(B.pause>0){B.pause-=dt;return}
  BDT=dt;S.upd(B,dt);
  if(P.alive&&!B.ground){
    if(B.body&&Math.abs(P.x-B.x)<B.hw*.8&&Math.abs(P.y-B.y)<B.hh*.8)hitPlayer();
    if(B.parts)for(const q of B.parts)if(!q.dead&&q.touch&&(q.x-P.x)**2+(q.y-P.y)**2<(q.r*.8)**2)hitPlayer();
  }
}
function drawBoss2(B){
  const S=BOSS2[B.i-5];ctx.save();if(B.dying>0)ctx.translate(rnd(-3,3),rnd(-3,3));
  S.draw(B);
  if(B.body&&B.coreMul&&B.coreMul()<1&&!B.dying){ /* core shield while parts still stand */
    const r=Math.max(B.hw,B.hh)+10,pu=.5+.5*Math.sin(G.t*5);ctx.strokeStyle='rgba(159,232,255,'+(.35+.25*pu)+')';ctx.lineWidth=2.5;
    ctx.beginPath();for(let k=0;k<=6;k++){const a=k*TAU/6+G.t*.4;k?ctx.lineTo(B.x+Math.cos(a)*r,B.y+Math.sin(a)*r):ctx.moveTo(B.x+Math.cos(a)*r,B.y+Math.sin(a)*r)}ctx.stroke()}
  if(B.parts&&B.active&&!B.dying)for(const q of B.parts)if(!q.dead){const w=Math.max(28,q.r*2);
    ctx.fillStyle='rgba(6,9,24,.75)';ctx.fillRect(q.x-w/2-1,q.y-q.r-10,w+2,5);ctx.fillStyle='#ffe45c';ctx.fillRect(q.x-w/2,q.y-q.r-9,w*Math.max(0,q.hp/q.mhp),3)}
  if(G.freeze>0){ctx.fillStyle='rgba(143,233,255,.3)';if(B.body)ctx.fillRect(B.x-B.hw-10,B.y-B.hh-10,B.hw*2+20,B.hh*2+20);if(B.parts)for(const q of B.parts)if(!q.dead){ctx.beginPath();ctx.arc(q.x,q.y,q.r+4,0,TAU);ctx.fill()}}
  ctx.restore();
}
function bodySpr(s,x,y,flash,rot){ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);if(flash>0){ctx.globalAlpha=.3;ctx.drawImage(s.f,-s.w/2,-s.h/2,s.w,s.h)}ctx.restore()}
function partFlash(q){if(q.flash>0){ctx.globalAlpha=.55;cap(q.x,q.y,q.r,'#ffffff');ctx.globalAlpha=1}}
function wreck(q){cap(q.x,q.y,q.r*.8,'#1a1410');ctx.fillStyle='rgba(60,60,60,.5)';ctx.beginPath();ctx.arc(q.x+Math.sin(G.t*2)*3,q.y-8-((G.t*20)%14),5,0,TAU);ctx.fill()}
function icicle(x){marks.push({x,t:0,life:.75,kind:'drop'});later(.75,()=>{const B=G.boss;if(B&&!B.dying)shoot(x,-10,Math.PI/2,300,7,7)})}
const SLR=76;   /* slab orbit radius */
function slabBlock(B,x,y){
  const dx=x-B.x,dy=y-B.y,d=Math.hypot(dx,dy);if(Math.abs(d-SLR)>13)return false;const a=Math.atan2(dy,dx);
  for(const s of B.slabs){if(s.st!=='orbit')continue;const da=((a-(B.sa+s.o))%TAU+TAU+Math.PI)%TAU-Math.PI;if(Math.abs(da)<.31)return true}
  return false;
}

/* ---- sprites ---- */
const BSPR2=[
  mk(196,124,g=>{ /* 寒霜堡壘 */
    poly(g,[-58,-40,58,-40,82,0,58,46,-58,46,-82,0],'#557590','#0e1a2c',2);
    poly(g,[-46,-30,46,-30,64,0,46,36,-46,36,-64,0],'#7d9fbd','#0e1a2c',1);
    for(const[x,y,h]of[[-30,-38,30],[0,-44,44],[30,-38,30],[-54,-18,20],[54,-18,20]])poly(g,[x-7,y,x,y-h,x+7,y],'#dff6ff','#5ea8d4',1);
    g.fillStyle='#3d5672';g.fillRect(-84,6,24,22);g.fillRect(60,6,24,22);
    disc(g,0,6,19,'#1b2d48','#0e1a2c',2);disc(g,0,6,12,'#7fd7ff');disc(g,-4,2,4,'#f0fbff');
    g.fillStyle='#bfe6ff';for(let k=-3;k<=3;k++)g.fillRect(k*12-1,34,2,8)}),
  mk(150,330,g=>{ /* 怒濤號 (bow down; bridge at sprite y=-10 = boss position) */
    poly(g,[-62,-160,62,-160,70,40,48,122,0,162,-48,122,-70,40],'#4c5763','#0f151c',2);
    poly(g,[-54,-152,54,-152,61,40,41,116,0,150,-41,116,-61,40],'#3a434e');
    g.fillStyle='#e8e2c8';for(let y=-146;y<128;y+=24)g.fillRect(-2,y,4,12);
    g.fillStyle='#f4b740';g.fillRect(-48,-150,3,190);g.fillRect(45,-150,3,190);
    g.strokeStyle='#9aa6b4';g.lineWidth=2;g.beginPath();g.moveTo(-22,84);g.lineTo(-22,140);g.moveTo(22,84);g.lineTo(22,140);g.stroke();
    poly(g,[-16,-36,16,-36,21,-10,16,16,-16,16,-21,-10],'#76828f','#0f151c',2);
    g.fillStyle='#bfefff';g.fillRect(-12,-24,24,4);disc(g,0,4,6,'#9aa6b4','#0f151c');
    disc(g,0,150,11,'#2b3038','#0f151c',1.5);g.fillStyle='#2b3038';g.fillRect(-4,150,8,16);
    g.fillStyle='#c84a3a';g.fillRect(-60,-158,120,4)}),
  mk(118,118,g=>{ /* 遺跡守護神 (stone head) */
    poly(g,[-40,-46,40,-46,50,-20,50,30,30,52,-30,52,-50,30,-50,-20],'#8a8670','#25231a',2);
    poly(g,[-32,-38,32,-38,40,-16,40,26,24,44,-24,44,-40,26,-40,-16],'#9c9880');
    g.fillStyle='#5f5c48';g.fillRect(-30,-16,60,6);g.fillRect(-4,-10,8,24);g.fillRect(-18,26,36,6);
    g.fillStyle='#2a2818';g.fillRect(-24,-8,16,9);g.fillRect(8,-8,16,9);
    g.fillStyle='#3f7a3a';for(const[x,y,w]of[[-50,-28,10],[40,-30,10],[-44,34,12],[30,44,10],[-10,-50,20]])g.fillRect(x,y,w,4)}),
  mk(60,64,g=>jet(g,{len:52,span:52,sweep:-6,bw:5,body:'#e0414f',wing:'#7c1220',tail:.55,glass:'#ffd6dc',trim:'#ffe45c',pods:1})), /* 赤影 */
  mk(60,64,g=>jet(g,{len:52,span:52,sweep:-6,bw:5,body:'#3f8fe8',wing:'#123c7c',tail:.55,glass:'#d6ecff',trim:'#ffe45c',pods:1})), /* 蒼影 */
  mk(224,176,g=>{ /* 虛空之王 */
    for(let k=0;k<7;k++){const x=(k-3)*16,h=k%2?26:40;poly(g,[x-7,-58,x,-58-h,x+7,-58],'#ffd25c','#5a3a06',1.4)}
    poly(g,[-104,-20,-60,-58,60,-58,104,-20,90,40,40,80,-40,80,-90,40],'#4a2190','#12062a',2.5);
    poly(g,[-80,-18,-48,-48,48,-48,80,-18,68,32,30,64,-30,64,-68,32],'#6a34c0');
    poly(g,[-56,-14,-34,-38,34,-38,56,-14,46,24,20,48,-20,48,-46,24],'#3a1676');
    g.strokeStyle='#e6d4ff';g.lineWidth=2.5;g.beginPath();g.moveTo(-74,-14);g.lineTo(-44,32);g.moveTo(74,-14);g.lineTo(44,32);g.moveTo(-30,60);g.lineTo(0,74);g.lineTo(30,60);g.stroke();
    g.fillStyle='#12062a';g.beginPath();g.ellipse(0,0,36,24,0,0,TAU);g.fill();g.strokeStyle='#ff4a5c';g.lineWidth=2.5;g.stroke();
    g.fillStyle='#ffd25c';g.fillRect(-60,-60,120,6);g.fillStyle='#ff4a5c';for(const x of[-40,0,40])disc(g,x,-57,3.5,'#ff4a5c')})
];
function eyeAt(x,y,rx,ry,col){ctx.fillStyle='#f6eeff';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();const a=aimA(x,y);
  cap(x+Math.cos(a)*rx*.35,y+Math.sin(a)*ry*.35,ry*.75,col);cap(x+Math.cos(a)*rx*.4,y+Math.sin(a)*ry*.4,ry*.32,'#12062a')}

/* ---- the five bosses ---- */
const BOSS2=[
{ /* 6 寒霜堡壘: two ice cannons shield the core; then a blizzard that pushes ice shards sideways */
  hint:'先打掉兩側冰砲，核心護盾才會消失',
  init(B){B.parts=[mkPart(B,{ox:-70,oy:17,r:17,hp:700,label:'左冰砲破壞'}),mkPart(B,{ox:70,oy:17,r:17,hp:700,label:'右冰砲破壞'})];
    B.coreMul=()=>[1,.6,.3][B.parts.filter(q=>!q.dead).length]},
  enter(B,dt){B.y+=60*dt;if(B.y>=B.ty)B.active=true},
  upd(B,dt){
    B.x=W/2+Math.sin(B.t*.5)*60;B.y=B.ty+Math.sin(B.t*1.1)*6;
    const L=B.parts;for(const q of L)if(!q.dead)q.a=turnTo(q.a,aimA(q.x,q.y),3*dt);
    ev(B,'cn',1.5,()=>{B.dir=-B.dir;let q=L[B.dir>0?1:0];if(q.dead)q=L[B.dir>0?0:1];if(!q.dead)fan(q.x+Math.cos(q.a)*20,q.y+Math.sin(q.a)*20,q.a,3,.34,185,5)});
    ev(B,'cr',2.6,()=>shoot(B.x,B.y+28,aimA(B.x,B.y)+rnd(-.3,.3),120,8,9));
    if(L.every(q=>q.dead))ev(B,'rg',2.6,()=>ringB(B.x,B.y,14,120,rnd(TAU),5));
    if(B.ph>=1){
      ev(B,'wd',4.5,()=>{G.wind=(G.wind>0?-1:1)*48});
      ev(B,'ic',1.1,()=>{B.tm.n=(B.tm.n||0)+1;icicle(B.tm.n%3===0?P.x:rnd(20,W-20))});
      ev(B,'sp',.17,()=>{B.a+=.33;shoot(B.x,B.y+10,B.a,110,5)});
    }
  },
  phase(B,ph){if(ph===1)G.wind=48},
  draw(B){
    bodySpr(BSPR2[0],B.x,B.y,B.flash);
    for(const q of B.parts){if(q.dead){wreck(q);continue}cap(q.x,q.y,q.r,'#4b6a8a','#0e1a2c');barrel(q.x,q.y,q.a,24,8,'#2b3e55');cap(q.x,q.y,7,'#7fd7ff');partFlash(q)}
  }
},
{ /* 7 超級航艦・怒濤號: sea boss; four deck turrets, launches fighters, main battery + missiles */
  hint:'甲板上的砲塔可以先拆，艦橋才是要害',
  init(B){B.y=-200;B.parts=[[-34,-96],[34,-96],[-34,38],[34,38]].map(([ox,oy])=>mkPart(B,{ox,oy,r:14,hp:420,label:'砲塔破壞',chunk:.05}));
    B.coreMul=()=>[1,.8,.65,.5,.35][B.parts.filter(q=>!q.dead).length]},
  enter(B,dt){B.y+=55*dt;if(B.y>=B.ty)B.active=true},
  upd(B,dt){
    B.x=W/2+Math.sin(B.t*.22)*24;B.y=B.ty+Math.sin(B.t*.7)*4;
    const L=B.parts.filter(q=>!q.dead);for(const q of L)q.a=turnTo(q.a,aimA(q.x,q.y),2.5*dt);
    const rt=B.ph>=2?.6:1;
    ev(B,'tr',.75*rt,()=>{if(!L.length)return;const q=L[(B.tm.k=(B.tm.k||0)+1)%L.length];shoot(q.x+Math.cos(q.a)*16,q.y+Math.sin(q.a)*16,q.a,165,2,6)});
    ev(B,'fl',3.2,()=>shoot(B.x,B.y+40,aimA(B.x,B.y+40)+rnd(-.2,.2),150,4));
    ev(B,'ln',B.ph?4.4:5.6,()=>{const k=B.ph>=2?'ace':'grunt';for(const s of[-1,1]){const e=spawn(k,B.x+s*22,B.y+150,{y1:B.y+190});e.rot=Math.PI}});
    if(B.ph>=1){
      ev(B,'mb',4.8,()=>{AU.charge();const a=aimA(B.x,B.y+170);for(const d of[-.34,0,.34])beam({ride:true,ox:0,oy:170,a:a+d,w:20,warn:1.05,fire:.55,len:760,col:'#ff9f1a'})});
      ev(B,'ms',3.6,()=>{for(const s of[-1,1])shoot(B.x+s*50,B.y-30,Math.PI/2+s*.7,140,6,5)});
    }
  },
  draw(B){
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(B.x-40,B.y-150);ctx.lineTo(B.x-70,B.y-230);ctx.moveTo(B.x+40,B.y-150);ctx.lineTo(B.x+70,B.y-230);ctx.stroke();
    bodySpr(BSPR2[1],B.x,B.y+10,B.flash);
    for(const q of B.parts){if(q.dead){wreck(q);continue}cap(q.x,q.y,q.r,'#8592a0','#0f151c');barrel(q.x,q.y,q.a,20,6,'#2b3038');cap(q.x,q.y,5,'#c84a3a');partFlash(q)}
  }
},
{ /* 8 遺跡守護神: orbiting stone slabs block shots; later they are thrown, then shatter */
  hint:'石盾會擋子彈，等縫隙轉到面前再打',
  init(B){B.sa=0;B.slabs=[0,1,2,3].map(k=>({o:k*Math.PI/2,st:'orbit',t:0}))},
  enter(B,dt){B.y+=60*dt;B.sa+=dt;if(B.y>=B.ty)B.active=true},
  upd(B,dt){
    B.x=W/2+Math.sin(B.t*.45)*60;B.y=B.ty+Math.sin(B.t*1.3)*6;
    B.sa+=dt*(B.ph?1.3:.9);
    for(const s of B.slabs){if(s.st==='gone'){s.t-=dt;if(s.t<=0){s.st='grow';s.t=.8}}else if(s.st==='grow'){s.t-=dt;if(s.t<=0)s.st='orbit'}}
    const eye=k=>[B.x+(k?14:-14),B.y-4];
    if(B.ph<2){
      ev(B,'ey',1.3,()=>{B.dir=-B.dir;const[x,y]=eye(B.dir>0);fan(x,y,aimA(x,y),3,.25,190,0)});
      ev(B,'lf',3,()=>ringB(B.x,B.y,12,115,rnd(TAU),2,5));
    }
    if(B.ph===1)ev(B,'th',2.4,()=>{const O=B.slabs.filter(s=>s.st==='orbit');if(!O.length)return;
      let best=O[0],bd=1e9;for(const s of O){const a=B.sa+s.o,x=B.x+Math.cos(a)*SLR,y=B.y+Math.sin(a)*SLR,d=(x-P.x)**2+(y-P.y)**2;if(d<bd){bd=d;best=s}}
      const a=B.sa+best.o,x=B.x+Math.cos(a)*SLR,y=B.y+Math.sin(a)*SLR;best.st='gone';best.t=5;shoot(x,y,aimA(x,y),210,9,13)});
    if(B.ph===2){
      ev(B,'bm',2.1,()=>{B.dir=-B.dir;const[x,y]=eye(B.dir>0);AU.charge();beam({ride:true,ox:x-B.x,oy:y-B.y,a:aimA(x,y),w:16,warn:1,fire:.6,len:820,col:'#8dff7a'})});
      ev(B,'vn',4.2,()=>{const gx=rnd(50,W-50);for(let x=8;x<W;x+=18)if(Math.abs(x-gx)>40)shoot(x,B.y+50,Math.PI/2,100,2,5)});
      ev(B,'sp',.16,()=>{B.a+=.37;shoot(B.x,B.y,B.a,130,0)});
    }
  },
  phase(B,ph){if(ph===2){for(const s of B.slabs){const a=B.sa+s.o,x=B.x+Math.cos(a)*SLR,y=B.y+Math.sin(a)*SLR;boom(x,y,false);fx(x,y,10,'#a8987a',160,.6,4);s.st='dead'}}},
  draw(B){
    bodySpr(BSPR2[2],B.x,B.y,B.flash);
    const g=B.ph===2?1:.45+.3*Math.sin(G.t*4);ctx.fillStyle='rgba(141,255,122,'+g+')';ctx.fillRect(B.x-24,B.y-8,16,9);ctx.fillRect(B.x+8,B.y-8,16,9);
    for(const s of B.slabs){if(s.st!=='orbit'&&s.st!=='grow')continue;const a=B.sa+s.o,x=B.x+Math.cos(a)*SLR,y=B.y+Math.sin(a)*SLR;
      ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);if(s.st==='grow')ctx.globalAlpha=1-s.t/.8;
      ctx.fillStyle='#25231a';ctx.fillRect(-25,-11,50,22);ctx.fillStyle='#8f8b70';ctx.fillRect(-23,-9,46,18);ctx.fillStyle='#6f6b54';ctx.fillRect(-23,3,46,6);
      ctx.fillStyle='rgba(141,255,122,.8)';ctx.fillRect(-10,-4,20,2);ctx.fillRect(-1,-8,2,10);ctx.restore()}
  }
},
{ /* 9 雙子王牌・赤影與蒼影: two agile aces; formation, crossfire, dives, mirrored spirals; the survivor enrages */
  hint:'兩架要分別擊墜，俯衝前會出現紅色預告線',
  init(B){B.body=false;B.mode=0;B.mt=0;
    B.parts=[mkPart(B,{free:true,x:-40,y:110,r:20,hp:1300,label:'赤影擊墜',touch:true,side:-1,chunk:0}),
             mkPart(B,{free:true,x:W+40,y:110,r:20,hp:1300,label:'蒼影擊墜',touch:true,side:1,chunk:0})];
    for(const q of B.parts){q.ds=0;q.dt2=0;q.px=q.x;q.bank=0}
    B.mhp=B.parts.reduce((s,q)=>s+q.mhp,0);B.hp=B.mhp},
  enter(B,dt){for(const q of B.parts){q.x+=(W/2+q.side*90-q.x)*Math.min(1,dt*2.2);q.y+=(175-q.y)*Math.min(1,dt*2)}
    B.x=W/2;B.y=175;if(B.t>1.8)B.active=true},
  upd(B,dt){
    const L=B.parts.filter(q=>!q.dead),solo=L.length===1,rt=solo?.75:1;
    const seq=solo?['form','dash','cross','dash','mirror']:['form','cross','dash','mirror'],dur={form:5,cross:4.5,dash:5,mirror:4.5};
    B.mt+=dt;let m=seq[B.mode%seq.length];
    if(B.mt>dur[m]*(solo?.8:1)){B.mode++;B.mt=0;B.tm={};m=seq[B.mode%seq.length];for(const q of L){q.ds=0;q.dt2=0;if(q.y>H*.6)q.y=-60}}
    B.m=m;B.dq=m==='dash'?L[B.mode%L.length]:null;
    const mv=(q,tx,ty,k)=>{q.x+=(tx-q.x)*Math.min(1,dt*(k||3));q.y+=(ty-q.y)*Math.min(1,dt*(k||3))};
    if(m==='form'){
      for(const q of L)mv(q,W/2+(solo?0:q.side*90)+Math.sin(B.t*1.2+q.side)*(solo?110:30),175+Math.sin(B.t*2+q.side)*20);
      ev(B,'fb',.9*rt,()=>{B.tm.w=(B.tm.w||0)+1;const q=L[B.tm.w%L.length],a=aimA(q.x,q.y);
        for(let j=0;j<3;j++)later(j*.08,()=>{if(!q.dead&&G.boss===B&&!B.gone)shoot(q.x,q.y+14,a,220,1)})});
    }else if(m==='cross'){
      for(const q of L){const sd=solo?(B.mode%2?1:-1):q.side;mv(q,sd<0?34:W-34,sd<0?190:250,2.5)}
      ev(B,'st',.11*rt,()=>{for(const q of L){const toR=q.x<W/2;shoot(q.x,q.y,(toR?.32:Math.PI-.32)+Math.sin(B.t*3+q.side)*.32,200,0)}});
    }else if(m==='dash'){
      const dq=B.dq;
      for(const q of L){
        if(q!==dq){mv(q,W/2-dq.side*110,160,2);ev(B,'rg',.55*rt,()=>{B.a+=.4;ringB(q.x,q.y,6,130,B.a,3)});continue}
        q.dt2+=dt;
        if(q.ds===0){if(q.dt2<.75)mv(q,P.x,130,3.2);else mv(q,q.x,130,3);if(q.dt2>1.05){q.ds=1;q.lock=q.x;AU.charge()}}
        else if(q.ds===1){q.x=q.lock;q.y+=640*dt;if(q.y>H+60){q.y=-60;q.ds=2;q.dt2=0}}
        else{mv(q,q.lock,165,3);if(q.dt2>1){q.ds=0;q.dt2=0;if(solo)fan(q.x,q.y+14,aimA(q.x,q.y),5,.6,190,1)}}
      }
    }else{
      for(const q of L)mv(q,W/2+q.side*70,180);
      ev(B,'mr',.13,()=>{B.a+=.23;for(const q of L)shoot(q.x,q.y,q.side<0?B.a:Math.PI-B.a,140,3);if(solo)shoot(L[0].x,L[0].y,L[0].side<0?Math.PI-B.a:B.a,140,3)});
    }
    for(const q of L){q.bank+=(clamp((q.x-q.px)/(dt*240||1),-1,1)-q.bank)*Math.min(1,dt*8);q.px=q.x}
    B.x=L.reduce((s,q)=>s+q.x,0)/L.length;B.y=L.reduce((s,q)=>s+q.y,0)/L.length;
  },
  part(B,q){const red=q.side<0;setPhase2(B,1);B.mode=0;B.mt=0;for(const p of B.parts)if(!p.dead){p.ds=0;p.dt2=0;if(p.y>H*.6||p.y<0)p.y=-60}say2(red?'赤影！我饒不了你！':'蒼影！我要你付出代價！')},
  draw(B){
    for(const q of B.parts){
      if(q.dead)continue;
      if(B.dq===q&&q.ds===0&&q.dt2>.15&&!B.dying){ /* dive warning column */
        ctx.fillStyle='rgba(255,74,92,'+(.12+.12*Math.sin(G.t*30))+')';ctx.fillRect(q.x-q.r,q.y,q.r*2,H);
        ctx.strokeStyle='rgba(255,74,92,.7)';ctx.lineWidth=1.5;ctx.strokeRect(q.x-q.r,q.y,q.r*2,H)}
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.PI);ctx.scale(1-Math.abs(q.bank)*.3,1);
      const s=BSPR2[q.side<0?3:4];ctx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);if(q.flash>0){ctx.globalAlpha=.5;ctx.drawImage(s.f,-s.w/2,-s.h/2,s.w,s.h)}ctx.restore();
      if(q.ds===1){ctx.fillStyle='rgba(255,180,120,.5)';ctx.fillRect(q.x-4,q.y-60,8,50)}
    }
  }
},
{ /* 10 虛空之王: hands shield the core → echoes of past bosses → rotating cross → last stand */
  hint:'先打掉兩隻魔手，核心才會完全暴露',
  init(B){B.parts=[mkPart(B,{ox:-92,oy:40,r:22,hp:1000,label:'左魔手破壞',side:-1,chunk:.05}),mkPart(B,{ox:92,oy:40,r:22,hp:1000,label:'右魔手破壞',side:1,chunk:.05})];
    B.coreMul=()=>[1,.7,.45][B.parts.filter(q=>!q.dead).length];B.echo=0},
  enter(B,dt){B.y+=48*dt;if(B.y>=B.ty)B.active=true},
  upd(B,dt){
    B.x=W/2+Math.sin(B.t*.4)*(B.ph===2?20:50);B.y=B.ty+Math.sin(B.t*1.1)*8;
    const L=B.parts.filter(q=>!q.dead);for(const q of B.parts)q.oy=40+Math.sin(B.t*1.5+q.side)*8;
    ev(B,'pm',B.ph?2.4:1.5,()=>{if(!L.length)return;B.tm.h=(B.tm.h||0)+1;const q=L[B.tm.h%L.length];fan(q.x,q.y+16,aimA(q.x,q.y),7,.9,170,3)});
    if(B.ph===0)ev(B,'fl',2.6,()=>{B.a+=.2;const a=B.a;ringB(B.x,B.y,16,115,a,0);later(.3,()=>{if(G.boss===B&&!B.gone)ringB(B.x,B.y,16,140,a+TAU/32,3)})});
    if(B.ph===1){
      ev(B,'sp',.22,()=>{B.a+=.31;shoot(B.x,B.y,B.a,120,3)});
      ev(B,'echo',5,()=>{const k=B.echo++%5;floatTxt(B.x,B.y+64,['回聲・雷雲母艦','回聲・熔核機甲','回聲・寒霜堡壘','回聲・怒濤號','回聲・沙暴毒蠍'][k],'#e6d4ff');
        if(k===0){AU.charge();for(let j=0;j<4;j++)beam({x:j===0?P.x:rnd(20,W-20),y:0,w:24,warn:.95,fire:.6,col:'#b98cff'})}
        else if(k===1)sweepBeam(B,'#b98cff');
        else if(k===2){for(let j=0;j<8;j++)later(j*.28,()=>{if(G.boss===B&&!B.gone)icicle(j%3===0?P.x:rnd(20,W-20))})}
        else if(k===3){for(const s of[-1,1])for(let j=0;j<3;j++)later(j*.2,()=>{if(G.boss===B&&!B.gone)shoot(B.x+s*70,B.y,Math.PI/2+s*(.6+j*.2),140,6,5)})}
        else{for(let j=0;j<11;j++){const b=shoot(B.x,B.y-40,-Math.PI/2+(j-5)*.18,150,2,5);if(b)b.g=200}}});
    }
    if(B.ph===2){
      ev(B,'cx',8,()=>{B.dir=-B.dir;AU.charge();const a0=rnd(TAU);for(let k=0;k<4;k++)beam({ride:true,ox:0,oy:0,a:a0+k*Math.PI/2,rotv:.3*DIFF[G.diff].spd*B.dir,w:16,warn:1.3,fire:4.6,len:900,col:'#e6d4ff'})});
      ev(B,'ab',1.5,()=>fan(B.x,B.y+30,aimA(B.x,B.y),5,.5,200,1));
    }
    if(B.ph===3){
      ev(B,'sp',.09,()=>{B.a+=.29;shoot(B.x,B.y,B.a,150,0);shoot(B.x,B.y,B.a+Math.PI,150,3)});
      ev(B,'wl',4.8,()=>{const gx=rnd(50,W-50);for(let x=8;x<W;x+=17)if(Math.abs(x-gx)>38)shoot(x,B.y+56,Math.PI/2,105,2,5)});
      ev(B,'ab',1.8,()=>fan(B.x,B.y+30,aimA(B.x,B.y),5,.6,215,1));
    }
  },
  draw(B){
    {const red=B.ph===3&&!B.dying,g=ctx.createRadialGradient(B.x,B.y,20,B.x,B.y,150);g.addColorStop(0,red?'rgba(255,74,92,.45)':'rgba(185,140,255,.38)');g.addColorStop(1,'rgba(120,60,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(B.x,B.y,150,0,TAU);ctx.fill()}
    bodySpr(BSPR2[5],B.x,B.y,B.flash);
    eyeAt(B.x,B.y,26,16,B.ph===3?'#ff4a5c':'#b98cff');
    for(const q of B.parts){
      if(q.dead){wreck(q);continue}
      const ga=aimA(q.x,q.y);
      for(let k=0;k<4;k++){const a=ga+(k-1.5)*.42,x1=q.x+Math.cos(a)*32,y1=q.y+Math.sin(a)*32;
        ctx.strokeStyle='#12062a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(x1,y1);ctx.stroke();
        ctx.strokeStyle='#7a46d8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(x1,y1);ctx.stroke();cap(x1,y1,3.5,'#ff4a5c')}
      cap(q.x,q.y,q.r,'#5a2aa8','#e6d4ff');cap(q.x,q.y,q.r*.55,'#3a1676');cap(q.x,q.y,6,'#ff4a5c');partFlash(q);
    }
  }
}
];
