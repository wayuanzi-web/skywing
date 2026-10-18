/* ================= chapter 2: backgrounds + enemy sprites ================= */
/* backgrounds for stages 6–10 (same scatter scheme as chapter 1: x, y on a 1000px tile, parallax l) */
(()=>{
  const LANE=[W*.12,W*.5,W*.88];
  for(let i=5;i<10;i++){
    const r=seeded(4021+i*577),a=[];
    const add=(n,k,l,s0,s1)=>{for(let j=0;j<n;j++)a.push({x:r()*W,y:r()*TH,s:s0+r()*(s1-s0),k,l,q:r()})};
    if(i===5){add(9,'floe',.5,24,52);add(8,'icecrack',.5,40,90);add(4,'pad',.5,34,46);add(5,'cloud',1.3,26,46);add(46,'snow',1.7,1,2.4)}
    if(i===6){add(52,'wave',.5,.5,1.8);add(9,'swell',.5,60,120);add(3,'islet',.5,16,28);add(6,'cloud',1.3,26,46)}
    if(i===7){add(5,'pool',.5,26,52);add(34,'canopy',.5,22,44);add(6,'ruin',.5,26,42);add(8,'mist',1.15,40,80)}
    if(i===8){add(18,'block',.5,26,44);add(14,'neon',.5,10,26);add(26,'car',.95,1,1);for(const it of a)if(it.k==='block'||it.k==='neon')it.x=LANE[(it.q*3)|0]+(r()-.5)*24}
    if(i===9){add(80,'star',.22,.5,1.4);add(26,'star',.6,.8,1.8);add(3,'neb',.12,90,160);add(7,'rift',.4,40,90);add(14,'debris',.7,5,13)}
    BG[i]=a;
  }
})();
function drawRoads(){
  for(const rx of[W*.28,W*.72]){
    ctx.fillStyle='#110d20';ctx.fillRect(rx-22,0,44,H);
    ctx.fillStyle='#2b2450';ctx.fillRect(rx-23,0,2,H);ctx.fillRect(rx+21,0,2,H);
    ctx.fillStyle='#4a3f78';const off=(scroll*.5)%40;for(let y=-40;y<H;y+=40)ctx.fillRect(rx-1.5,y+off,3,18);
  }
}
function drawBG2(it,x,y,s){
  switch(it.k){
    case'floe':ctx.fillStyle='#93b6ca';ctx.beginPath();ctx.ellipse(x,y,s,s*.62,it.q*3,0,TAU);ctx.fill();
      ctx.fillStyle='#a9c8d9';ctx.beginPath();ctx.ellipse(x-s*.12,y-s*.1,s*.7,s*.38,it.q*3,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(30,70,100,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,s,s*.62,it.q*3,0,TAU);ctx.stroke();break;
    case'icecrack':ctx.strokeStyle='rgba(200,240,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*.3*(it.q-.5),y+s*.35);ctx.lineTo(x+s*.5*(.5-it.q),y+s*.7);ctx.lineTo(x+s*.15,y+s);ctx.stroke();break;
    case'pad':ctx.fillStyle='#41566a';ctx.fillRect(x-s/2,y-s/2,s,s);ctx.strokeStyle='rgba(244,183,64,.75)';ctx.lineWidth=2;ctx.strokeRect(x-s/2+4,y-s/2+4,s-8,s-8);
      ctx.fillStyle='rgba(244,183,64,.75)';ctx.fillRect(x-7,y-9,3,18);ctx.fillRect(x+4,y-9,3,18);ctx.fillRect(x-7,y-1.5,14,3);break;
    case'snow':ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(x+Math.sin(G.t*1.5+it.q*9)*10,y,s,s);break;
    case'swell':ctx.fillStyle='rgba(0,16,26,.24)';ctx.beginPath();ctx.ellipse(x,y,s,s*.16,.08,0,TAU);ctx.fill();break;
    case'islet':ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,s+4,s*.7+4,it.q*3,0,TAU);ctx.stroke();
      ctx.fillStyle='#3b4a44';ctx.beginPath();ctx.ellipse(x,y,s,s*.7,it.q*3,0,TAU);ctx.fill();ctx.fillStyle='#4f6158';ctx.beginPath();ctx.ellipse(x-s*.2,y-s*.15,s*.5,s*.3,it.q*3,0,TAU);ctx.fill();break;
    case'canopy':ctx.fillStyle=it.q>.5?'#1b4520':'#225426';
      for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x+(k-1)*s*.55,y+((k*7)%3-1)*s*.2,s*(.5+((k*13)%4)*.06),0,TAU);ctx.fill()}
      ctx.fillStyle='rgba(150,210,110,.16)';ctx.beginPath();ctx.arc(x-s*.2,y-s*.25,s*.35,0,TAU);ctx.fill();break;
    case'ruin':ctx.fillStyle='#6a735b';ctx.fillRect(x-s/2,y-s/2,s,s);ctx.fillStyle='#565e47';ctx.fillRect(x-s/2+5,y-s/2+5,s-10,s-10);
      ctx.fillStyle='#78826a';ctx.fillRect(x-s/2+10,y-s/2+10,s-20,s-20);ctx.fillStyle='rgba(60,120,50,.65)';ctx.fillRect(x-s/2,y+s*.2,s*.45,3);ctx.fillRect(x+s*.1,y-s/2,3,s*.5);break;
    case'pool':ctx.fillStyle='#164646';ctx.beginPath();ctx.ellipse(x,y,s,s*.55,it.q*3,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(180,255,240,.14)';ctx.beginPath();ctx.ellipse(x-s*.2,y-s*.12,s*.5,s*.16,it.q*3,0,TAU);ctx.fill();break;
    case'mist':ctx.fillStyle='rgba(210,255,215,.05)';ctx.beginPath();ctx.ellipse(x,y,s*1.4,s*.5,0,0,TAU);ctx.fill();break;
    case'block':{const w=s,h=s*1.3;ctx.fillStyle='#151128';ctx.fillRect(x-w/2,y-h/2,w,h);ctx.strokeStyle='#2c2552';ctx.lineWidth=1.5;ctx.strokeRect(x-w/2,y-h/2,w,h);
      const lit=it.q>.5?'rgba(255,215,106,.75)':'rgba(127,243,255,.7)',seed=(it.q*997)|0;ctx.fillStyle=lit;
      for(let ry=0;ry<(h-8)/8;ry++)for(let cx=0;cx<(w-8)/8;cx++)if((ry*7+cx*13+seed)%5<2)ctx.fillRect(x-w/2+5+cx*8,y-h/2+5+ry*8,3,3);break}
    case'neon':{const c=it.q>.5?'255,79,216':'79,243,255',x0=x-s,x1=x+s;
      ctx.strokeStyle='rgba('+c+',.22)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
      ctx.strokeStyle='rgba('+c+',.95)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();break}
    case'car':{const lane=[W*.28-9,W*.28+9,W*.72-9,W*.72+9][(it.q*4)|0],head=((it.q*40)|0)%2===0;
      ctx.fillStyle=head?'rgba(255,246,208,.22)':'rgba(255,74,92,.2)';ctx.fillRect(lane-4,y-12,8,12);
      ctx.fillStyle=head?'#fff6d0':'#ff4a5c';ctx.fillRect(lane-4,y,2,3);ctx.fillRect(lane+2,y,2,3);break}
    case'rift':{const pts=[];for(let k=0;k<=6;k++)pts.push(x+Math.sin(k*2.3+it.q*9)*s*.18,y+k*s/6);
      for(const st of[['rgba(185,140,255,.3)',7],['#e6d4ff',1.5]]){ctx.strokeStyle=st[0];ctx.lineWidth=st[1];ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let k=2;k<pts.length;k+=2)ctx.lineTo(pts[k],pts[k+1]);ctx.stroke()}break}
    case'debris':ctx.save();ctx.translate(x,y);ctx.rotate(G.t*(.3+it.q)+it.q*9);ctx.fillStyle='#2a1f3d';ctx.strokeStyle='#6b4fa8';ctx.lineWidth=1.2;
      ctx.beginPath();for(let k=0;k<5;k++){const a=k*TAU/5,rr=s*(.7+((k*17+it.q*10)%3)*.15);k?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();break;
  }
}
/* ---- enemy sprites (ground targets face up = -y unless noted) ---- */
const SPR2={
  turret:mk(32,32,g=>{poly(g,[-9,-14,9,-14,14,-9,14,9,9,14,-9,14,-14,9,-14,-9],'#56657f','#141a2c',1.5);disc(g,0,0,10,'#3e4a63','#141a2c');
    g.fillStyle='#8fa0c4';for(const[x,y]of[[-10,-10],[10,-10],[-10,10],[10,10]])g.fillRect(x-1,y-1,2,2)}),
  tank:mk(30,36,g=>{g.fillStyle='#262b26';g.fillRect(-14,-16,7,32);g.fillRect(7,-16,7,32);g.fillStyle='#4a5248';for(let y=-14;y<16;y+=4){g.fillRect(-14,y,7,1.4);g.fillRect(7,y,7,1.4)}
    poly(g,[-8,-15,8,-15,9,15,-9,15],'#d4dbe2','#1a1f26',1.2);g.fillStyle='#9aa6b0';g.fillRect(-6,-8,5,6);g.fillRect(2,4,5,7)}),
  shard:mk(28,28,g=>{poly(g,[0,-13,10,0,0,13,-10,0],'#8fd6f5','#24506e',1.5);poly(g,[0,-13,10,0,0,0],'#c9efff');poly(g,[0,13,-10,0,0,0],'#5fb2dc');disc(g,0,0,3.2,'#ffffff')}),
  shardlet:mk(14,14,g=>{poly(g,[0,-6,4.5,0,0,6,-4.5,0],'#bfeaff','#24506e',1);disc(g,0,0,1.6,'#ffffff')}),
  destroyer:mk(34,100,g=>{poly(g,[0,-47,12,-31,14,30,10,47,-10,47,-14,30,-12,-31],'#58616d','#12171e',1.6);
    poly(g,[0,-40,9,-28,10,28,7,42,-7,42,-10,28,-9,-28],'#6b7582');g.fillStyle='#8592a0';g.fillRect(-6,-6,12,16);g.fillStyle='#3a4048';g.fillRect(-3,12,6,8);
    g.fillStyle='#e8e2c8';g.fillRect(-1,-38,2,6);g.fillStyle='#c84a3a';g.fillRect(-12,40,24,3)}),
  sub:mk(24,62,g=>{g.fillStyle='#2b383e';g.strokeStyle='#0b1113';g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,9,28,0,0,TAU);g.fill();g.stroke();
    g.fillStyle='#43535a';g.beginPath();g.ellipse(0,-6,4,9,0,0,TAU);g.fill();g.fillStyle='#ff9f1a';g.fillRect(-1,8,2,2);g.fillRect(-1,14,2,2)}),
  shieldjet:mk(30,28,g=>jet(g,{len:24,span:24,sweep:3,bw:3.6,body:'#4fc3d6',wing:'#1f6f80',tail:.5,glass:'#e0fbff',pods:1})),
  statue:mk(38,42,g=>{poly(g,[-16,-18,16,-18,18,18,-18,18],'#7b785f','#25231a',1.6);poly(g,[-12,-14,12,-14,13,14,-13,14],'#8f8b70');
    g.fillStyle='#5b5843';g.fillRect(-11,-9,22,3);g.fillRect(-2,-4,4,9);g.fillRect(-7,8,14,3);
    g.fillStyle='#2a2818';g.fillRect(-9,-5,6,4);g.fillRect(3,-5,6,4);g.fillStyle='#4e7a3c';g.fillRect(-18,10,7,3);g.fillRect(12,-18,5,3);g.fillRect(-16,-18,3,6)}),
  swarm:mk(18,18,g=>{g.fillStyle='rgba(232,240,255,.65)';g.beginPath();g.ellipse(-5,-1,5,3,-.4,0,TAU);g.fill();g.beginPath();g.ellipse(5,-1,5,3,.4,0,TAU);g.fill();
    g.fillStyle='#c9a43a';g.strokeStyle='#3a2a06';g.lineWidth=1;g.beginPath();g.ellipse(0,1,3.2,5.5,0,0,TAU);g.fill();g.stroke();disc(g,0,-3,1.4,'#ff4a5c')}),
  sniper:mk(26,36,g=>jet(g,{len:32,span:18,sweep:8,bw:2.8,body:'#3a3f4f',wing:'#1c1f2a',tail:.5,glass:'#ff4a5c',trim:'#ff4a5c'})),
  raider:mk(30,28,g=>jet(g,{len:24,span:24,sweep:4,bw:3.4,body:'#ff4fd8',wing:'#8a1f78',tail:.5,glass:'#ffe0fa'})),
  copter:mk(34,52,g=>{g.fillStyle='#3a4a2e';g.fillRect(-1.6,4,3.2,22);poly(g,[-6,22,6,22,6,26,-6,26],'#3a4a2e','#141a10');
    poly(g,[-14,-2,14,-2,14,2,-14,2],'#2f3c26','#141a10');g.fillStyle='#ff6a3c';g.fillRect(-15,-1,3,6);g.fillRect(12,-1,3,6);
    g.fillStyle='#4f5f3e';g.strokeStyle='#141a10';g.lineWidth=1.5;g.beginPath();g.ellipse(0,-6,8,15,0,0,TAU);g.fill();g.stroke();
    g.fillStyle='#bfefff';g.beginPath();g.ellipse(0,-14,5,6,0,0,TAU);g.fill()}),
  voideye:mk(38,38,g=>{g.strokeStyle='#5b2a9e';g.lineWidth=2.4;for(let k=0;k<6;k++){const a=k*TAU/6;g.beginPath();g.moveTo(Math.cos(a)*12,Math.sin(a)*12);g.quadraticCurveTo(Math.cos(a+.5)*17,Math.sin(a+.5)*17,Math.cos(a+.2)*18,Math.sin(a+.2)*18);g.stroke()}
    disc(g,0,0,13,'#3a1c6e','#12062a',1.5);disc(g,0,0,10,'#f1e6ff')})
};
function barrel(x,y,a,len,w,col){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;ctx.fillRect(0,-w/2,len,w);ctx.restore()}
function cap(x,y,r,col,edge){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=1.2;ctx.stroke()}}
