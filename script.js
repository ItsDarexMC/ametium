(function(){
'use strict';

var year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();

/* ===== Discord member counts ===== */
var stats=document.getElementById('stats');
var total=document.getElementById('total-members');
var online=document.getElementById('online-members');
var loaded=false,busy=false,lastFetch=0;
function fmt(n){return Number.isFinite(n)?n.toLocaleString('en-US'):'—'}
function update(){
  var now=Date.now();
  if(document.hidden||busy||now-lastFetch<30000)return;
  busy=true;lastFetch=now;
  var ctrl=typeof AbortController==='function'?new AbortController():null;
  var t=ctrl&&setTimeout(function(){ctrl.abort()},8000);
  fetch('https://discord.com/api/v9/invites/ametium?with_counts=true',ctrl?{signal:ctrl.signal}:{})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
    .then(function(d){
      if(!Number.isFinite(d.approximate_member_count))throw new Error('bad data');
      total.textContent=fmt(d.approximate_member_count);
      online.textContent=fmt(d.approximate_presence_count);
      loaded=true;stats.hidden=false;
    })
    .catch(function(){if(!loaded)stats.hidden=true})
    .then(function(){clearTimeout(t);busy=false});
}
if(stats&&total&&online){
  update();
  setInterval(update,60000);
  document.addEventListener('visibilitychange',update);
}

/* ===== Fondo negro con bolitas flotando ===== */
var canvas=document.getElementById('stars');
var ctx=canvas&&canvas.getContext&&canvas.getContext('2d');
if(!ctx)return;
var motion=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var COLORS=['255,255,255','178,92,245'];
var stars=[],meteors=[],W=0,H=0,dpr=1,raf=0,last=0,nextMeteor=0,resizeTimer=0;

function resize(){
  // El canvas mide 100lvh en CSS: no cambia al mostrarse/ocultarse la barra del navegador móvil
  var w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;
  var r=Math.min(window.devicePixelRatio||1,2);
  if(w===W&&h===H&&r===dpr&&stars.length)return;
  var regen=w!==W||!stars.length;
  W=w;H=h;dpr=r;
  canvas.width=Math.round(w*dpr);
  canvas.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(regen){
    var n=Math.min(Math.floor(w*h/(w<=600?3500:9000)),450);
    stars=[];
    for(var i=0;i<n;i++){
      stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.2,c:Math.random()<.32?1:0,a:Math.random()*.6+.2,s:Math.random()*.02+.004,d:Math.random()*Math.PI*2,v:Math.random()*.4+.1});
    }
  }else{
    for(var j=0;j<stars.length;j++)if(stars[j].y>h)stars[j].y=Math.random()*h;
  }
  if(motion.matches)render(0);
}

function render(k){
  ctx.clearRect(0,0,W,H);
  for(var c=0;c<COLORS.length;c++){
    ctx.fillStyle='rgb('+COLORS[c]+')';
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      if(c===0){
        s.d+=s.s*k;
        s.y-=s.v*k;
        if(s.y<-2){s.y=H+2;s.x=Math.random()*W}
      }
      if(s.c!==c)continue;
      ctx.globalAlpha=s.a*(.6+.4*Math.sin(s.d));
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,6.2832);
      ctx.fill();
    }
  }
  ctx.globalAlpha=1;
  if(k)drawMeteors(k);
}

/* estrellas fugaces */
function spawnMeteor(){
  meteors.push({x:Math.random()*W*.9+W*.1,y:-10,vx:-(5+Math.random()*4),vy:3+Math.random()*3,life:0,max:70+Math.random()*30});
}
function drawMeteors(k){
  var now=performance.now();
  if(now>nextMeteor){spawnMeteor();nextMeteor=now+3500+Math.random()*5500}
  ctx.lineWidth=1.6;ctx.lineCap='round';
  for(var i=meteors.length-1;i>=0;i--){
    var m=meteors[i];
    m.x+=m.vx*k;m.y+=m.vy*k;m.life+=k;
    var f=1-m.life/m.max;
    if(f<=0||m.y>H+20||m.x<-200){meteors.splice(i,1);continue}
    var tx=m.x-m.vx*14,ty=m.y-m.vy*14;
    var g=ctx.createLinearGradient(m.x,m.y,tx,ty);
    g.addColorStop(0,'rgba(220,180,255,'+(.9*f).toFixed(3)+')');
    g.addColorStop(1,'rgba(178,92,245,0)');
    ctx.strokeStyle=g;
    ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(tx,ty);ctx.stroke();
  }
}

function frame(t){
  // k = fotogramas de 60 Hz transcurridos: misma velocidad en pantallas de 60/120/144 Hz
  var k=last?Math.min((t-last)/16.667,4):1;
  last=t;
  render(k);
  raf=requestAnimationFrame(frame);
}
function start(){
  cancelAnimationFrame(raf);raf=0;last=0;meteors=[];
  if(motion.matches||document.hidden){render(0);return}
  nextMeteor=performance.now()+1500;
  raf=requestAnimationFrame(frame);
}

window.addEventListener('resize',function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,150)});
document.addEventListener('visibilitychange',start);
if(motion.addEventListener)motion.addEventListener('change',start);
else if(motion.addListener)motion.addListener(start);
resize();
start();
})();
