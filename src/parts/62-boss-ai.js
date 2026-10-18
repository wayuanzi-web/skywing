/* ================= boss logic: 5 bosses, phased attack patterns ================= */
let BDT=0;
function ev(B,k,per,fn){if(B.tm[k]===undefined)B.tm[k]=per*.6;B.tm[k]-=BDT;if(B.tm[k]<=0){B.tm[k]+=per*DIFF[G.diff].rate;fn()}}
function spawnBoss(){
  if(G.stage>=5){spawnBoss2();return}
  const d=BDEF[G.stage],hp=d.hp*DIFF[G.diff].hp;
  G.boss={i:G.stage,x:W/2,y:-80,ty:d.ty,hp,mhp:hp,hw:d.hw,hh:d.hh,t:0,ph:0,pause:0,active:false,dying:0,flash:0,a:0,tm:{},dir:1,gone:false};
}
function hurtBoss(d,quiet){
  const B=G.boss;if(!B||!B.active||B.dying>0)return;
  if(B.i>=5){hurtBoss2(B,d,quiet);return}
  B.hp-=d;B.flash=.05;G.hudDirty=true;if(!quiet&&Math.random()<.2)AU.hit();
  if(B.hp<=0){B.hp=0;killBoss();return}
  const n=B.i>=3?3:2,ph=Math.min(n-1,Math.floor((1-B.hp/B.mhp)*n));
  if(ph>B.ph){
    B.ph=ph;B.pause=1.4;B.tm={};clearBullets(true);hazards.length=0;LQ.length=0;
    ringFx(B.x,B.y,130,'#ff4a5c',.6,5);boom(B.x,B.y,true);G.shake=.45;AU.charge();
    floatTxt(B.x,B.y+B.hh+26,ph===n-1?'魔王暴走！':'火力升級！','#ff4a5c');
  }
}
function killBoss(){
  const B=G.boss;B.dying=B.i===9?3.8:2.6;B.gone=true;B.tm={};clearBullets(true);hazards.length=0;LQ.length=0;
  if(B.i>=5){G.wind=0;marks.length=0;SUBQ.length=0;G.subT=0;say2(VOICE[B.i-5].out);if(!B.hw){B.hw=B.hh=26}}
  for(const e of enemies.slice())killEnemy(e);
  G.phase='bossdead';G.phaseT=0;AU.stop();P.inv=Math.max(P.inv,4);
}
function sweepBeam(B,col){
  B.dir=-B.dir;AU.charge();
  beam({ride:true,oy:10,a:Math.PI/2+B.dir*1.02,rotv:-B.dir*.42,w:20,warn:1.1,fire:2.4,len:820,col});
}
function updBoss(dt){
  const B=G.boss;if(!B)return;B.flash=Math.max(0,B.flash-dt);
  if(B.dying>0){
    B.dying-=dt;B.y+=10*dt;
    if(Math.random()<dt*9)boom(B.x+rnd(-B.hw,B.hw),B.y+rnd(-B.hh,B.hh),Math.random()<.25);
    if(B.dying<=0){
      for(let j=0;j<5;j++)boom(B.x+rnd(-B.hw,B.hw),B.y+rnd(-B.hh,B.hh),true);
      ringFx(B.x,B.y,220,'#ffffff',.9,8);G.flash=.6;G.flashCol='#ffffff';G.shake=.9;
      addScore(20000*(B.i+1));medals(B.x,B.y,24);
      if(B.i<9){dropItem(B.x-30,B.y,'P',(Math.random()*WN())|0);dropItem(B.x+30,B.y,'B',(Math.random()*4)|0);if(B.i===1||B.i===3||B.i===6||B.i===8)dropItem(B.x,B.y+20,'U')}
      G.bossBonus=20000*(B.i+1);G.boss=null;G.hudDirty=true;try{navigator.vibrate&&navigator.vibrate([80,40,160])}catch(e){}
    }
    return;
  }
  if(G.freeze>0)return;
  if(B.i>=5){updBoss2(B,dt);return}
  B.t+=dt;
  if(!B.active){B.y+=70*dt;if(B.y>=B.ty){B.active=true;B.t=0;G.hudDirty=true}return}
  if(B.pause>0){B.pause-=dt;return}
  BDT=dt;const X=()=>B.x,Y=()=>B.y;
  switch(B.i){
    case 0: /* 鐵翼轟炸王: aimed fans + twin wing guns; later rings and escorts */
      B.x=W/2+Math.sin(B.t*.6)*86;B.y=B.ty+Math.sin(B.t*1.3)*8;
      ev(B,'fan',1.5,()=>fan(X(),Y()+26,aimA(X(),Y()+26),5,.7,170));
      ev(B,'gun',.42,()=>{shoot(X()-44,Y()+24,Math.PI/2,210,1);shoot(X()+44,Y()+24,Math.PI/2,210,1)});
      if(B.ph>=1){ev(B,'ring',2.6,()=>ringB(X(),Y(),14,125,rnd(TAU),2,5));ev(B,'add',6.5,()=>F.col('grunt',3,rnd(50,W-50)))}
      break;
    case 1: /* 沙暴毒蠍: claw bursts + lobbed tail shots; later a whipping stream and divers */
      B.x=W/2+Math.sin(B.t*.85)*100;B.y=B.ty+Math.sin(B.t*1.7)*14;
      ev(B,'claw',B.ph?1.5:1,()=>{B.dir=-B.dir;const d=B.dir;const a=aimA(X()+d*52,Y()+40);
        for(let j=0;j<3;j++)later(j*.1,()=>{if(G.boss===B&&!B.gone)shoot(X()+d*52,Y()+40,a,225,1)})});
      ev(B,'tail',2.8,()=>{for(let j=0;j<9;j++){const b=shoot(X(),Y()-40,-Math.PI/2+(j-4)*.2,150,2,5);if(b)b.g=200}});
      if(B.ph>=1){ev(B,'whip',.13,()=>{B.a+=.2;shoot(X(),Y()+30,Math.PI/2+Math.sin(B.a)*1.05,185,0)});ev(B,'div',5.5,()=>F.rain('diver',3,.4))}
      break;
    case 2: /* 雷雲母艦: telegraphed lightning columns + spiral */
      B.x=W/2+Math.sin(B.t*.45)*70;B.y=B.ty+Math.sin(B.t)*8;
      ev(B,'lz',B.ph?2.7:3.4,()=>{AU.charge();const n=B.ph?4:3;for(let j=0;j<n;j++)beam({x:j===0?P.x:rnd(20,W-20),y:0,w:24,warn:.95,fire:.6})});
      ev(B,'sp',.12,()=>{B.a+=.31;shoot(X(),Y()+10,B.a,150,3);if(B.ph)shoot(X(),Y()+10,B.a+Math.PI,150,3)});
      if(B.ph)ev(B,'ring',3.2,()=>ringB(X(),Y(),16,120,rnd(TAU),0));
      break;
    case 3: /* 熔核機甲: counter-rotating spirals, splitting fireballs, half-field sweep beam */
      B.x=W/2+Math.sin(B.t*.5)*60;B.y=B.ty+Math.sin(B.t*.9)*10;
      if(B.ph===0){
        ev(B,'sp',.13,()=>{B.a+=.27;shoot(X(),Y(),B.a,155,2,5);shoot(X(),Y(),-B.a,155,0)});
        ev(B,'fb',2.4,()=>shoot(X(),Y()+30,aimA(X(),Y()),150,4));
      }else if(B.ph===1){
        ev(B,'beam',4.4,()=>sweepBeam(B,'#ff7a3c'));
        ev(B,'fan',1.4,()=>fan(X(),Y()+30,aimA(X(),Y()),5,.8,190,1));
        ev(B,'fb',3,()=>shoot(X(),Y()+30,aimA(X(),Y()),150,4));
      }else{
        ev(B,'sp',.1,()=>{B.a+=.23;shoot(X(),Y(),B.a,165,2,5);shoot(X(),Y(),1-B.a,165,0)});
        ev(B,'fb',1.9,()=>{const a=aimA(X(),Y());shoot(X(),Y()+30,a-.4,150,4);shoot(X(),Y()+30,a+.4,150,4)});
        ev(B,'beam',5.2,()=>sweepBeam(B,'#ff7a3c'));
      }
      break;
    case 4: /* 大魔王・終焉星核: flower rings → laser fans → dense spiral with walls */
      B.x=W/2+Math.sin(B.t*.5)*(B.ph===1?30:76);B.y=B.ty+Math.sin(B.t*1.2)*10;
      if(B.ph===0){
        ev(B,'fl',1.9,()=>{B.a+=.2;const a=B.a;ringB(X(),Y(),18,120,a,3);later(.3,()=>{if(G.boss===B&&!B.gone)ringB(X(),Y(),18,150,a+TAU/36,0)})});
        ev(B,'aim',1.2,()=>fan(X(),Y()+30,aimA(X(),Y()),3,.3,215,1));
      }else if(B.ph===1){
        ev(B,'arms',3.6,()=>{B.dir=-B.dir;AU.charge();
          for(const d of(B.dir>0?[-.52,0,.52]:[-.8,-.27,.27,.8]))beam({ride:true,oy:14,a:Math.PI/2+d,w:18,warn:1.1,fire:1.3,len:820,col:'#b98cff'})});
        ev(B,'sp',.17,()=>{B.a+=.37;shoot(X(),Y(),B.a,125,3)});
        ev(B,'add',7,()=>F.rain('ace',2,.5));
      }else{
        ev(B,'sp',.085,()=>{B.a+=.29;shoot(X(),Y(),B.a,150,0);shoot(X(),Y(),B.a+Math.PI,150,3)});
        ev(B,'burst',1.7,()=>fan(X(),Y()+30,aimA(X(),Y()),5,.6,225,1));
        ev(B,'wall',5,()=>{const gx=rnd(50,W-50);for(let x=8;x<W;x+=17)if(Math.abs(x-gx)>36)shoot(x,Y()+52,Math.PI/2,105,2,5)});
        ev(B,'lz',6.3,()=>{AU.charge();beam({x:P.x,y:0,w:26,warn:1,fire:.7,col:'#b98cff'});beam({x:W-P.x,y:0,w:26,warn:1,fire:.7,col:'#b98cff'})});
      }
      break;
  }
  if(P.alive&&Math.abs(P.x-B.x)<B.hw*.8&&Math.abs(P.y-B.y)<B.hh*.8)hitPlayer();
}
function drawBoss(){
  const B=G.boss;if(!B)return;
  if(B.i>=5){if(!B.ground)drawBoss2(B);return}
  const s=BSPR[B.i];
  ctx.save();ctx.translate(B.x,B.y);if(B.dying>0)ctx.translate(rnd(-3,3),rnd(-3,3));
  if(B.i===4){for(let j=0;j<6;j++){const a=G.t*1.2+j*TAU/6;ctx.fillStyle=j%2?'#b98cff':'#ff4a5c';ctx.beginPath();ctx.arc(Math.cos(a)*70,Math.sin(a)*52,4.5,0,TAU);ctx.fill()}}
  if(B.i===0)ctx.rotate(Math.PI);
  ctx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);if(B.flash>0){ctx.globalAlpha=.3;ctx.drawImage(s.f,-s.w/2,-s.h/2,s.w,s.h);ctx.globalAlpha=1}
  const pul=.5+.5*Math.sin(G.t*7);ctx.globalAlpha=.22+.3*pul;ctx.fillStyle=['#ff4a5c','#b47aff','#ffe45c','#ffe08a','#ff4a5c'][B.i];
  ctx.beginPath();ctx.arc(0,[-29,-50,-10,0,0][B.i],9+pul*5+(B.ph*3),0,TAU);ctx.fill();ctx.globalAlpha=1;
  if(G.freeze>0){ctx.fillStyle='rgba(143,233,255,.36)';ctx.fillRect(-B.hw-10,-B.hh-10,B.hw*2+20,B.hh*2+20)}
  ctx.restore();
}
