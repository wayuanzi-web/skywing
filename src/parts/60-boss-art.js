/* ================= boss sprites + beam hazards ================= */
const BSPR=[
  /* 1 鐵翼轟炸王 */
  mk(170,96,g=>{
    sym(g,[0,-22,80,6,80,22,0,26],'#62708c','#141a2c');sym(g,[0,-6,60,10,60,16,0,14],'#7f8fb0');
    sym(g,[0,26,26,42,26,46,0,40],'#62708c','#141a2c');
    poly(g,[0,-44,12,-28,12,32,6,44,-6,44,-12,32,-12,-28],'#9aa8c8','#141a2c',1.5);
    [-62,-44,-26,26,44,62].forEach(x=>{g.fillStyle='#2a3048';g.fillRect(x-4,-2,8,22);disc(g,x,-2,4,'#c8d0e8','#141a2c')});
    g.fillStyle='#ff4a5c';g.fillRect(-6,-34,12,10);disc(g,-44,22,5,'#39445f','#141a2c');disc(g,44,22,5,'#39445f','#141a2c');
    g.fillStyle='#f4b740';g.fillRect(-74,12,16,3);g.fillRect(58,12,16,3)}),
  /* 2 沙暴毒蠍 */
  mk(150,110,g=>{
    sym(g,[14,6,40,-2,58,14,60,34,50,48,44,34,48,20,36,12,14,16],'#b8863c','#3a2206',1.5);
    sym(g,[50,48,56,40,62,50,56,54],'#ff4a5c','#3a2206');
    for(let i=0;i<3;i++)sym(g,[16,-8-i*9,40,-16-i*10,42,-12-i*10,16,-3-i*9],'#8a5f22','#3a2206');
    poly(g,[-6,-20,6,-20,5,-38,8,-48,0,-54,-8,-48,-5,-38],'#c89a4c','#3a2206',1.5);disc(g,0,-50,4,'#b47aff','#3a2206');
    poly(g,[-18,-22,18,-22,24,0,18,26,0,34,-18,26,-24,0],'#d8a858','#3a2206',1.5);
    poly(g,[-12,-12,12,-12,15,2,0,10,-15,2],'#8a5f22','#3a2206');
    disc(g,-8,16,3.5,'#ff4a5c','#3a2206');disc(g,8,16,3.5,'#ff4a5c','#3a2206')}),
  /* 3 雷雲母艦 */
  mk(180,90,g=>{
    g.fillStyle='#2e3458';g.strokeStyle='#0c0f24';g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,86,30,0,0,TAU);g.fill();g.stroke();
    g.fillStyle='#474e80';g.beginPath();g.ellipse(0,-5,66,18,0,0,TAU);g.fill();
    g.fillStyle='#6a72b0';g.beginPath();g.ellipse(0,-10,34,10,0,0,TAU);g.fill();
    [-64,-32,0,32,64].forEach(x=>{g.fillStyle='#ffe45c';g.fillRect(x-2,18,4,18);disc(g,x,38,4,'#fff6c0','#8a7a10')});
    [-50,-25,25,50].forEach(x=>disc(g,x,4,4,'#62e2ff','#0c0f24'));
    poly(g,[-10,-30,10,-30,6,-18,-6,-18],'#8f97d0','#0c0f24')}),
  /* 4 熔核機甲 */
  mk(140,120,g=>{
    sym(g,[26,-30,56,-44,64,-10,44,4,30,-6],'#4a2a22','#160604',1.5);sym(g,[30,10,58,12,62,44,40,52,28,34],'#4a2a22','#160604',1.5);
    sym(g,[46,-26,54,-34,58,-14,48,-6],'#ff6a2a');sym(g,[40,20,54,22,54,40,42,42],'#ff6a2a');
    poly(g,[0,-46,34,-24,34,24,0,46,-34,24,-34,-24],'#6a3a2c','#160604',2);
    poly(g,[0,-32,24,-16,24,16,0,32,-24,16,-24,-16],'#2a1410','#160604');
    disc(g,0,0,16,'#ff8a3c','#160604',2);disc(g,0,0,9,'#ffe08a');
    g.fillStyle='#ffb060';g.fillRect(-30,-2,8,4);g.fillRect(22,-2,8,4)}),
  /* 5 大魔王・終焉星核 */
  mk(170,130,g=>{
    for(let i=0;i<8;i++){g.save();g.rotate(i*TAU/8+TAU/16);poly(g,[-9,-30,9,-30,0,-(i%2?58:76)],'#3a1c6e','#0a0420',1.5);g.restore()}
    sym(g,[30,-10,78,-22,82,0,78,22,30,10],'#251048','#0a0420',1.5);sym(g,[52,-10,70,-14,72,0,70,14,52,10],'#b98cff');
    disc(g,0,0,40,'#4a2496','#0a0420',2);disc(g,0,0,30,'#1a0a3a','#0a0420');
    g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,22,13,0,0,TAU);g.fill();disc(g,0,0,10,'#ff4a5c','#0a0420',1.5);disc(g,0,0,4,'#0a0420');
    for(let i=0;i<6;i++){const a=i*TAU/6;disc(g,Math.cos(a)*35,Math.sin(a)*35,3,'#ffe45c','#0a0420')}})
];
const BDEF=[{hp:1300,hw:64,hh:26,ty:112},{hp:1900,hw:50,hh:34,ty:118},{hp:2500,hw:72,hh:24,ty:108},{hp:3000,hw:46,hh:42,ty:124},{hp:4400,hw:56,hh:44,ty:126}];

