/* ================= audio: synthesized SFX, siren, voice, tiny sequencer ================= */
const AU={
  ctx:null,master:null,music:null,noise:null,lastShot:0,
  bgm:{on:false,step:0,next:0,root:45,bpm:132,boss:false},
  init(){
    if(this.ctx){this.resume();return}
    try{
      const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();
      this.master=this.ctx.createGain();this.master.gain.value=G.sound?.55:0;this.master.connect(this.ctx.destination);
      this.music=this.ctx.createGain();this.music.gain.value=.5;this.music.connect(this.master);
      const n=this.ctx.sampleRate,b=this.ctx.createBuffer(1,n,n),d=b.getChannelData(0);
      for(let i=0;i<n;i++)d[i]=Math.random()*2-1;this.noise=b;
    }catch(e){this.ctx=null}
  },
  resume(){if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})},
  setMute(){if(this.master)this.master.gain.value=G.sound?.55:0;if(!G.sound){try{speechSynthesis.cancel()}catch(e){}}},
  tone(f,d,type,v,f2,t0,dest){
    if(!this.ctx||G.mode==='title')return;const c=this.ctx,t=c.currentTime+(t0||0),o=c.createOscillator(),g=c.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
    g.gain.setValueAtTime(v||.1,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);
    o.connect(g);g.connect(dest||this.master);o.start(t);o.stop(t+d+.02);
  },
  nz(d,v,f,f2,t0,dest){
    if(!this.ctx||G.mode==='title')return;const c=this.ctx,t=c.currentTime+(t0||0),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();
    s.buffer=this.noise;s.loop=true;fl.type='lowpass';fl.frequency.setValueAtTime(f||1500,t);
    if(f2)fl.frequency.exponentialRampToValueAtTime(Math.max(40,f2),t+d);
    g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);
    s.connect(fl);fl.connect(g);g.connect(dest||this.master);s.start(t,Math.random()*.5);s.stop(t+d+.02);
  },
  shot(){if(!this.ctx)return;const t=this.ctx.currentTime;if(t-this.lastShot<.11)return;this.lastShot=t;this.tone(900,.05,'square',.022,420)},
  hit(){this.nz(.04,.05,3500)},
  boom(big){if(big){this.nz(1,.5,1100,70);this.tone(95,.9,'sine',.4,28)}else{this.nz(.22,.2,1700,220);this.tone(140,.18,'sine',.16,45)}},
  pick(){this.tone(660,.07,'square',.09);this.tone(990,.1,'square',.09,0,.07)},
  power(){[523,659,784,1047].forEach((f,i)=>this.tone(f,.1,'square',.09,0,i*.06))},
  extend(){[784,988,1175,1568,1175,1568].forEach((f,i)=>this.tone(f,.11,'triangle',.16,0,i*.08))},
  die(){this.nz(.9,.5,2200,90);this.tone(420,.8,'sawtooth',.2,38)},
  laser(){this.tone(1500,.55,'sawtooth',.07,180);this.nz(.5,.12,5000,600)},
  charge(){this.tone(180,.8,'sawtooth',.06,900)},
  bomb(i){
    if(i===0){this.nz(1.6,.6,2600,50);this.tone(210,1.4,'sawtooth',.25,26)}
    else if(i===1){this.nz(.35,.5,5000,300)}
    else if(i===2){this.tone(2200,.9,'sine',.14,260);this.nz(.7,.18,9000,2500)}
    else{this.tone(55,2.4,'sawtooth',.22,170);this.nz(2.2,.12,300,900)}
  },
  zap(){this.nz(.14,.3,6000,500);this.tone(1900,.1,'square',.05,200)},
  siren(){for(let i=0;i<6;i++){this.tone(560,.26,'sawtooth',.16,880,i*.52);this.tone(880,.26,'sawtooth',.16,560,i*.52+.26)}},
  say(txt){
    if(!G.sound)return;
    try{const u=new SpeechSynthesisUtterance(txt);u.lang='zh-TW';u.rate=1;u.pitch=.6;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}
  },
  play(stage,boss){
    const b=this.bgm;b.root=[45,43,40,41,38][stage];b.bpm=[132,136,142,148,154][stage]+(boss?18:0);b.boss=!!boss;b.step=0;
    b.next=this.ctx?this.ctx.currentTime+.08:0;b.on=true;
  },
  stop(){this.bgm.on=false},
  tick(){
    const b=this.bgm;if(!this.ctx||!b.on||this.ctx.state!=='running')return;
    const c=this.ctx,spb=60/b.bpm/4,mf=m=>440*Math.pow(2,(m-69)/12);
    if(b.next<c.currentTime-.3)b.next=c.currentTime+.05;
    while(b.next<c.currentTime+.18){
      const s=b.step,t0=b.next-c.currentTime,bar=(s>>4)&3,r=b.root+(b.boss?[0,1,0,-2]:[0,-4,-7,-2])[bar];
      if(s%2===0)this.tone(mf(r+((s%8===6)?12:0)),spb*1.7,'triangle',.2,0,t0,this.music);
      const arp=(b.boss?[0,12,6,12,7,12,3,12]:[0,7,12,15,12,7,3,7])[s%8];
      this.tone(mf(r+24+arp),spb*.85,'square',.034,0,t0,this.music);
      if(s%4===2)this.nz(.035,.07,9000,0,t0,this.music);
      if(s%8===0||(b.boss&&s%8===5))this.tone(150,.11,'sine',.3,42,t0,this.music);
      if(s%16===8)this.nz(.09,.12,2600,0,t0,this.music);
      b.next+=spb;b.step++;
    }
  }
};
