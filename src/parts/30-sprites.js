/* ================= sprites (pre-rendered) + scrolling backgrounds ================= */
const Q=3;
function mk(w,h,fn){
  const c=document.createElement('canvas');c.width=w*Q;c.height=h*Q;
  const g=c.getContext('2d');g.scale(Q,Q);g.translate(w/2,h/2);g.lineJoin='round';fn(g);
  const f=document.createElement('canvas');f.width=c.width;f.height=c.height;
  const fg=f.getContext('2d');fg.drawImage(c,0,0);fg.globalCompositeOperation='source-in';fg.fillStyle='#fff';fg.fillRect(0,0,f.width,f.height);
  return{c,f,w,h};
}
function spr(s,x,y,rot,sc,white){
  ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(sc&&sc!==1)ctx.scale(sc,sc);
  ctx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);
  if(white){ctx.globalAlpha=.7;ctx.drawImage(s.f,-s.w/2,-s.h/2,s.w,s.h);ctx.globalAlpha=1}
  ctx.restore();
}
function poly(g,p,fill,stroke,lw){
  g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();
  if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke()}
}
function sym(g,p,fill,stroke){poly(g,p,fill,stroke);poly(g,p.map((v,i)=>i%2?v:-v),fill,stroke)}
function disc(g,x,y,r,fill,stroke,lw){g.beginPath();g.arc(x,y,r,0,TAU);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke()}}
/* generic jet, nose pointing up (-y) */
function jet(g,o){
  const L=o.len/2,S=o.span/2,sw=o.sweep||0,bw=o.bw||4,e=o.edge||'#0b1430';
  sym(g,[0,-L*.15,S,sw+L*.2,S,sw+L*.48,0,L*.42],o.wing,e);
  if(o.tail)sym(g,[0,L*.5,S*o.tail,L*.88,S*o.tail,L*1,0,L*.86],o.wing,e);
  if(o.pods)sym(g,[S*.62,-L*.25,S*.62+2,-L*.25,S*.62+2,L*.5,S*.62,L*.5],o.body,e);
  poly(g,[0,-L,bw,-L*.42,bw,L*.72,bw*.5,L,-bw*.5,L,-bw,L*.72,-bw,-L*.42],o.body,e);
  g.fillStyle='rgba(255,255,255,.28)';g.fillRect(-bw*.3,-L*.05,bw*.6,L*.7);
  g.fillStyle=o.glass||'#bfefff';g.beginPath();g.ellipse(0,-L*.36,bw*.52,L*.2,0,0,TAU);g.fill();
  if(o.trim){g.fillStyle=o.trim;g.fillRect(-S*.8,sw*.8+L*.3,S*.36,2);g.fillRect(S*.44,sw*.8+L*.3,S*.36,2)}
}
const SPR={
  p:[
    mk(34,36,g=>jet(g,{len:30,span:26,sweep:3,bw:4,body:'#e9f4ff',wing:'#3d9fd8',tail:.5,glass:'#ffd45c',trim:'#ff4a5c'})),
    mk(40,38,g=>{sym(g,[3,-9,11,-6,11,-3,3,-4],'#62e2ff','#0b1430');jet(g,{len:32,span:32,sweep:4,bw:4.5,body:'#f4f9ff',wing:'#2f8fd0',tail:.55,glass:'#ffd45c',trim:'#ff4a5c',pods:1})}),
    mk(48,42,g=>{sym(g,[0,-2,22,10,22,15,0,9],'#1f5fa8','#0b1430');sym(g,[3,-11,13,-7,13,-4,3,-5],'#f4b740','#0b1430');
      jet(g,{len:36,span:36,sweep:3,bw:5,body:'#ffffff',wing:'#38a8e8',tail:.6,glass:'#ffd45c',trim:'#f4b740',pods:1})})
  ],
  wing:mk(16,18,g=>jet(g,{len:14,span:13,sweep:2,bw:2.4,body:'#e9f4ff',wing:'#f4b740',glass:'#62e2ff'})),
  grunt:mk(26,26,g=>jet(g,{len:22,span:22,sweep:2,bw:3.4,body:'#d8554a',wing:'#8a2c28',tail:.5,glass:'#ffe9a8'})),
  weaver:mk(30,26,g=>jet(g,{len:22,span:26,sweep:-4,bw:3.4,body:'#6cc25a',wing:'#2f7430',tail:.4,glass:'#eaffc8'})),
  diver:mk(22,32,g=>jet(g,{len:28,span:16,sweep:7,bw:3,body:'#b47ae6',wing:'#5f3192',tail:.7,glass:'#ffd6f4'})),
  sweeper:mk(32,28,g=>jet(g,{len:24,span:28,sweep:5,bw:3.6,body:'#f0a246',wing:'#9c5c18',tail:.45,glass:'#fff0c0',pods:1})),
  ace:mk(32,34,g=>jet(g,{len:30,span:28,sweep:6,bw:4,body:'#2b3050',wing:'#c8304c',tail:.6,glass:'#ff9ab0',trim:'#ffe45c',pods:1})),
  carrier:mk(50,36,g=>{sym(g,[0,-6,23,-2,23,4,0,6],'#b47a1c','#3a2606');
    poly(g,[0,-16,8,-9,8,10,4,16,-4,16,-8,10,-8,-9],'#f4b740','#3a2606');
    g.fillStyle='#fff3c4';g.fillRect(-3,-11,6,5);disc(g,-15,1,3,'#ff4a5c','#3a2606');disc(g,15,1,3,'#ff4a5c','#3a2606');
    g.fillStyle='#3a2606';g.font='900 9px sans-serif';g.textAlign='center';g.fillText('P',0,8)}),
  gunship:mk(46,40,g=>{poly(g,[-12,-18,12,-18,22,-4,18,16,-18,16,-22,-4],'#6f7fa0','#1a2238');
    poly(g,[-8,-12,8,-12,12,2,-12,2],'#8fa0c4','#1a2238');disc(g,-13,6,5,'#39445f','#1a2238');disc(g,13,6,5,'#39445f','#1a2238');
    g.fillStyle='#ff6a5c';g.fillRect(-14,6,2,9);g.fillRect(12,6,2,9);disc(g,0,-6,3.5,'#ffd45c','#1a2238')}),
  bomber:mk(84,56,g=>{sym(g,[0,-14,40,2,40,12,0,16],'#5d6b3c','#1b2210');sym(g,[0,14,16,24,16,27,0,24],'#5d6b3c','#1b2210');
    poly(g,[0,-26,7,-16,7,20,3,26,-3,26,-7,20,-7,-16],'#8a9a58','#1b2210');
    [-28,-16,16,28].forEach(x=>{g.fillStyle='#2c3418';g.fillRect(x-3,-4,6,14);disc(g,x,-4,3,'#c8d49a','#1b2210')});
    g.fillStyle='#d8f0ff';g.fillRect(-3,-18,6,7);g.fillStyle='#ff4a5c';g.fillRect(-36,6,8,2);g.fillRect(28,6,8,2)}),
  mine:mk(30,30,g=>{g.strokeStyle='#39445f';g.lineWidth=3;for(let i=0;i<8;i++){const a=i*TAU/8;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*13,Math.sin(a)*13);g.stroke()}
    disc(g,0,0,9,'#56617f','#141a2c',1.5);disc(g,0,0,4,'#ff4a5c');disc(g,-1.5,-1.5,1.5,'#ffd0d4')}),
  spinner:mk(40,40,g=>{for(let i=0;i<4;i++){g.save();g.rotate(i*TAU/4);poly(g,[-3,-4,3,-4,5,-18,-5,-18],'#3fb8a8','#06241f');g.restore()}
    disc(g,0,0,10,'#1e6e66','#06241f',1.5);disc(g,0,0,5,'#ffe45c','#06241f')})
};
const ESPR={grunt:SPR.grunt,weaver:SPR.weaver,diver:SPR.diver,sweeper:SPR.sweeper,ace:SPR.ace,carrier:SPR.carrier,gunship:SPR.gunship,bomber:SPR.bomber,mine:SPR.mine,spinner:SPR.spinner};

