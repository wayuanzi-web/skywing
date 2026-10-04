/* ================= game flow, HUD, screens ================= */
const OV=['title','pause','over','clear','end'];
function setMode(m){
  G.mode=m;
  for(const k of OV)$('ov-'+k).hidden=(k!==m);
  const inGame=m!=='title';$('hud').hidden=!inGame;$('pad').hidden=!inGame;
  if(m!=='play'){$('warn').hidden=true;drag=null}
  else if(G.phase==='warn')$('warn').hidden=false;
  requestAnimationFrame(resize);
}
function banner(a,b,dur){$('ban1').textContent=a;$('ban2').textContent=b;$('banner').hidden=false;G.bannerT=dur}
function resetField(){
  enemies=[];eb=[];pb=[];items=[];parts=[];hazards=[];floats=[];bolts=[];vortex=null;shock=null;LQ.length=0;
  G.boss=null;G.freeze=0;G.thunder=0;G.thT=0;G.flash=0;G.shake=0;G.bannerT=0;$('banner').hidden=true;$('warn').hidden=true;$('bossbar').hidden=true;
}
function startStage(i){
  resetField();G.stage=i;G.phase='intro';G.phaseT=0;G.waveI=0;G.waveT=WAVES[i][0][0];
  P.alive=true;P.x=W/2;P.y=H-90;P.inv=2.5;P.fireT=0;P.bank=0;wingPos[0].x=P.x-27;wingPos[1].x=P.x+27;wingPos[0].y=wingPos[1].y=P.y+10;
  $('stgLbl').textContent='STAGE '+(i+1);$('stgName').textContent=STAGES[i].name;
  banner('STAGE '+(i+1),STAGES[i].name,2.4);AU.play(i,false);G.hudDirty=true;setMode('play');
}
function startGame(i){
  G.score=0;G.lives=[5,3,3][G.diff];G.extend=150000;carrierN=0;G.killN=0;
  P.wType=0;P.wLv=Math.min(4,1+i);P.wing=i>=2?1:0;P.shield=false;
  bombs[0]=i?2:1;bombs[1]=bombs[2]=bombs[3]=1;
  startStage(i);
}
function retryStage(){
  G.score=0;G.lives=[5,3,3][G.diff];G.extend=150000;P.wLv=Math.max(P.wLv,Math.min(4,1+G.stage));P.shield=false;
  for(let j=0;j<4;j++)bombs[j]=Math.max(bombs[j],1);
  startStage(G.stage);
}
function pauseGame(){if(G.mode!=='play')return;setMode('pause');if(AU.ctx)AU.ctx.suspend().catch(()=>{});try{speechSynthesis.cancel()}catch(e){}}
function wake(){try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}
function resumeGame(){if(G.mode!=='pause')return;AU.resume();wake();setMode('play')}
function saveHi(){store.set('hi',Math.floor(G.hi))}
function gameOver(){
  AU.stop();saveHi();$('overScore').textContent=pad7(G.score);$('overHi').textContent=pad7(G.hi);setMode('over');
}
function toTitle(){AU.stop();AU.resume();saveHi();resetField();G.stage=0;P.alive=true;P.wLv=1;P.wType=0;P.wing=0;P.shield=false;P.inv=0;setMode('title')}
function stageClear(){
  saveHi();
  const nb=bombs.reduce((a,b)=>a+b,0),lb=G.lives*5000,bb=nb*2000;addScore(lb+bb);saveHi();
  if(G.stage>=4){
    const s=G.score;$('endRank').textContent=s>=900000?'S':s>=600000?'A':s>=350000?'B':'C';
    $('endScore').textContent=pad7(s);$('endHi').textContent=pad7(G.hi);AU.extend();setMode('end');return;
  }
  $('clearName').textContent=STAGES[G.stage].boss+' 擊破';
  $('tBoss').textContent='+'+(G.bossBonus||0);$('tLife').textContent=G.lives+' × 5000';$('tBomb').textContent=nb+' × 2000';$('tTotal').textContent=pad7(G.score);
  AU.power();setMode('clear');
}
function showWarn(){
  AU.stop();$('warnName').textContent=STAGES[G.stage].boss;$('warn').hidden=false;AU.siren();
  AU.say('警告，'+STAGES[G.stage].boss.replace('・','，')+'，接近中');try{navigator.vibrate&&navigator.vibrate([200,100,200,100,200])}catch(e){}
}
const PLANE='<svg viewBox="0 0 16 16"><path d="M8 0l2 6 6 4v2l-6-1.5V14l2 1.2V16H4v-.8L6 14v-3.5L0 12v-2l6-4z"/></svg>';
function updHUD(){
  G.hudDirty=false;
  $('score').textContent=pad7(G.score);$('hi').textContent=pad7(G.hi);
  const n=Math.max(0,G.lives);$('lives').innerHTML=n>5?PLANE+'<b>×'+n+'</b>':PLANE.repeat(n);
  const w=WEAPONS[P.wType];$('wpn').style.color=w.col;$('wpnName').textContent=w.name+(P.wLv>=5?' MAX':'');
  let pips='';for(let j=1;j<=5;j++)pips+='<i'+(j<=P.wLv?' class="on"':'')+'></i>';$('wpnLv').innerHTML=pips;
  for(let j=0;j<4;j++){$('bc'+j).textContent='×'+bombs[j];$('bc'+j).parentElement.classList.toggle('empty',bombs[j]<=0)}
  const B=G.boss,show=!!(B&&B.active&&B.dying<=0);$('bossbar').hidden=!show;
  if(show){$('bossName').textContent=STAGES[B.i].boss;$('bossFill').style.transform='scaleX('+Math.max(0,B.hp/B.mhp).toFixed(3)+')'}
}
function update(dt){
  G.t+=dt;scroll+=dt*(70+G.stage*12);
  if(G.freeze>0)G.freeze-=dt;
  if(G.bannerT>0){G.bannerT-=dt;if(G.bannerT<=0)$('banner').hidden=true}
  G.phaseT+=dt;
  const frozen=G.freeze>0;
  if(G.phase==='intro'){if(G.phaseT>1.6){G.phase='waves';G.phaseT=0}}
  else if(G.phase==='waves'&&!frozen){
    G.waveT-=dt;
    if(G.waveT<=0){const ws=WAVES[G.stage];ws[G.waveI][1]();G.waveI++;
      if(G.waveI<ws.length)G.waveT=ws[G.waveI][0];else{G.phase='drain';G.phaseT=0}}
  }
  else if(G.phase==='drain'){if((enemies.length===0&&LQ.length===0&&G.phaseT>1.5)||G.phaseT>10){G.phase='warn';G.phaseT=0;showWarn()}}
  else if(G.phase==='warn'){if(G.phaseT>3.3){$('warn').hidden=true;G.phase='boss';G.phaseT=0;spawnBoss();AU.play(G.stage,true)}}
  else if(G.phase==='bossdead'){if(!G.boss&&G.phaseT>6){stageClear();return}}
  if(!frozen)updLater(dt);
  updPlayer(dt,G.phase!=='intro'||G.phaseT>.6);if(G.mode!=='play')return;
  updPB(dt);updEnemies(dt);updBoss(dt);updHazards(dt);updEB(dt);updItems(dt);updBombs(dt);updFx(dt);
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt*1.6);if(G.flash>0)G.flash=Math.max(0,G.flash-dt);
  if(G.hudDirty)updHUD();
}
/* title screen: the game plays itself above the menu */
function demo(dt){
  G.t+=dt;scroll+=dt*70;G.demoT-=dt;
  const top=H*.3;P.alive=true;P.inv=0;P.x=W/2+Math.sin(G.t*.8)*100;P.y=top;P.vx=Math.cos(G.t*.8)*5;P.wLv=3;P.wType=((G.t/6)|0)%3;P.wing=2;
  P.bank+=(clamp(P.vx/6,-1,1)-P.bank)*Math.min(1,dt*14);
  for(let i=0;i<2;i++){const w=wingPos[i];w.x+=(P.x+(i?27:-27)-w.x)*Math.min(1,dt*10);w.y+=(P.y+10-w.y)*Math.min(1,dt*10)}
  P.fireT-=dt;if(P.fireT<=0)fire();
  P.wingT-=dt;if(P.wingT<=0){P.wingT=.14;pShot(wingPos[0].x,wingPos[0].y-8,-Math.PI/2,640,1.2,3,2.5);pShot(wingPos[1].x,wingPos[1].y-8,-Math.PI/2,640,1.2,3,2.5)}
  if(G.demoT<=0){G.demoT=1.5;const k=pick(['grunt','weaver','grunt','sweeper']);
    if(k==='sweeper')F.side(k,3,Math.random()<.5?-1:1,40);else F.col(k,4,rnd(50,W-50),.3)}
  updLater(dt);updPB(dt);updEnemies(dt);
  for(let i=items.length-1;i>=0;i--){const it=items[i];it.t+=dt;it.y+=90*dt;if(it.y>top+60||it.t>1.2)items.splice(i,1)}
  for(let i=enemies.length-1;i>=0;i--)if(enemies[i].y>top+40){enemies[i].gone=true;enemies.splice(i,1)}
  updFx(dt);
}
