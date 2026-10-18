/* ================= particles, score, enemy-bullet helpers, items ================= */
const CF='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
function fx(x,y,n,col,sp,life,size){
  if(parts.length>520)return;sp=sp||120;life=life||.5;size=size||2.5;
  for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(sp*.25,sp);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(life*.5,life),m:life,s:rnd(size*.5,size),c:col,k:0})}
}
function ringFx(x,y,r,col,life,lw){parts.push({x,y,vx:0,vy:0,l:life||.4,m:life||.4,s:r,c:col,k:1,lw:lw||3})}
function boom(x,y,big){
  fx(x,y,big?26:9,'#ffd45c',big?260:150,big?.9:.45,big?4:3);fx(x,y,big?14:5,'#ff6a3c',big?180:100,big?.7:.4,big?5:3);
  ringFx(x,y,big?70:24,'#ffffff',big?.5:.3);parts.push({x,y,vx:0,vy:0,l:.16,m:.16,s:big?44:15,c:'#ffffff',k:2});
  AU.boom(big);if(big)G.shake=Math.max(G.shake,.35);
}
function floatTxt(x,y,txt,col){floats.push({x:clamp(x,40,W-40),y,txt,col:col||'#fff',l:1.1})}
function addScore(n){
  if(G.mode!=='play')return;
  G.score+=n;if(G.score>G.hi)G.hi=G.score;G.hudDirty=true;
  /* extra life at 150k, then every 300k; after 1.05M every 600k (ten stages score far more than five) */
  if(G.score>=G.extend){G.extend+=G.extend>=1050000?600000:300000;if(G.lives<9){G.lives++;AU.extend();floatTxt(P.x,P.y-34,'戰機 +1','#7dff9a')}}
}
/* enemy bullets */
function shoot(x,y,a,sp,k,r){
  if(eb.length>440||G.freeze>0)return null;const d=DIFF[G.diff].spd;
  const b={x,y,vx:Math.cos(a)*sp*d,vy:Math.sin(a)*sp*d,r:r||(k===2||k===4?8:4),k:k||0,t:0,a};eb.push(b);return b;
}
const aimA=(x,y)=>Math.atan2(P.y-y,P.x-x);
function fan(x,y,a,n,spread,sp,k,r){for(let i=0;i<n;i++)shoot(x,y,a+(n>1?(i/(n-1)-.5)*spread:0),sp,k,r)}
function ringB(x,y,n,sp,off,k,r){for(let i=0;i<n;i++)shoot(x,y,(off||0)+i*TAU/n,sp,k,r)}
function clearBullets(toMedal){
  for(const b of eb){if(toMedal&&items.length<90)items.push({x:b.x,y:b.y,vx:0,vy:-40,k:'M',t:0,sub:0});else fx(b.x,b.y,1,'#ffb0c4',40,.3,2)}
  eb.length=0;
}
function updEB(dt){
  const frozen=G.freeze>0;
  for(let i=eb.length-1;i>=0;i--){
    const b=eb[i];
    if(!frozen){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.g)b.vy+=b.g*dt;
      if(b.k===4&&b.t>.95){ringB(b.x,b.y,6,150,rnd(TAU),0);eb.splice(i,1);continue}
      if(b.k===8&&b.t>.9){for(let j=0;j<4;j++)shoot(b.x,b.y,Math.PI/4+j*Math.PI/2,140,5);eb.splice(i,1);continue} /* ice crystal splits */
      if(b.k===6&&b.t<1.6&&P.alive){ /* missile: steers toward the player for 1.6 s */
        const ca=Math.atan2(b.vy,b.vx),sp=Math.min(260,Math.hypot(b.vx,b.vy)+60*dt);let da=aimA(b.x,b.y)-ca;
        while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;const na=ca+clamp(da,-2.3*dt,2.3*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;
        if(parts.length<420&&Math.random()<.4)parts.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,m:.3,s:2.5,c:'#ffd0a0',k:0});
      }
      if(G.wind&&b.k===5)b.vx+=G.wind*dt;
    }
    if(b.x<-24||b.x>W+24||b.y<-30||b.y>H+24){eb.splice(i,1);continue}
    if(P.alive&&P.inv<=0){const dx=b.x-P.x,dy=b.y-P.y,rr=b.r*.62+P.r;if(dx*dx+dy*dy<rr*rr){eb.splice(i,1);hitPlayer();break}} /* hitPlayer clears bullets: stop iterating */
  }
}
const EBC=[['#ff4f86','#ffe3ec'],['#ff3d6e','#fff0f4'],['#ff7a2a','#ffe9a0'],['#b47aff','#f1e6ff'],['#ff3c5a','#ffd0d0'],
  ['#6fd0ff','#f2fcff'],['#ff9f1a','#fff4d0'],['#bfeaff','#ffffff'],['#9fe0ff','#ffffff'],['#a8987a','#e8dcc0']],EBO='#2a0618';
