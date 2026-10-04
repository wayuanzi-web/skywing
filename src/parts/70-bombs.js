/* ================= four bombs, four different jobs ================= */
function useBomb(i){
  if(G.mode!=='play'||!P.alive||bombs[i]<=0)return;
  if(G.phase==='bossdead'||G.phase==='intro')return;
  bombs[i]--;G.hudDirty=true;AU.bomb(i);
  const btn=document.querySelector('.bomb[data-b="'+i+'"]');btn.classList.remove('fx');void btn.offsetWidth;btn.classList.add('fx');
  floatTxt(P.x,P.y-40,BOMBS[i].name,BOMBS[i].col);
  const B=G.boss;
  if(i===0){ /* 核爆彈: instant screen wipe, heavy damage to everything */
    P.inv=Math.max(P.inv,2.6);G.flash=.5;G.flashCol='#fff3d6';G.shake=.8;shock={x:P.x,y:P.y,t:0};
    clearBullets(true);hazards.length=0;
    for(const e of enemies.slice())hurt(e,45,true);
    if(B&&B.active)hurtBoss(B.mhp*.07+70,true);
  }else if(i===1){ /* 雷電彈: 2.6 s of lightning strikes — best single-target damage */
    P.inv=Math.max(P.inv,3);G.thunder=2.6;G.thT=0;
  }else if(i===2){ /* 冰凍彈: bullets shatter into medals, enemies frozen and take 1.5x damage */
    P.inv=Math.max(P.inv,1.2);clearBullets(true);hazards.length=0;G.freeze=B?2.8:4.2;G.flash=.3;G.flashCol='#8fe9ff';
    for(let j=0;j<40;j++)parts.push({x:rnd(W),y:rnd(H),vx:rnd(-20,20),vy:rnd(20,70),l:rnd(.8,1.8),m:1.8,s:rnd(1.5,3),c:'#dff8ff',k:0});
  }else{ /* 黑洞彈: swallows bullets and drags small craft in for 4 s */
    P.inv=Math.max(P.inv,1.2);vortex={x:P.x,y:Math.max(110,P.y-190),t:0,life:4.2};
  }
}
function strike(tx,ty){
  const pts=[],x0=tx+rnd(-60,60);for(let j=0;j<=8;j++){const k=j/8;pts.push(x0+(tx-x0)*k+(j&&j<8?rnd(-14,14):0),ty*k)}
  bolts.push({pts,l:.16});ringFx(tx,ty,34,'#ffe45c',.25,3);fx(tx,ty,6,'#fff6b0',160,.3,3);AU.zap();
  for(let j=eb.length-1;j>=0;j--){const b=eb[j];if((b.x-tx)**2+(b.y-ty)**2<64*64){eb.splice(j,1);if(items.length<90)items.push({x:b.x,y:b.y,vx:0,vy:-40,k:'M',t:0,sub:0})}}
}
function updBombs(dt){
  const B=G.boss;
  if(G.thunder>0){
    G.thunder-=dt;G.thT-=dt;
    if(G.thT<=0){
      G.thT=.11;const live=enemies.filter(e=>e.y>0);
      const useBoss=B&&B.active&&B.dying<=0&&(live.length===0||Math.random()<.6);
      if(useBoss){strike(B.x+rnd(-B.hw*.6,B.hw*.6),B.y);hurtBoss(11,true)}
      else if(live.length){const e=pick(live);strike(e.x,e.y);hurt(e,14,true)}
      else if(eb.length){const b=pick(eb);strike(b.x,b.y)}
      else strike(rnd(30,W-30),rnd(80,H*.5));
      G.flash=Math.max(G.flash,.05);G.flashCol='#fff6b0';
    }
  }
  if(shock){shock.t+=dt;if(shock.t>.75)shock=null}
  for(let i=bolts.length-1;i>=0;i--){bolts[i].l-=dt;if(bolts[i].l<=0)bolts.splice(i,1)}
  if(vortex){
    const v=vortex;v.t+=dt;
    for(let i=eb.length-1;i>=0;i--){
      const b=eb[i],dx=v.x-b.x,dy=v.y-b.y,d=Math.hypot(dx,dy)||1;
      if(d<180){b.vx=b.vx*.92+dx/d*60;b.vy=b.vy*.92+dy/d*60;if(d<18){eb.splice(i,1);addScore(50)}}
    }
    for(const e of enemies.slice()){
      const dx=v.x-e.x,dy=v.y-e.y,d=Math.hypot(dx,dy)||1;
      if(d<150){if(ED[e.k].hp<=12){e.x+=dx/d*110*dt;e.y+=dy/d*110*dt;e.p.x0+=dx/d*110*dt}hurt(e,36*dt,true)}
    }
    if(B&&B.active&&Math.hypot(v.x-B.x,v.y-B.y)<160)hurtBoss(36*dt,true);
    if(parts.length<420){const a=rnd(TAU);parts.push({x:v.x+Math.cos(a)*120,y:v.y+Math.sin(a)*120,vx:-Math.cos(a)*240,vy:-Math.sin(a)*240,l:.45,m:.45,s:2.5,c:'#d9c2ff',k:0})}
    if(v.t>v.life){ringFx(v.x,v.y,100,'#b98cff',.5,5);boom(v.x,v.y,true);vortex=null}
  }
}
function drawBombs(){
  if(vortex){
    const v=vortex,k=Math.min(1,v.t*3)*Math.min(1,(v.life-v.t)*3),R=46*k;
    const g=ctx.createRadialGradient(v.x,v.y,R*.3,v.x,v.y,R*2.6);g.addColorStop(0,'rgba(20,6,50,.95)');g.addColorStop(.4,'rgba(120,70,220,.4)');g.addColorStop(1,'rgba(120,70,220,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(v.x,v.y,R*2.6,0,TAU);ctx.fill();
    ctx.fillStyle='#05020f';ctx.beginPath();ctx.arc(v.x,v.y,R*.55,0,TAU);ctx.fill();
    ctx.strokeStyle='#d9c2ff';ctx.lineWidth=2.5;
    for(let j=0;j<3;j++){const a=G.t*(5-j)+j*2;ctx.beginPath();ctx.arc(v.x,v.y,R*(.75+j*.4),a,a+2.2);ctx.stroke()}
  }
  if(shock){const k=shock.t/.75;ctx.globalAlpha=1-k;ctx.strokeStyle='#ffb060';ctx.lineWidth=26*(1-k)+4;ctx.beginPath();ctx.arc(shock.x,shock.y,k*900,0,TAU);ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(shock.x,shock.y,k*900,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  for(const b of bolts){
    ctx.globalAlpha=Math.min(1,b.l*10);
    for(const st of[['#ffe45c',6],['#ffffff',2.2]]){ctx.strokeStyle=st[0];ctx.lineWidth=st[1];ctx.beginPath();ctx.moveTo(b.pts[0],b.pts[1]);for(let j=2;j<b.pts.length;j+=2)ctx.lineTo(b.pts[j],b.pts[j+1]);ctx.stroke()}
  }
  ctx.globalAlpha=1;
}