/* beams: telegraph first (warn), then burn (fire). Origin may ride the boss. */
function beam(o){hazards.push(Object.assign({x:0,y:0,a:Math.PI/2,w:18,len:900,warn:.9,fire:.7,t:0,rotv:0,ride:false,src:null,ox:0,oy:0,col:'#ffe45c',snd:false},o))}
function updHazards(dt){
  if(G.freeze>0)return;const B=G.boss;
  for(let i=hazards.length-1;i>=0;i--){
    const h=hazards[i];h.t+=dt;
    if(h.ride){if(!B||B.dying){hazards.splice(i,1);continue}h.x=B.x+h.ox;h.y=B.y+h.oy}
    if(h.src){if(h.src.gone||h.src.dead){hazards.splice(i,1);continue}h.x=h.src.x+h.ox;h.y=h.src.y+h.oy}  /* follows the enemy that fires it; dies with it */
    if(h.t>=h.warn){
      h.a+=h.rotv*dt;
      if(!h.snd){h.snd=true;AU.laser();G.shake=Math.max(G.shake,.15)}
      if(P.alive&&P.inv<=0){const px=P.x-h.x,py=P.y-h.y,c=Math.cos(h.a),s=Math.sin(h.a),al=px*c+py*s,pe=Math.abs(py*c-px*s);
        if(al>0&&al<h.len&&pe<h.w*.42+P.r)hitPlayer()}
    }
    if(h.t>=h.warn+h.fire)hazards.splice(i,1);
  }
}
function drawHazards(){
  for(const h of hazards){
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a);
    if(h.rotv){ /* show the zone a sweeping beam is about to cross */
      const rem=h.rotv*(h.fire-Math.max(0,h.t-h.warn));ctx.globalAlpha=.14;ctx.fillStyle=h.col;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,h.len,0,rem,rem<0);ctx.closePath();ctx.fill();
    }
    if(h.t<h.warn){
      const k=h.t/h.warn;ctx.globalAlpha=.25+.35*Math.abs(Math.sin(h.t*18));ctx.fillStyle=h.col;ctx.fillRect(0,-h.w*.5*k,h.len,h.w*k);
      ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.fillRect(0,-.75,h.len,1.5);
    }else{
      const k=Math.min(1,(h.warn+h.fire-h.t)*6),w=h.w*k*(1+Math.sin(h.t*40)*.08);
      ctx.globalAlpha=.5;ctx.fillStyle=h.col;ctx.fillRect(0,-w*.8,h.len,w*1.6);
      ctx.globalAlpha=1;ctx.fillStyle=h.col;ctx.fillRect(0,-w*.5,h.len,w);ctx.fillStyle='#fff';ctx.fillRect(0,-w*.26,h.len,w*.52);
    }
    ctx.restore();
  }
  ctx.globalAlpha=1;
}
