/* ================= chapter 2 enemies ================= */
Object.assign(ED,{
  turret:{hp:16,r:13,sc:600,ground:1},          tank:{hp:20,r:13,sc:700,ground:1},
  shard:{hp:6,r:11,sc:250},                     shardlet:{hp:1.5,r:6,sc:60},
  destroyer:{hp:55,r:16,sc:2500,ground:1,hw:13,hh:44,big:1},
  sub:{hp:24,r:13,sc:1200,ground:1},
  shieldjet:{hp:9,r:12,sc:600,sh:14},           statue:{hp:34,r:16,sc:1500,ground:1,big:1},
  swarm:{hp:1.2,r:7,sc:80},                     sniper:{hp:12,r:11,sc:800},
  raider:{hp:6,r:10,sc:300},                    copter:{hp:30,r:16,sc:1500,big:1},
  voideye:{hp:14,r:13,sc:900}
});
const R2=()=>DIFF[G.diff].rate;
function turnTo(a,b,m){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+clamp(d,-m,m)}
function flashSpr(s,e,rot,alpha){if(alpha!==undefined)ctx.globalAlpha=alpha;spr(s,e.x,e.y,rot,1,e.flash>0);ctx.globalAlpha=1}

/* 地面砲台: rides the ground layer, two-round aimed bursts */
EX.turret={
  init(e){e.ga=Math.PI/2;tip('地面目標不會撞到你，可以直接飛過去',1)},
  upd(e,dt,cf){e.y+=GS()*dt;e.ga=turnTo(e.ga,aimA(e.x,e.y),2.6*dt);
    if(cf&&e.fireT<=0){e.fireT=2.5*R2();for(let j=0;j<2;j++)later(j*.16,()=>{if(!e.gone)shoot(e.x+Math.cos(e.ga)*15,e.y+Math.sin(e.ga)*15,e.ga,165,0)})}},
  draw(e){flashSpr(SPR2.turret,e,0);barrel(e.x,e.y,e.ga,17,5,'#232b44');cap(e.x,e.y,6.5,'#8fa0c4','#141a2c')}
};
/* 雪地坦克: crawls and lobs heavy shells */
EX.tank={
  init(e){e.ga=Math.PI/2;e.p.dx=e.p.dx||0},
  upd(e,dt,cf){e.y+=GS()*dt*.75+16*dt;e.x+=e.p.dx*dt;if(e.x<22||e.x>W-22){e.p.dx=-e.p.dx;e.x=clamp(e.x,22,W-22)}
    e.ga=turnTo(e.ga,aimA(e.x,e.y),2*dt);
    if(cf&&e.fireT<=0){e.fireT=2.8*R2();shoot(e.x+Math.cos(e.ga)*16,e.y+Math.sin(e.ga)*16,e.ga,135,2,6)}},
  draw(e){flashSpr(SPR2.tank,e,e.p.dx?Math.sign(e.p.dx)*.2:0);barrel(e.x,e.y,e.ga,16,4,'#5d6a76');cap(e.x,e.y,7,'#b9c3cc','#1a1f26')}
};
/* 冰晶無人機: splits into three dashing shardlets when destroyed */
EX.shard={
  upd(e,dt,cf){e.y+=120*dt;e.x=e.p.x0+Math.sin(e.t*3+e.p.ph)*34;e.rot+=dt*3;
    if(cf&&e.fireT<=0){e.fireT=2.2*R2();shoot(e.x,e.y+8,aimA(e.x,e.y),160,5)}},
  draw(e){flashSpr(SPR2.shard,e,e.rot)},
  onKill(e){for(let j=0;j<3;j++){const a=-Math.PI/2+j*TAU/3+e.rot;spawn('shardlet',e.x,e.y,{vx:Math.cos(a)*150,vy:Math.sin(a)*150})}}
};
EX.shardlet={
  upd(e,dt){
    if(e.st===0){e.x+=e.p.vx*dt;e.y+=e.p.vy*dt;e.p.vx*=.94;e.p.vy*=.94;e.rot+=dt*8;
      if(e.t>.45){e.st=1;const a=aimA(e.x,e.y);e.p.vx=Math.cos(a)*230*DIFF[G.diff].spd;e.p.vy=Math.sin(a)*230*DIFF[G.diff].spd;e.rot=a+Math.PI/2}}
    else{e.x+=e.p.vx*dt;e.y+=e.p.vy*dt}},
  draw(e){flashSpr(SPR2.shardlet,e,e.rot)}
};
/* 驅逐艦: sails up against the scroll (so it drifts down slowly), two turrets + flak */
EX.destroyer={
  init(e){e.g=[Math.PI/2,Math.PI/2];e.rot=0},
  upd(e,dt,cf){e.y+=GS()*dt*.7;
    for(let j=0;j<2;j++){const oy=j?22:-24;e.g[j]=turnTo(e.g[j],aimA(e.x,e.y+oy),2.4*dt)}
    if(cf&&e.fireT<=0){e.fireT=1.2*R2();e.st++;const j=e.st%2,oy=j?22:-24;shoot(e.x+Math.cos(e.g[j])*12,e.y+oy+Math.sin(e.g[j])*12,e.g[j],170,0)}
    e.p.fl=(e.p.fl===undefined?3:e.p.fl)-dt;
    if(cf&&e.p.fl<=0){e.p.fl=4.6*R2();shoot(e.x,e.y-40,aimA(e.x,e.y),150,4)}},
  draw(e){
    ctx.fillStyle='rgba(235,250,255,.16)';ctx.beginPath();ctx.moveTo(e.x-9,e.y+44);ctx.lineTo(e.x-26,e.y+104);ctx.lineTo(e.x+26,e.y+104);ctx.lineTo(e.x+9,e.y+44);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(235,250,255,.3)';for(let j=0;j<5;j++){const k=((G.t*1.6+j/5)%1);ctx.fillRect(e.x-9-k*16,e.y+46+k*56,3,3);ctx.fillRect(e.x+6+k*16,e.y+46+k*56,3,3)}
    flashSpr(SPR2.destroyer,e,0);
    for(let j=0;j<2;j++){const oy=j?22:-24;barrel(e.x,e.y+oy,e.g[j],13,3.5,'#2b3038');cap(e.x,e.y+oy,5.5,'#9aa6b4','#12171e')}}
};
/* 潛艦: submerged (cannot be hit) → surfaces → missile salvo → dives */
EX.sub={
  init(e){e.under=true;e.rot=0;e.s2=0;e.p.y1=e.p.y1||rnd(80,200);tip('潛艦潛水時打不到，浮上來再打',1)},
  upd(e,dt,cf){e.y+=GS()*dt*.8;e.s2+=dt;
    if(e.st===0){e.under=true;if(e.y>e.p.y1){e.st=1;e.s2=0}}
    else if(e.st===1){e.under=e.s2<.45;if(e.s2>.8){e.st=2;e.s2=0}}
    else if(e.st===2){if(e.s2>.35&&!e.p.shot){e.p.shot=1;if(cf)for(const s of[-1,0,1])shoot(e.x+s*5,e.y-10,-Math.PI/2+s*.55,130,6,5)}
      if(e.s2>2.8){e.st=3;e.s2=0}}
    else if(e.st===3){e.under=e.s2>.4;if(e.s2>.8){e.st=4}}
    else e.under=true;},
  draw(e){
    const k=e.st===1?Math.min(1,e.s2/.8):e.st===2?1:e.st===3?Math.max(0,1-e.s2/.8):0;
    ctx.fillStyle='rgba(235,250,255,'+(.08+.1*k)+')';ctx.beginPath();ctx.moveTo(e.x-5,e.y+24);ctx.lineTo(e.x-14,e.y+62);ctx.lineTo(e.x+14,e.y+62);ctx.lineTo(e.x+5,e.y+24);ctx.closePath();ctx.fill();
    if(k<1){ctx.globalAlpha=.32*(1-k);ctx.fillStyle='#06141c';ctx.beginPath();ctx.ellipse(e.x,e.y,9,28,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(e.x-1,e.y-8+Math.sin(G.t*9)*1.5,2,5)}
    if(k>0)flashSpr(SPR2.sub,e,0,k)}
};
/* 護盾機: frontal energy shield soaks shots; lasers and lightning go straight through */
EX.shieldjet={
  init(){tip('護盾機：雷射和連鎖閃電會直接穿透護盾',1)},
  upd(e,dt,cf){const p=e.p;
    if(e.st===0){e.y+=150*dt;if(e.y>=(p.y1||120)){e.st=1;e.t=0}}
    else if(e.st===1){e.x=p.x0+Math.sin(e.t*1.3)*30;if(cf&&e.fireT<=0){e.fireT=1.8*R2();fan(e.x,e.y+10,aimA(e.x,e.y),3,.4,175,0)}if(e.t>6.5)e.st=2}
    else e.y+=160*dt;
    e.shf=Math.max(0,(e.shf||0)-dt)},
  draw(e){flashSpr(SPR2.shieldjet,e,Math.PI);
    if(e.sh>0){const f=e.sh/e.shm;ctx.strokeStyle=e.shf>0?'#ffffff':'rgba(127,243,255,'+(.35+.55*f)+')';ctx.lineWidth=2.5+2*f;
      ctx.beginPath();ctx.arc(e.x,e.y+2,20,.12*Math.PI,.88*Math.PI);ctx.stroke()}}
};
/* 石像砲台: eyes glow, then a telegraphed beam straight down (dies with the statue) */
EX.statue={
  init(e){e.rot=0;e.glow=0;tip('石像的眼睛發光後會射出光束',1)},
  upd(e,dt,cf){e.y+=GS()*dt;e.glow=Math.max(0,e.glow-dt);
    if(cf&&e.fireT<=0&&e.y<H*.55){e.fireT=3.6*R2();e.glow=1.35;beam({src:e,ox:0,oy:16,a:Math.PI/2,w:14,warn:.9,fire:.45,len:900,col:'#8dff7a'})}},
  draw(e){flashSpr(SPR2.statue,e,0);const g=.35+.65*Math.min(1,e.glow);
    ctx.fillStyle='rgba(141,255,122,'+g+')';ctx.fillRect(e.x-9,e.y-5,6,4);ctx.fillRect(e.x+3,e.y-5,6,4)}
};
/* 蜂群: weak, fast, comes in snakes */
EX.swarm={
  upd(e,dt,cf){const p=e.p;e.y+=(p.sp||175)*dt;e.x=p.x0+Math.sin(e.t*3.2+p.ph)*(p.amp||60);e.rot=Math.PI+Math.cos(e.t*3.2+p.ph)*.5;
    if(cf&&e.fireT<=0){e.fireT=rnd(3,6)*R2();if(Math.random()<.3)shoot(e.x,e.y+6,aimA(e.x,e.y),150,0)}},
  draw(e){flashSpr(SPR2.swarm,e,e.rot)}
};
/* 狙擊機: red sight line tracks you, locks, then one very fast shot */
EX.sniper={
  init(e){e.la=Math.PI/2;e.s1=0;e.n=0;tip('紅線是狙擊預告，線變亮就快閃開',1)},
  upd(e,dt,cf){const p=e.p;
    if(e.st===0){e.y+=170*dt;if(e.y>=(p.y1||rnd(60,110))){e.st=1;e.s1=0}}
    else if(e.st===1){e.s1+=dt;if(e.s1<.8&&P.alive)e.la=aimA(e.x,e.y);
      if(e.s1>=1.2){if(cf){shoot(e.x+Math.cos(e.la)*14,e.y+Math.sin(e.la)*14,e.la,320,1,4);AU.snipe()}e.n++;e.s1=-.8;if(e.n>=2)e.st=2}}
    else e.y+=200*dt;},
  draw(e){
    if(e.st===1&&e.s1>0){const lock=e.s1>.8;ctx.strokeStyle=lock?(Math.sin(G.t*40)>0?'rgba(255,74,92,.95)':'rgba(255,200,200,.9)'):'rgba(255,74,92,.3)';ctx.lineWidth=lock?2:1;
      ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.la)*900,e.y+Math.sin(e.la)*900);ctx.stroke()}
    flashSpr(SPR2.sniper,e,e.st===1?e.la+Math.PI/2:Math.PI)}
};
/* 後方突襲機: climbs in from below (warned by chevrons), fires one aimed burst over its shoulder, then exits at the top */
EX.raider={
  init(e){e.rot=0;e.p.y1=e.p.y1||rnd(H*.22,H*.38);e.p.dx=e.p.dx||rnd(-40,40)},
  upd(e,dt,cf){const p=e.p;
    if(e.st===0){e.y-=(p.sp||300)*dt*(.35+.65*Math.min(1,(e.y-p.y1)/150));if(e.y<=p.y1+4){e.st=1;e.t=0}}
    else if(e.st===1){e.y-=40*dt;if(e.t>.3&&!p.shot){p.shot=1;if(cf)shoot(e.x,e.y+8,aimA(e.x,e.y),170,1)}if(e.t>.5)e.st=2}
    else{e.y-=(120+e.t*180)*dt;e.x+=p.dx*dt}},
  draw(e){flashSpr(SPR2.raider,e,e.rot)}
};
/* 武裝直升機: strafes, aimed fans + a missile pair */
EX.copter={
  upd(e,dt,cf){const p=e.p;
    if(e.st===0){e.y+=120*dt;if(e.y>=(p.y1||120)){e.st=1;e.t=0}}
    else if(e.st===1){e.x=p.x0+Math.sin(e.t*.8)*70;
      if(cf&&e.fireT<=0){e.fireT=1.8*R2();fan(e.x,e.y+16,aimA(e.x,e.y),3,.4,160,0)}
      p.ms=(p.ms===undefined?2.5:p.ms)-dt;if(cf&&p.ms<=0){p.ms=4.2*R2();for(const s of[-1,1])shoot(e.x+s*14,e.y,Math.PI/2+s*.9,120,6,5)}
      if(e.t>9)e.st=2}
    else e.y+=100*dt;},
  draw(e){flashSpr(SPR2.copter,e,Math.PI);const a=G.t*26;ctx.strokeStyle='rgba(30,36,24,.55)';ctx.lineWidth=3;
    for(let j=0;j<2;j++){const b=a+j*Math.PI/2;ctx.beginPath();ctx.moveTo(e.x-Math.cos(b)*22,e.y+6-Math.sin(b)*22);ctx.lineTo(e.x+Math.cos(b)*22,e.y+6+Math.sin(b)*22);ctx.stroke()}}
};
/* 虛空之眼: fades in, fires a ring, blinks away and reappears three times */
EX.voideye={
  init(e){e.under=true;e.al=0;e.n=0;e.rot=0},
  upd(e,dt,cf){
    if(e.st===0){e.al=Math.min(1,e.t/.6);if(e.t>.6){e.st=1;e.t=0;e.under=false}}
    else if(e.st===1){if(e.t>.9&&!e.p.shot){e.p.shot=1;if(cf)ringB(e.x,e.y,10,120,rnd(TAU),3)}if(e.t>1.7){e.st=2;e.t=0;e.under=true}}
    else{e.al=Math.max(0,1-e.t/.35);if(e.t>.35){e.n++;if(e.n>=3){e.y=-400;return}e.x=rnd(40,W-40);e.y=rnd(80,H*.45);e.p.shot=0;e.st=0;e.t=0}}},
  draw(e){ctx.globalAlpha=e.al;spr(SPR2.voideye,e.x,e.y,0,1,e.flash>0);const a=aimA(e.x,e.y);
    cap(e.x+Math.cos(a)*4,e.y+Math.sin(a)*4,5,'#b98cff');cap(e.x+Math.cos(a)*5,e.y+Math.sin(a)*5,2.4,'#12062a');ctx.globalAlpha=1}
};

/* ---- chapter 2 formations ---- */
Object.assign(F,{
  gnd(k,x,p){return spawn(k,x,-30,p?{...p}:null)},
  gline(k,n){for(let i=0;i<n;i++)spawn(k,(i+.5)*W/n,-30-(i%2)*30,{dx:(i%2?1:-1)*24})},
  ship(x){return spawn('destroyer',x,-60)},
  subs(n){for(let i=0;i<n;i++)later(i*.5,()=>spawn('sub',rnd(40,W-40),-40))},
  swarm(n,x0,amp){for(let i=0;i<n;i++)later(i*.13,()=>spawn('swarm',x0,-16,{x0,amp,ph:0}))},
  rear(k,n,gap){tip('下方紅色箭頭：敵機會從後方衝上來',1);
    for(let i=0;i<n;i++)later(i*(gap||.4),()=>{const x=rnd(30,W-30);marks.push({x,t:0,life:.95,kind:'rear'});later(.95,()=>spawn(k,x,H+24))})},
  eyes(n,gap){for(let i=0;i<n;i++)later(i*(gap||.6),()=>spawn('voideye',rnd(40,W-40),rnd(80,H*.42)))}
});