/* k: 0 pink 1 dart 2 big orange 3 violet 4 bursting 5 ice shard 6 missile 7 icicle 8 splitting crystal 9 stone slab */
function drawEB(){
  for(const b of eb){
    const c=EBC[b.k]||EBC[0];
    if(b.k===9){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.t*3);ctx.fillStyle=EBO;ctx.fillRect(-b.r-2,-b.r*.6-2,b.r*2+4,b.r*1.2+4);ctx.fillStyle=c[0];ctx.fillRect(-b.r,-b.r*.6,b.r*2,b.r*1.2);ctx.fillStyle=c[1];ctx.fillRect(-b.r*.6,-2,b.r*1.2,4);ctx.restore();continue}
    if(b.k===1||b.k===6||b.k===7){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.fillStyle=EBO;ctx.beginPath();ctx.ellipse(0,0,b.r*2.2+1.6,b.r+1.6,0,0,TAU);ctx.fill();
      ctx.fillStyle=c[0];ctx.beginPath();ctx.ellipse(0,0,b.r*2.2,b.r,0,0,TAU);ctx.fill();
      ctx.fillStyle=c[1];ctx.beginPath();ctx.ellipse(0,0,b.r*1.3,b.r*.45,0,0,TAU);ctx.fill();ctx.restore();continue}
    ctx.fillStyle=EBO;ctx.beginPath();ctx.arc(b.x,b.y,b.r+2.8,0,TAU);ctx.fill();
    ctx.fillStyle=G.freeze>0?'#8fe9ff':c[0];ctx.beginPath();ctx.arc(b.x,b.y,b.r+1.2,0,TAU);ctx.fill();
    ctx.fillStyle=c[1];ctx.beginPath();ctx.arc(b.x,b.y,b.r*.55,0,TAU);ctx.fill();
  }
}
/* items: P weapon capsule (cycles type), B bomb, W wingman, S shield, U 1UP, M medal */
let carrierN=0;
function dropItem(x,y,k,sub){items.push({x:clamp(x,20,W-20),y,vx:rnd()<.5?-42:42,vy:46,k,t:0,sub:sub||0})}
function carrierDrop(x,y){
  let k=['P','B','P','W','P','B','P','S'][carrierN++%8];
  if(k==='W'&&P.wing>=2)k='P';if(k==='S'&&P.shield)k='B';
  dropItem(x,y,k,k==='B'?(Math.random()*4)|0:(Math.random()*WN())|0);
}
function medals(x,y,n){for(let i=0;i<n&&items.length<90;i++)items.push({x:x+rnd(-14,14),y:y+rnd(-10,10),vx:rnd(-30,30),vy:rnd(-70,-10),k:'M',t:0,sub:0})}
function pickup(it){
  if(it.k==='M'){addScore(500);AU.tone(1320,.05,'square',.04);odAdd(1);return}
  if(it.k==='P'){
    const ty=capType(it);P.wType=ty;
    if(P.wLv<5){P.wLv++;floatTxt(it.x,it.y,WEAPONS[ty].name+(P.wLv>=5?' MAX':' LV'+P.wLv),WEAPONS[ty].col)}
    else{addScore(5000);floatTxt(it.x,it.y,WEAPONS[ty].name+' +5000',WEAPONS[ty].col)}
    AU.power();ringFx(P.x,P.y,40,WEAPONS[ty].col,.4);
  }else if(it.k==='B'){bombs[it.sub]=Math.min(5,bombs[it.sub]+1);floatTxt(it.x,it.y,BOMBS[it.sub].name+' +1',BOMBS[it.sub].col);AU.pick()}
  else if(it.k==='W'){if(P.wing<2){P.wing++;floatTxt(it.x,it.y,'僚機加入','#f4b740')}else{addScore(3000);floatTxt(it.x,it.y,'+3000','#f4b740')}AU.power()}
  else if(it.k==='S'){P.shield=true;floatTxt(it.x,it.y,'護盾啟動','#62e2ff');AU.power()}
  else if(it.k==='U'){if(G.lives<9){G.lives++;floatTxt(it.x,it.y,'戰機 +1','#7dff9a')}else{addScore(20000);floatTxt(it.x,it.y,'+20000','#7dff9a')}AU.extend()}
  G.hudDirty=true;
}
function capType(it){return(it.sub+((it.t/2.2)|0))%WN()}
function updItems(dt){
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.t+=dt;
    const dx=P.x-it.x,dy=P.y-it.y,d2=dx*dx+dy*dy;
    if(it.k==='M'){
      it.vy=Math.min(it.vy+160*dt,110);it.vx*=.97;
      if(P.alive&&(d2<110*110||G.phase==='bossdead'||G.phase==='cleared')){const d=Math.sqrt(d2)||1;it.x+=dx/d*420*dt;it.y+=dy/d*420*dt}
      else{it.x+=it.vx*dt;it.y+=it.vy*dt}
    }else{
      if(P.alive&&G.phase==='bossdead'&&!G.boss){const d=Math.sqrt(d2)||1;it.x+=dx/d*300*dt;it.y+=dy/d*300*dt}
      else{it.x+=it.vx*dt;it.y+=it.vy*dt}
      if(it.t<11){if(it.x<16||it.x>W-16)it.vx*=-1,it.x=clamp(it.x,16,W-16);if(it.y>H-60&&it.vy>0)it.vy*=-1;if(it.y<70&&it.vy<0)it.vy*=-1}
    }
    if(P.alive&&d2<(it.k==='M'?20*20:26*26)){items.splice(i,1);pickup(it);continue}
    if(it.y>H+30||it.y<-80)items.splice(i,1);
  }
}
function drawItems(){
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const it of items){
    if(it.k==='M'){const w=5*Math.abs(Math.cos(it.t*6))+1.5;ctx.fillStyle='#f4b740';ctx.beginPath();ctx.ellipse(it.x,it.y,w,6,0,0,TAU);ctx.fill();ctx.fillStyle='#fff3c4';ctx.fillRect(it.x-.8,it.y-3,1.6,6);continue}
    const pul=1+Math.sin(it.t*8)*.07;ctx.save();ctx.translate(it.x,it.y);ctx.scale(pul,pul);
    let col='#fff',ch='';
    if(it.k==='P'){const ty=capType(it);col=WEAPONS[ty].col;ch='火射追鏈'[ty]}
    else if(it.k==='B'){col=BOMBS[it.sub].col;ch='核電冰洞'[it.sub]}
    else if(it.k==='W'){col='#f4b740';ch='僚'}else if(it.k==='S'){col='#62e2ff';ch='盾'}else{col='#7dff9a';ch='1UP'}
    ctx.fillStyle='#0a0f24';ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();
    if(it.k==='P'){if(ctx.roundRect)ctx.roundRect(-11,-11,22,22,5);else ctx.rect(-11,-11,22,22)}else ctx.arc(0,0,12,0,TAU);
    ctx.fill();ctx.stroke();
    ctx.fillStyle=col;ctx.font='900 '+(ch.length>1?9:13)+'px '+CF;ctx.fillText(ch,0,1);ctx.restore();
  }
}
function updFx(dt){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;if(p.l<=0){parts.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k===0){p.vx*=.96;p.vy*=.96}}
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.l-=dt;f.y-=28*dt;if(f.l<=0)floats.splice(i,1)}
}
function drawFx(){
  for(const p of parts){
    const a=p.l/p.m;
    if(p.k===0){ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
    else if(p.k===1){ctx.globalAlpha=a;ctx.strokeStyle=p.c;ctx.lineWidth=p.lw*a+.5;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(1-a*.85),0,TAU);ctx.stroke()}
    else{ctx.globalAlpha=a*.9;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(1.2-a*.4),0,TAU);ctx.fill()}
  }
  ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 12px '+CF;
  for(const f of floats){ctx.globalAlpha=Math.min(1,f.l*2.5);ctx.lineWidth=3;ctx.strokeStyle='#0a0f24';ctx.strokeText(f.txt,f.x,f.y);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,f.y)}
  ctx.globalAlpha=1;
}
