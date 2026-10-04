/* ================= player, weapons, player bullets ================= */
const wingPos=[{x:W/2-26,y:540},{x:W/2+26,y:540}];
function pShot(x,y,a,sp,d,k,r){pb.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,d,k,r:r||3,a,t:0,h:k===1?[]:null,tg:null})}
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
  }else{ /* 追蹤飛彈: light front guns + seeking missiles */
    pShot(x-4,y,up,640,1,0);pShot(x+4,y,up,640,1,0);P.fireT=.12;
    P.missT-=.12;
    if(P.missT<=0){P.missT=.42;const n=[1,2,2,3,4][lv-1],d=[3,3,4,4,5][lv-1];
      for(let i=0;i<n;i++){const s=n===1?0:(i/(n-1)-.5)*2;pShot(x+s*12,P.y,up+s*.7,300,d,2,4)}}
  }
  AU.shot();
}
function nearest(x,y){
  let best=null,bd=1e9;
  for(const e of enemies){if(e.y<-10)continue;const d=(e.x-x)*(e.x-x)+(e.y-y)*(e.y-y);if(d<bd){bd=d;best=e}}
  const B=G.boss;if(B&&B.active&&!B.dying){const d=(B.x-x)*(B.x-x)+(B.y-y)*(B.y-y);if(d<bd||!best)best=B}
  return best;
}
function hitPlayer(){
  if(!P.alive||P.inv>0||G.mode!=='play')return;
  if(P.shield){P.shield=false;P.inv=1.6;ringFx(P.x,P.y,60,'#62e2ff',.5,4);AU.zap();
    for(let i=eb.length-1;i>=0;i--){const b=eb[i];if((b.x-P.x)**2+(b.y-P.y)**2<90*90)eb.splice(i,1)}
    floatTxt(P.x,P.y-26,'護盾擋下','#62e2ff');return}
  P.alive=false;P.dead=1.3;G.lives--;P.wLv=Math.max(1,P.wLv-1);boom(P.x,P.y,true);AU.die();G.flash=.25;G.flashCol='#ff4a5c';
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
  P.bank+=(clamp(P.vx/6,-1,1)-P.bank)*Math.min(1,dt*14);P.vx=0;
  P.fireT-=dt;if(canFire&&P.fireT<=0)fire();
  P.wingT-=dt;
  for(let i=0;i<2;i++){
    const w=wingPos[i],tx=P.x+(i?27:-27),ty=P.y+10;w.x+=(tx-w.x)*Math.min(1,dt*10);w.y+=(ty-w.y)*Math.min(1,dt*10);
    if(i<P.wing&&canFire&&P.wingT<=0)pShot(w.x,w.y-8,-Math.PI/2,640,1.2,3,2.5);
  }
  if(P.wingT<=0)P.wingT=.14;
}
function updPB(dt){
  const B=G.boss,fm=G.freeze>0?1.5:1;
  for(let i=pb.length-1;i>=0;i--){
    const b=pb[i];b.t+=dt;
    if(b.k===2){ /* homing */
      if(!b.tg||b.tg.hp<=0||b.tg.gone)b.tg=nearest(b.x,b.y);
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
      const e=enemies[j],rr=e.r+b.r+(b.k===1?4:0),dx=e.x-b.x,dy=e.y-b.y;
      if(dx*dx+dy*dy<rr*rr){
        if(b.h){if(b.h.includes(e))continue;b.h.push(e)}
        hurt(e,b.d*fm);fx(b.x,e.y+e.r*.5,1,'#fff',60,.2,2);
        if(!b.h){gone=true;break}
      }
    }
    if(!gone&&B&&B.active&&!B.dying&&Math.abs(B.x-b.x)<B.hw+b.r&&Math.abs(B.y-b.y)<B.hh+b.r){
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
