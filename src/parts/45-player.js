/* ================= player, weapons, player bullets ================= */
const wingPos=[{x:W/2-26,y:540},{x:W/2+26,y:540}];
function pShot(x,y,a,sp,d,k,r){if(P.od>0)d*=1.3;pb.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,d,k,r:r||3,a,t:0,h:k===1?[]:null,tg:null})}
function fire(){
  const lv=P.wLv,x=P.x,y=P.y-14,up=-Math.PI/2;
  if(P.wType===0){ /* 火神砲: widening fan */
    if(lv===1){pShot(x-5,y,up,640,1.1,0);pShot(x+5,y,up,640,1.1,0)}
    else{const n=[0,3,5,7,9][lv-1],sp=[0,.16,.3,.44,.56][lv-1];
      for(let i=0;i<n;i++){const a=up+(i/(n-1)-.5)*sp;pShot(x+(i-(n-1)/2)*3,y,a,640,1.1,0)}}
    P.fireT=.1;
  }else if(P.wType===1){ /* 貫穿雷射: piercing bolts straight ahead */
    const d=[2.6,3.8,2.7,2.7,3.3][lv-1],r=[3,4.5,3.5,3.5,5][lv-1];
    if(lv<=2)pShot(x,y-6,up,1050,d,1,r);
    else if(lv===3){pShot(x-7,y-4,up,1050,d,1,r);pShot(x+7,y-4,up,1050,d,1,r)}
    else{pShot(x,y-8,up,1050,d,1,r);pShot(x-11,y,up,1050,d,1,r);pShot(x+11,y,up,1050,d,1,r)}
    P.fireT=.09;
  }else if(P.wType===3){ /* 連鎖閃電: auto-aimed bolt that jumps between targets */
    chainFire(lv);P.fireT=.15;
  }else{ /* 追蹤飛彈: light front guns + seeking missiles */
    pShot(x-4,y,up,640,1,0);pShot(x+4,y,up,640,1,0);P.fireT=.12;
    P.missT-=.12;
    if(P.missT<=0){P.missT=.42;const n=[1,2,2,3,4][lv-1],d=[3,3,4,4,5][lv-1];
      for(let i=0;i<n;i++){const s=n===1?0:(i/(n-1)-.5)*2;pShot(x+s*12,P.y,up+s*.7,300,d,2,4)}}
  }
  if(P.od>0)P.fireT*=.65;
  if(P.wType!==3)AU.shot();
}
/* ---- 連鎖閃電 ---- */
const CHN={rng:[260,290,320,350,380],jumps:[1,2,3,4,5],d:[3,3.8,4.6,5.4,6.4],jr:125};
function zapTargets(){
  const L=[];
  for(const e of enemies)if(!e.gone&&!e.under&&e.y>-10&&e.y<H+10)L.push(e);
  const B=G.boss;
  if(B&&B.active&&!B.dying){if(B.parts)for(const q of B.parts)if(!q.dead)L.push(q);if(B.body!==false)L.push(B)}
  return L;
}
function jag(x0,y0,x1,y1,out){const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/22));
  for(let j=1;j<=n;j++){const k=j/n,o=j<n?rnd(-9,9):0;out.push(x0+(x1-x0)*k+o,y0+(y1-y0)*k+o*.5)}}