/* ---- backgrounds: deterministic scatter per stage, wrapped on a 1000px tile ---- */
const TH=1000;
function seeded(s){return()=>{s=(s*1664525+1013904223)|0;return((s>>>8)&0xffff)/65536}}
const BG=STAGES.map((_,i)=>{const r=seeded(77+i*913),a=[];
  const add=(n,k,l,s0,s1)=>{for(let j=0;j<n;j++)a.push({x:r()*W,y:r()*TH,s:s0+r()*(s1-s0),k,l,q:r()})};
  if(i===0){add(46,'wave',.5,.5,1.6);add(5,'isle',.5,24,48);add(7,'cloud',1.3,26,46)}
  if(i===1){add(16,'dune',.5,50,120);add(12,'rock',.5,5,13);add(26,'streak',.9,20,60)}
  if(i===2){add(14,'dcloud',.35,40,80);add(10,'cloud',1.1,30,60)}
  if(i===3){add(12,'plate',.5,30,70);add(9,'crack',.5,40,90);add(30,'ember',1.5,1,2.4)}
  if(i===4){add(70,'star',.2,.5,1.2);add(36,'star',.7,.8,1.8);add(3,'neb',.12,90,150);add(1,'planet',.16,60,60)}
  return a});
let scroll=0;
function drawBG(si){
  const S=STAGES[si],gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,S.sky[0]);gr.addColorStop(1,S.sky[1]);
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  if(si===8)drawRoads();
  for(const it of BG[si]){
    const y=((it.y+scroll*it.l)%TH+TH)%TH-120,x=it.x,s=it.s;if(y>H+130)continue;
    switch(it.k){
      case'wave':ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x,y,s*12,1.4);break;
      case'isle':ctx.fillStyle='#e6d08a';ctx.beginPath();ctx.ellipse(x,y,s,s*.7,it.q*3,0,TAU);ctx.fill();
        ctx.fillStyle='#3f9a52';ctx.beginPath();ctx.ellipse(x,y,s*.8,s*.52,it.q*3,0,TAU);ctx.fill();
        ctx.fillStyle='#2c7a40';ctx.beginPath();ctx.ellipse(x-s*.15,y-s*.08,s*.42,s*.28,it.q*3,0,TAU);ctx.fill();break;
      case'cloud':ctx.fillStyle='rgba(255,255,255,.16)';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(x+(k-1.5)*s*.5,y+((k*7)%3-1)*s*.14,s*(.4+((k*13)%5)*.06),0,TAU);ctx.fill()}break;
      case'dcloud':ctx.fillStyle='rgba(10,12,34,.42)';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(x+(k-2)*s*.45,y+((k*5)%3-1)*s*.18,s*(.42+((k*11)%4)*.07),0,TAU);ctx.fill()}break;
      case'dune':ctx.strokeStyle='rgba(90,48,14,.38)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y,s,s*.3,-.25,Math.PI,TAU);ctx.stroke();break;
      case'rock':ctx.fillStyle='#5c3a1a';ctx.beginPath();ctx.ellipse(x,y,s,s*.7,it.q*3,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,220,160,.25)';ctx.fillRect(x-s*.4,y-s*.4,s*.6,2);break;
      case'streak':ctx.fillStyle='rgba(255,236,190,.16)';ctx.fillRect(x,y,2,s);break;
      case'plate':ctx.fillStyle='rgba(8,4,4,.6)';ctx.beginPath();ctx.ellipse(x,y,s,s*.62,it.q*3,0,TAU);ctx.fill();break;
      case'crack':ctx.strokeStyle='rgba(255,120,40,.55)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*.3*(it.q-.5),y+s*.35);ctx.lineTo(x+s*.5*(.5-it.q),y+s*.7);ctx.lineTo(x+s*.2,y+s);ctx.stroke();break;
      case'ember':ctx.fillStyle='rgba(255,170,70,.75)';ctx.fillRect(x+Math.sin(scroll*.02+it.q*9)*8,H-((y+H)%H),s,s);break;
      case'star':ctx.fillStyle=it.q>.8?'#ffe9b0':'#dfe6ff';ctx.globalAlpha=.4+it.q*.6;ctx.fillRect(x,y,s,s);ctx.globalAlpha=1;break;
      case'neb':{const n=ctx.createRadialGradient(x,y,0,x,y,s);n.addColorStop(0,it.q>.5?'rgba(150,90,255,.2)':'rgba(60,140,255,.18)');n.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=n;ctx.fillRect(x-s,y-s,s*2,s*2);break}
      case'planet':{const n=ctx.createRadialGradient(x-s*.3,y-s*.3,s*.1,x,y,s);n.addColorStop(0,'#c9a2ff');n.addColorStop(.7,'#4a2a8a');n.addColorStop(1,'#1a0c3a');ctx.fillStyle=n;ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();
        ctx.strokeStyle='rgba(220,200,255,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,s*1.6,s*.35,-.4,0,TAU);ctx.stroke();break}
      default:drawBG2(it,x,y,s);
    }
  }
}
