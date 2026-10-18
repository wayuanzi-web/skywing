/* ================= enemies ================= */
const ED={
  grunt:{hp:3,r:10,sc:100},weaver:{hp:4,r:10,sc:150},diver:{hp:4,r:9,sc:200},sweeper:{hp:5,r:11,sc:200},
  ace:{hp:10,r:11,sc:400},carrier:{hp:11,r:18,sc:500},gunship:{hp:28,r:17,sc:1000},bomber:{hp:75,r:27,sc:3000},
  mine:{hp:8,r:11,sc:150},spinner:{hp:24,r:14,sc:800}
};
const EX={};   /* chapter 2 enemy behaviours: EX[k] = {upd(e,dt,canFire), draw(e), init?(e), onKill?(e)} */
function hpScale(){return DIFF[G.diff].hp*(1+Math.min(G.stage,4)*.2+Math.max(0,G.stage-4)*.06)}
function spawn(k,x,y,p){
  const d=ED[k],sc=hpScale(),hp=d.hp*sc;
  const e={k,x,y,hp,mhp:hp,r:d.r,sc:d.sc,t:0,flash:0,fireT:rnd(.5,1.5),st:0,rot:Math.PI,p:p||{},gone:false};
  if(e.p.x0===undefined)e.p.x0=x;if(e.p.ph===undefined)e.p.ph=rnd(TAU);
  if(d.ground)e.ground=true;if(d.hw){e.hw=d.hw;e.hh=d.hh}if(d.sh)e.sh=e.shm=d.sh*sc;
  if(EX[k]&&EX[k].init)EX[k].init(e);
  enemies.push(e);return e;
}
function hurt(e,d,quiet){
  if(e.gone)return;e.hp-=d;e.flash=.07;
  if(e.hp<=0)killEnemy(e);else if(!quiet&&Math.random()<.25)AU.hit();
}
function killEnemy(e){
  e.gone=true;const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);
  const big=e.k==='bomber'||e.k==='gunship'||e.k==='spinner'||!!ED[e.k].big;
  boom(e.x,e.y,big);addScore(e.sc);odAdd(big?3:.4);
  if(EX[e.k]&&EX[e.k].onKill&&G.mode==='play'&&!(G.boss&&G.boss.gone))EX[e.k].onKill(e);
  /* every 16th kill also drops a weapon capsule, so upgrades keep coming even if a supply plane escapes */
  if(G.mode==='play'&&e.k!=='carrier'&&++G.killN%16===0)dropItem(e.x,e.y,'P',(Math.random()*WN())|0);
  if(e.k==='carrier')carrierDrop(e.x,e.y);
  else if(e.k==='bomber'){medals(e.x,e.y,8);if(e.p.item)dropItem(e.x,e.y,e.p.item,(Math.random()*4)|0)}
  else if(big)medals(e.x,e.y,4);
  else if(Math.random()<.55)medals(e.x,e.y,1);
  if(e.k==='mine'&&G.stage>=1&&G.mode==='play')ringB(e.x,e.y,G.diff===0?6:8,120,rnd(TAU),3);
}
function updEnemies(dt){
  if(G.freeze>0){for(const e of enemies)e.flash=Math.max(0,e.flash-dt);return}
  const rate=DIFF[G.diff].rate,sg=Math.min(G.stage,5),demo=G.mode!=='play';
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i],p=e.p;e.t+=dt;e.flash=Math.max(0,e.flash-dt);e.fireT-=dt;
    const canFire=!demo&&e.y>20&&e.y<H*.72&&P.alive;
    switch(e.k){
      case'grunt':
        e.y+=(p.sp||125)*dt;e.x+=(p.dx||0)*dt;
        if(canFire&&e.fireT<=0){e.fireT=(sg?2.2:3.6)*rate;shoot(e.x,e.y+8,aimA(e.x,e.y),150+sg*8)}
        break;
      case'weaver':
        e.y+=96*dt;e.x=p.x0+Math.sin(e.t*2.6+p.ph)*(p.amp||46);e.rot=Math.PI+Math.cos(e.t*2.6+p.ph)*.35;
        if(canFire&&e.fireT<=0){e.fireT=2*rate;shoot(e.x,e.y+8,aimA(e.x,e.y),160+sg*8)}
        break;
      case'diver':
        if(e.st===0){e.y+=170*dt;if(e.y>=(p.y1||110)){e.st=1;e.t=0}}
        else if(e.st===1){const a=aimA(e.x,e.y);e.rot=a+Math.PI/2;p.a=a;if(e.t>.5){e.st=2;if(sg>=2&&!demo)fan(e.x,e.y,a,3,.5,170,1)}}
        else{e.x+=Math.cos(p.a)*400*dt;e.y+=Math.sin(p.a)*400*dt}
        break;
      case'sweeper':{
        const s=p.side||-1,ox=e.x,oy=e.y;e.x=(s<0?-20:W+20)-s*e.t*150;e.y=(p.y0||120)+Math.sin(e.t*1.6)*42+e.t*34;
        e.rot=Math.atan2(e.y-oy,e.x-ox)+Math.PI/2;
        if(canFire&&e.fireT<=0){e.fireT=1.15*rate;shoot(e.x,e.y+8,Math.PI/2,170+sg*8,1)}
        break}
      case'ace':
        if(e.st===0){e.y+=260*dt;if(e.y>=(p.y1||130)){e.st=1;e.t=0}}
        else if(e.st===1){e.x+=clamp(P.x-e.x,-1,1)*70*dt;
          if(canFire&&e.fireT<=0){e.fireT=1.3*rate;const a=aimA(e.x,e.y);for(let j=0;j<3;j++)later(j*.09,()=>{if(!e.gone)shoot(e.x,e.y+8,a,230,1)})}
          if(e.t>3.6)e.st=2}
        else e.y+=320*dt;
        break;
      case'carrier':
        e.x+=(p.dir||1)*58*dt;e.y+=Math.sin(e.t*2)*10*dt;e.rot=(p.dir||1)>0?Math.PI/2:-Math.PI/2;
        break;
      case'gunship':
        if(e.st===0){e.y+=95*dt;if(e.y>=(p.y1||140)){e.st=1;e.t=0}}
        else if(e.st===1){e.x=p.x0+Math.sin(e.t*.9)*34;
          if(canFire&&e.fireT<=0){e.fireT=1.6*rate;fan(e.x,e.y+12,aimA(e.x,e.y),sg>=2?5:3,sg>=2?.7:.45,165+sg*8)}
          if(e.t>9)e.st=2}
        else e.y+=90*dt;
        break;
      case'bomber':
        e.y+=(e.y<H*.3?44:20)*dt;
        if(canFire&&e.fireT<=0){e.fireT=2.1*rate;e.st++;
          if(e.st%2)ringB(e.x,e.y,10+sg*2,125,rnd(TAU),2,5);else fan(e.x,e.y+16,aimA(e.x,e.y),3+(sg>>1),.5,190,1)}
        break;
      case'mine':
        e.y+=58*dt;e.x=p.x0+Math.sin(e.t*1.4+p.ph)*20;e.rot+=dt*1.5;
        break;
      case'spinner':
        if(e.st===0){e.y+=110*dt;if(e.y>=(p.y1||150)){e.st=1}}else e.y+=16*dt;
        e.rot+=dt*2.4;
        if(canFire&&e.st===1&&e.fireT<=0){e.fireT=.2*rate;shoot(e.x,e.y,e.rot,150,3);shoot(e.x,e.y,e.rot+Math.PI,150,3)}
        break;
      default:
        if(EX[e.k])EX[e.k].upd(e,dt,canFire);
    }
    if(e.gone)continue;   /* an update may remove the enemy itself */
    if(e.y>H+50+(e.hh||0)||e.y<-90-(e.hh||0)||(e.t>1.2&&(e.x<-70||e.x>W+70))){e.gone=true;enemies.splice(i,1);continue}
    if(P.alive&&!demo&&!e.ground&&!e.under){const dx=e.x-P.x,dy=e.y-P.y,rr=e.r*.7+P.r+3;if(dx*dx+dy*dy<rr*rr){hitPlayer();hurt(e,25)}}
  }
}
function drawEnemies(ground){
  for(const e of enemies){
    if(!!e.ground!==!!ground)continue;
    if(EX[e.k]){EX[e.k].draw(e);if(G.freeze>0&&!e.under){ctx.fillStyle='rgba(143,233,255,.38)';ctx.beginPath();ctx.arc(e.x,e.y,(e.hh||e.r)+3,0,TAU);ctx.fill()}continue}
    if(e.k==='carrier'){ctx.strokeStyle='rgba(244,183,64,'+(.35+Math.sin(e.t*9)*.3)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,25,0,TAU);ctx.stroke()}
    spr(ESPR[e.k],e.x,e.y,e.rot,1,e.flash>0);
    if(G.freeze>0){ctx.fillStyle='rgba(143,233,255,.38)';ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,TAU);ctx.fill()}
  }
}
/* ---- delayed-call queue + formations ---- */
const LQ=[];
function later(d,fn){LQ.push({t:d,fn})}
function updLater(dt){for(let i=LQ.length-1;i>=0;i--){const q=LQ[i];q.t-=dt;if(q.t<=0){LQ.splice(i,1);q.fn()}}}
const F={
  col(k,n,x,gap,p){for(let i=0;i<n;i++)later(i*(gap||.32),()=>spawn(k,x,-20,p?{...p}:null))},
  vee(k,n,cx){for(let i=0;i<n;i++){const o=Math.ceil(i/2)*(i%2?1:-1);later(Math.abs(o)*.22,()=>spawn(k,cx+o*30,-20))}},
  row(k,n){for(let i=0;i<n;i++)spawn(k,(i+.5)*W/n,-20-(i%2)*18)},
  rain(k,n,gap,p){for(let i=0;i<n;i++)later(i*(gap||.4),()=>spawn(k,rnd(30,W-30),-20,p?{...p,y1:rnd(90,170)}:{y1:rnd(90,170)}))},
  side(k,n,s,y0){for(let i=0;i<n;i++)later(i*.3,()=>spawn(k,s<0?-20:W+20,y0,{side:s,y0}))},
  one(k,x,p){return spawn(k,x,-34,p)},
  car(dir){spawn('carrier',dir>0?-30:W+30,rnd(100,150),{dir})},
  cross(k,n){for(let i=0;i<n;i++)later(i*.35,()=>{spawn(k,40,-20,{dx:60});spawn(k,W-40,-20,{dx:-60})})}
};
