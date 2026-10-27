(function(){
var total=document.getElementById('total-members');
var online=document.getElementById('online-members');
function fmt(n){return Number.isFinite(n)?n.toLocaleString('en-US'):'—'}
function update(){
  if(document.hidden)return;
  var ctrl=new AbortController();
  var t=setTimeout(function(){ctrl.abort()},8000);
  fetch('https://discord.com/api/v9/invites/ametium?with_counts=true',{signal:ctrl.signal})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
    .then(function(d){total.textContent=fmt(d.approximate_member_count);online.textContent=fmt(d.approximate_presence_count)})
    .catch(function(){if(total.textContent==='…')total.textContent='—';if(online.textContent==='…')online.textContent='—'})
    .finally(function(){clearTimeout(t)});
}
update();
setInterval(update,60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)update()});

/* ===== Fondo negro con bolitas flotando ===== */
var canvas=document.getElementById('stars');
var ctx=canvas.getContext('2d');
var stars=[];
var lastW=0;
function resize(){
  var w=window.innerWidth,h=window.innerHeight;
  if(w===lastW&&stars.length){
    if(h>canvas.height)canvas.height=h;
    return;
  }
  lastW=w;
  canvas.width=w;
  canvas.height=h;
  var n=Math.floor(w*h/(w<=600?3500:9000));
  stars=[];
  for(var i=0;i<n;i++){
    stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.2,c:(Math.random()<.32?'178,92,245':'255,255,255'),a:Math.random()*.6+.2,s:Math.random()*.02+.004,d:Math.random()*Math.PI*2,v:Math.random()*.4+.1});
  }
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(var i=0;i<stars.length;i++){
    var s=stars[i];
    s.d+=s.s;
    s.y-=s.v;
    if(s.y<-2){s.y=canvas.height+2;s.x=Math.random()*canvas.width}
    var o=s.a*(.6+.4*Math.sin(s.d));
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle='rgba('+s.c+','+o.toFixed(3)+')';
    ctx.fill();
  }
  drawMeteors();
  requestAnimationFrame(draw);
}

/* estrellas fugaces */
var meteors=[],nextMeteor=performance.now()+1500;
function spawnMeteor(){
  var w=canvas.width;
  meteors.push({x:Math.random()*w*.9+w*.1,y:-10,vx:-(5+Math.random()*4),vy:3+Math.random()*3,life:0,max:70+Math.random()*30});
}
function drawMeteors(){
  var now=performance.now();
  if(now>nextMeteor&&!document.hidden){spawnMeteor();nextMeteor=now+3500+Math.random()*5500}
  for(var i=meteors.length-1;i>=0;i--){
    var m=meteors[i];
    m.x+=m.vx;m.y+=m.vy;m.life++;
    var f=1-m.life/m.max;
    if(f<=0||m.y>canvas.height+20){meteors.splice(i,1);continue}
    var len=14,tx=m.x-m.vx*len,ty=m.y-m.vy*len;
    var g=ctx.createLinearGradient(m.x,m.y,tx,ty);
    g.addColorStop(0,'rgba(220,180,255,'+(.9*f).toFixed(3)+')');
    g.addColorStop(1,'rgba(178,92,245,0)');
    ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(tx,ty);ctx.stroke();
  }
}
window.addEventListener('resize',resize);
resize();
draw();
})();