function zapHit(t,d){
  const fm=G.freeze>0?1.5:1;if(P.od>0)d*=1.3;
  if(t===G.boss)hurtBoss(d*fm,true);else if(t.part)hurtPart(t,d*fm,true);else hurt(t,d*fm,true);
  fx(t.x,t.y,2,'#eadcff',90,.2,2);
}
function chainFire(lv){
  const T=zapTargets(),x0=P.x,y0=P.y-16,rng=CHN.rng[lv-1];
  let best=null,bs=1e9;
  /* enemies must be in range; a boss or boss part anywhere above you can be reached */
  for(const t of T){const dx=t.x-x0,dy=t.y-y0;if(dy>10)continue;const d=Math.hypot(dx,dy),bossT=t===G.boss||t.part;if(d>rng&&!bossT)continue;const s=(bossT?Math.min(d,rng):d)+Math.abs(dx)*1.2;if(s<bs){bs=s;best=t}}
  const pts=[x0,y0];
  if(!best){jag(x0,y0,x0+rnd(-12,12),y0-70,pts);zaps.push({pts,l:.07,w:.6});return}
  const B=G.boss;
  if(B&&B.slabs&&B.active&&!B.dying){ /* the guardian's stone slabs stop the bolt on its way in */
    const L=Math.hypot(best.x-x0,best.y-y0),n=Math.ceil(L/6);
    for(let j=1;j<n;j++){const x=x0+(best.x-x0)*j/n,y=y0+(best.y-y0)*j/n;
      if(slabBlock(B,x,y)){jag(x0,y0,x,y,pts);zaps.push({pts,l:.09,w:1});fx(x,y,3,'#e0d2a8',90,.25,2);AU.chain();return}}
  }
  const hit=[best];let cur=best,d=CHN.d[lv-1],jumps=CHN.jumps[lv-1];
  jag(x0,y0,best.x,best.y,pts);
  for(let j=0;j<jumps;j++){
    let nx=null,nd=1e9;
    for(const t of T){if(hit.includes(t))continue;const dd=Math.hypot(t.x-cur.x,t.y-cur.y);if(dd<CHN.jr&&dd<nd){nd=dd;nx=t}}
    if(!nx)break;hit.push(nx);jag(cur.x,cur.y,nx.x,nx.y,pts);cur=nx;
  }
  /* a lone target takes the unused jumps as extra damage */
  zapHit(best,hit.length===1?d*(1+.15*jumps):d);
  for(let j=1;j<hit.length;j++){d*=.85;zapHit(hit[j],d)}
  zaps.push({pts,l:.09,w:1});AU.chain();
}
function drawZaps(){
  for(const z of zaps){
    const a=Math.min(1,z.l*14);ctx.globalAlpha=a;
    for(const st of[['rgba(199,155,255,.55)',6*z.w],['#f4ecff',1.8*z.w]]){ctx.strokeStyle=st[0];ctx.lineWidth=st[1];ctx.beginPath();ctx.moveTo(z.pts[0],z.pts[1]);for(let j=2;j<z.pts.length;j+=2)ctx.lineTo(z.pts[j],z.pts[j+1]);ctx.stroke()}
  }
  ctx.globalAlpha=1;
}
/* ---- 超載 (overdrive): chapter 2 gauge, filled by medals and kills ---- */
function odAdd(n){
  if(!CH2()||P.od>0||G.mode!=='play')return;
  P.odg=Math.min(100,P.odg+n);
  if(P.odg>=100&&P.alive)odStart();
}
function odStart(){
  P.od=8;P.odg=0;P.inv=Math.max(P.inv,.6);AU.od();G.flash=.15;G.flashCol='#ffe45c';
  ringFx(P.x,P.y,90,'#ffe45c',.5,5);floatTxt(P.x,P.y-42,'超載！火力全開','#ffe45c');
  for(let i=eb.length-1;i>=0;i--){const b=eb[i];if((b.x-P.x)**2+(b.y-P.y)**2<120*120){eb.splice(i,1);if(items.length<90)items.push({x:b.x,y:b.y,vx:0,vy:-40,k:'M',t:0,sub:0})}}
}
function nearest(x,y){
  let best=null,bd=1e9;
  for(const e of enemies){if(e.y<-10||e.under)continue;const d=(e.x-x)*(e.x-x)+(e.y-y)*(e.y-y);if(d<bd){bd=d;best=e}}
  const B=G.boss;if(B&&B.active&&!B.dying){
    if(B.parts)for(const q of B.parts){if(q.dead)continue;const d=(q.x-x)*(q.x-x)+(q.y-y)*(q.y-y);if(d<bd){bd=d;best=q}}
    if(B.body!==false){const d=(B.x-x)*(B.x-x)+(B.y-y)*(B.y-y);if(d<bd||!best)best=B}
  }
  return best;
}
function hitPlayer(){
  if(!P.alive||P.inv>0||G.mode!=='play')return;
  if(P.shield){P.shield=false;P.inv=1.6;ringFx(P.x,P.y,60,'#62e2ff',.5,4);AU.zap();
    for(let i=eb.length-1;i>=0;i--){const b=eb[i];if((b.x-P.x)**2+(b.y-P.y)**2<90*90)eb.splice(i,1)}
    floatTxt(P.x,P.y-26,'護盾擋下','#62e2ff');return}
  P.alive=false;P.dead=1.3;G.lives--;P.od=0;P.odg*=.5;P.wLv=Math.max(1,P.wLv-1);boom(P.x,P.y,true);AU.die();G.flash=.25;G.flashCol='#ff4a5c';
  clearBullets(false);drag=null;G.hudDirty=true;try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}
  if(bombs.every(n=>n===0))bombs[0]=1;
}
function updPlayer(dt,canFire){
  if(!P.alive){
    P.dead-=dt;
    if(P.dead<=0){if(G.lives<=0){gameOver();return}P.alive=true;P.x=W/2;P.y=H-90;P.inv=3;G.hudDirty=true}
    return;
  }
  keyMove(dt);P.inv=Math.max(0,P.inv-dt);
  if(P.od>0){P.od=Math.max(0,P.od-dt);if(parts.length<420&&Math.random()<.6)parts.push({x:P.x+rnd(-7,7),y:P.y+14,vx:rnd(-20,20),vy:rnd(80,140),l:.35,m:.35,s:3,c:Math.random()<.5?'#ffe45c':'#ffb347',k:0})}
  P.bank+=(clamp(P.vx/6,-1,1)-P.bank)*Math.min(1,dt*14);P.vx=0;
  P.fireT-=dt;if(canFire&&P.fireT<=0)fire();
  P.wingT-=dt;
  for(let i=0;i<2;i++){
    const w=wingPos[i],tx=P.x+(i?27:-27),ty=P.y+10;w.x+=(tx-w.x)*Math.min(1,dt*10);w.y+=(ty-w.y)*Math.min(1,dt*10);
    if(i<P.wing&&canFire&&P.wingT<=0)pShot(w.x,w.y-8,-Math.PI/2,640,1.2,3,2.5);
  }
  if(P.wingT<=0)P.wingT=.14;
}
function hitsE(e,b,pad){
  if(e.hw)return Math.abs(e.x-b.x)<e.hw+b.r+pad&&Math.abs(e.y-b.y)<e.hh+b.r+pad;
  const rr=e.r+b.r+pad,dx=e.x-b.x,dy=e.y-b.y;return dx*dx+dy*dy<rr*rr;
}
function shieldHit(e,d){
  e.sh-=d;e.shf=.08;AU.shieldHit();
  if(e.sh<=0){e.sh=0;ringFx(e.x,e.y,28,'#7ff3ff',.3,3);AU.zap();floatTxt(e.x,e.y-18,'護盾破壞','#7ff3ff')}
}
function updPB(dt){
  const B=G.boss,fm=G.freeze>0?1.5:1;
  for(let i=pb.length-1;i>=0;i--){
    const b=pb[i];b.t+=dt;
    if(b.k===2){ /* homing */
      if(!b.tg||b.tg.hp<=0||b.tg.gone||b.tg.under)b.tg=nearest(b.x,b.y);
      const sp=Math.min(520,300+b.t*500);
      if(b.tg){let da=Math.atan2(b.tg.y-b.y,b.tg.x-b.x)-b.a;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;b.a+=clamp(da,-7*dt,7*dt)}
      b.vx=Math.cos(b.a)*sp;b.vy=Math.sin(b.a)*sp;
      if(parts.length<400&&Math.random()<.5)parts.push({x:b.x,y:b.y,vx:0,vy:30,l:.25,m:.25,s:2.5,c:'#c8ffd6',k:0});
      if(b.t>3.2){pb.splice(i,1);continue}
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y<-30||b.y>H+30||b.x<-30||b.x>W+30){pb.splice(i,1);continue}
    let gone=false;
    for(let j=enemies.length-1;j>=0;j--){
      const e=enemies[j];if(e.under)continue;
      if(hitsE(e,b,b.k===1?4:0)){
        if(b.h){if(b.h.includes(e))continue;b.h.push(e)}
        /* energy shield: lasers pierce it, missiles curving in from the side slip past */
        if(e.sh>0&&!b.h&&!(b.k===2&&Math.abs(b.vx)>Math.abs(b.vy)*.8)){shieldHit(e,b.d*fm);fx(b.x,b.y,2,'#9ff6ff',70,.2,2);gone=true;break}
        hurt(e,b.d*fm);fx(b.x,e.y+e.r*.5,1,'#fff',60,.2,2);
        if(!b.h){gone=true;break}
      }
    }
    const bOK=B&&B.active&&!B.dying;
    if(!gone&&bOK&&B.slabs&&slabBlock(B,b.x,b.y)){fx(b.x,b.y,2,'#e0d2a8',80,.25,2);gone=true}
    if(!gone&&bOK&&B.parts){
      for(const q of B.parts){
        if(q.dead)continue;const dx=q.x-b.x,dy=q.y-b.y,rr=q.r+b.r;
        if(dx*dx+dy*dy<rr*rr){
          if(b.h){if(b.h.includes(q))continue;b.h.push(q);hurtPart(q,b.d*fm);fx(b.x,q.y+q.r*.5,1,'#fff',70,.2,2)}
          else{hurtPart(q,b.d*fm);fx(b.x,b.y,1,'#fff',70,.2,2);gone=true;break}
        }
      }
    }
    if(!gone&&bOK&&B.body!==false&&Math.abs(B.x-b.x)<B.hw+b.r&&Math.abs(B.y-b.y)<B.hh+b.r){
      if(b.h){if(!b.h.includes(B)){b.h.push(B);hurtBoss(b.d*fm);fx(b.x,B.y+B.hh,1,'#fff',70,.2,2)}}
      else{hurtBoss(b.d*fm);fx(b.x,b.y,1,'#fff',70,.2,2);gone=true}
    }
    if(gone)pb.splice(i,1);
  }
}
function drawPB(){
  for(const b of pb){
    if(b.k===1){ctx.fillStyle='rgba(98,226,255,.55)';ctx.fillRect(b.x-b.r,b.y-16,b.r*2,34);ctx.fillStyle='#eaffff';ctx.fillRect(b.x-b.r*.4,b.y-16,b.r*.8,34)}
    else if(b.k===2){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.fillStyle='#7dff9a';ctx.fillRect(-6,-2.2,11,4.4);ctx.fillStyle='#fff';ctx.fillRect(3,-1.5,4,3);ctx.restore()}
    else{ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a+Math.PI/2);ctx.fillStyle=b.k===3?'#9fe8ff':'#ffd34a';ctx.fillRect(-2,-7,4,14);ctx.fillStyle='#fffbe6';ctx.fillRect(-1,-6,2,9);ctx.restore()}
  }
}
function drawPlayer(){
  if(!P.alive)return;
  if(P.od>0){const pu=.5+.5*Math.sin(G.t*18),g=ctx.createRadialGradient(P.x,P.y,4,P.x,P.y,30);g.addColorStop(0,'rgba(255,228,92,'+(.45+.25*pu)+')');g.addColorStop(1,'rgba(255,180,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(P.x,P.y,30,0,TAU);ctx.fill()}
  if(P.inv>0&&((G.t*14)|0)%2===0&&!P.shield)ctx.globalAlpha=.45;
  const tier=P.wLv>=5?2:P.wLv>=3?1:0,s=SPR.p[tier],fl=6+Math.random()*7;
  ctx.fillStyle='#ffb347';ctx.beginPath();ctx.moveTo(P.x-3,P.y+13);ctx.lineTo(P.x,P.y+13+fl);ctx.lineTo(P.x+3,P.y+13);ctx.fill();
  ctx.fillStyle='#fff7d0';ctx.fillRect(P.x-1,P.y+13,2,fl*.5);
  ctx.save();ctx.translate(P.x,P.y);ctx.scale(1-Math.abs(P.bank)*.28,1);ctx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);ctx.restore();
  for(let i=0;i<P.wing;i++)spr(SPR.wing,wingPos[i].x,wingPos[i].y);
  ctx.globalAlpha=1;
  if(P.shield){ctx.strokeStyle='rgba(98,226,255,'+(.55+Math.sin(G.t*8)*.25)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,24,0,TAU);ctx.stroke()}
  /* visible hit core: only this dot can be hit */
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y,3.2,0,TAU);ctx.fill();ctx.fillStyle='#ff4a5c';ctx.beginPath();ctx.arc(P.x,P.y,1.8,0,TAU);ctx.fill();
}
