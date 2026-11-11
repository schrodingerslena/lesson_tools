
const $=id=>document.getElementById(id),names=['','','','Triangle','Quadrilateral','Pentagon','Hexagon','Heptagon','Octagon'];
let s={tab:'polygon',n:4,type:'equal',mode:'explore',guided:false,task:0,cut:50,unfold:0,h:3,side:2,angle:65,yaw:.55,pitch:.48,measure:false,marks:true,reveal:false};
function saveDraft(){}
function base(){let n=s.n;if(s.tab==='polygon'&&s.type==='equal'&&n===4){let a=s.angle*Math.PI/180;return [[0,0],[1,0],[1+Math.cos(a),Math.sin(a)],[Math.cos(a),Math.sin(a)]].map(([x,y])=>[(x-(1+Math.cos(a))/2)*s.side,(y-Math.sin(a)/2)*s.side])}let r=s.side/(2*Math.sin(Math.PI/n));return Array.from({length:n},(_,i)=>{let a=i*2*Math.PI/n-Math.PI/2;let k=s.tab==='polygon'&&s.type==='general'?(i%2?.72:1):1;return [r*Math.cos(a)*k,r*Math.sin(a)*k]})}
function area(p){return Math.abs(p.reduce((a,v,i)=>a+v[0]*p[(i+1)%p.length][1]-v[1]*p[(i+1)%p.length][0],0))/2}function poly(points,fill,stroke='#397b78',extra=''){return `<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" ${extra}/>`}function line(a,b,stroke='#327c76',extra=''){return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${stroke}" stroke-width="1.6" ${extra}/>`}

let moveAxis=[0,-1];
const cutter={tilt:Math.PI/5,turn:.4,offset:0};
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
function crossSection(base,height){
  const {tilt,turn,offset}=cutter;
  const c=Math.cos(turn),d=Math.sin(turn),t=Math.sin(tilt),k=Math.cos(tilt);
  const normal=[t*c,t*d,k],u=[k*c,k*d,-t],v=[-d,c,0];
  const lower=base.map(p=>[...p,-height/2]),upper=base.map(p=>[...p,height/2]);
  const projections=[...lower,...upper].map(p=>dot(p,normal));
  const low=Math.min(...projections),high=Math.max(...projections);
  const distance=low+(high-low)*(.5+.499*offset);
  const points=[];
  function intersect(a,b){
    const x=dot(a,normal)-distance,y=dot(b,normal)-distance;
    const f=Math.abs(x)<1e-9?0:Math.abs(y)<1e-9?1:x*y<0?x/(x-y):null;
    if(f===null)return;
    const p=a.map((value,i)=>value+f*(b[i]-value));
    if(!points.some(q=>Math.hypot(...q.map((value,i)=>value-p[i]))<1e-8))points.push(p);
  }
  for(let i=0;i<base.length;i++){
    const next=(i+1)%base.length;
    intersect(lower[i],lower[next]);intersect(upper[i],upper[next]);intersect(lower[i],upper[i]);
  }
  const center=normal.map((x,i)=>points.length?points.reduce((sum,p)=>sum+p[i],0)/points.length:x*distance);
  const local=p=>[dot(p,u)-dot(center,u),dot(p,v)-dot(center,v)];
  points.sort((a,b)=>Math.atan2(local(a)[1],local(a)[0])-Math.atan2(local(b)[1],local(b)[0]));
  const size=Math.min(2.1,Math.max(.8,...points.map(p=>Math.hypot(...local(p))))+.35);
  const at=(x,y)=>center.map((z,i)=>z+x*u[i]+y*v[i]);
  return {points,flat:points.map(local),plane:[at(-size,-size),at(size,-size),at(size,size),at(-size,size)],handle:at(size,size),center,normal};
}
function draw(){let p=base(),A=area(p),n=s.n;let svg='';if(s.tab==='polygon'){let scale=145/Math.max(...p.map(v=>Math.hypot(...v))),q=p.map(([x,y])=>[360+x*scale,215+y*scale]);svg=poly(q,'#dceee7');q.forEach((v,i)=>{let w=q[(i+1)%n];if(s.marks&&s.type!=='general'){let m=[(v[0]+w[0])/2,(v[1]+w[1])/2],dx=w[0]-v[0],dy=w[1]-v[1],l=Math.hypot(dx,dy);svg+=line([m[0]+dy/l*6,m[1]-dx/l*6],[m[0]-dy/l*6,m[1]+dx/l*6])}svg+=`<circle cx="${v[0]}" cy="${v[1]}" r="4" fill="#246b60"/>`;if(s.measure)svg+=`<text x="${(v[0]+w[0])/2}" y="${(v[1]+w[1])/2-13}" text-anchor="middle" font-size="13">${Math.hypot(p[i][0]-p[(i+1)%n][0],p[i][1]-p[(i+1)%n][1]).toFixed(2)}</text>`});$('caption').textContent=names[s.n]+' · '+s.n+' sides'}
else{let rad=Math.max(...p.map(v=>Math.hypot(...v))),t=s.mode==='net'?s.unfold/100:0;let edge=s.side,per=n*edge;let scale=Math.min(65,520/(per+rad*2),260/(s.h+rad*4));if(t<.5)scale=53;let yaw=s.yaw*(1-t),pitch=s.pitch*(1-t),proj=([x,y,z])=>{let a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [360+a*scale,220+(b*Math.cos(pitch)-z*Math.sin(pitch))*scale]},faces=[];
// Side strip: flatten each successive hinge continuously; retain actual edge lengths.
let start=[p[0][0],p[0][1]],v0=[p[1][0]-p[0][0],p[1][1]-p[0][1]],a0=Math.atan2(v0[1],v0[0]),strip=[[...start]];for(let i=0;i<n;i++){let ang=a0+i*2*Math.PI/n*(1-t);strip.push([strip[i][0]+edge*Math.cos(ang),strip[i][1]+edge*Math.sin(ang)])}let center=[strip.reduce((a,v)=>a+v[0],0)/(n+1),strip.reduce((a,v)=>a+v[1],0)/(n+1)];let transform=([x,y,z])=>{x-=center[0]*t;y-=center[1]*t;let xx=x*Math.cos(-a0*t)-y*Math.sin(-a0*t),yy=x*Math.sin(-a0*t)+y*Math.cos(-a0*t);let theta=t*Math.PI/2;return [xx,yy*Math.cos(theta)-z*Math.sin(theta),yy*Math.sin(theta)+z*Math.cos(theta)]};let face=(vs,fill)=>{let w=vs.map(transform);faces.push({w,fill,depth:w.reduce((a,v)=>a+v[1]*Math.sin(yaw)+v[0]*Math.cos(yaw)*.1,0)/w.length})};for(let i=0;i<n;i++)face([[...strip[i],-s.h/2],[...strip[i+1],-s.h/2],[...strip[i+1],s.h/2],[...strip[i],s.h/2]],i%2?'#e0e9e4b8':'#c9ded9b8');
// Bases hinge at first strip edge. At full unfolding they sit outside opposite strip edges.
let ex=v0[0]/edge,ey=v0[1]/edge,hinge=t*Math.PI/2;for(let top of [-1,1])face(p.map(([x,y])=>{let dx=x-p[0][0],dy=y-p[0][1],along=dx*ex+dy*ey,inside=-dx*ey+dy*ex;return [p[0][0]+along*ex-inside*Math.cos(hinge)*ey,p[0][1]+along*ey+inside*Math.cos(hinge)*ex,top*s.h/2+top*inside*Math.sin(hinge)]}),'#a8d5e6c9');faces.sort((a,b)=>a.depth-b.depth);for(let f of faces)svg+=poly(f.w.map(proj),f.fill);if(s.mode==='cut'){
  const cut=crossSection(p,s.h);
  const handle=proj(cut.handle), center=proj(cut.center);
  const tip=proj(cut.center.map((x,i)=>x+cut.normal[i]));
  const direction=tip.map((x,i)=>x-center[i]);
  const length=Math.hypot(...direction);
  moveAxis=length>5?direction.map(x=>x/length):[0,-1];
  svg+=poly(cut.plane.map(proj),'#f5d6a644','#b8751e','data-drag="move" style="cursor:grab"');
  svg+=poly(cut.points.map(proj),'#edaf5599','#c27e23','data-drag="move" style="cursor:grab"');
  svg+=`<circle cx="${center[0]}" cy="${center[1]}" r="14" fill="#b8751e" data-drag="move" style="cursor:grab"/><circle cx="${handle[0]}" cy="${handle[1]}" r="14" fill="#fff" stroke="#b8751e" stroke-width="3" data-drag="tilt" style="cursor:grab"/>`;
  A=area(cut.flat);
  const preview=$('thumb');
  const radius=Math.max(.1,...cut.flat.map(p=>Math.hypot(...p)))*1.25;
  preview.setAttribute('viewBox',`${-radius} ${-radius} ${2*radius} ${2*radius}`);
  preview.innerHTML=poly(cut.flat,'#f5d6a6','#c27e23','vector-effect="non-scaling-stroke"');
} $('caption').textContent=s.mode==='net'?'Move the slider from solid to net. Drag the model to rotate.':'Drag to rotate the prism · blue bases · grey side faces'+(s.mode==='cut'?' · orange cross-section':'');}
$('scene').innerHTML=svg;if($('area'))$('area').textContent=A.toFixed(2)+' units²';}
function render(){$('polygons').classList.toggle('active',s.tab==='polygon');$('prisms').classList.toggle('active',s.tab==='prism');$('sides').innerHTML=`<span class="muted" style="padding:10px">Base sides</span>`+[3,4,5,6,7,8].map(n=>`<button class="${s.n===n?'active':''}" data-n="${n}">${n}</button>`).join('');document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{saveDraft();s.n=+b.dataset.n;render()});
$('controls').innerHTML=`<h2>${names[s.n]}${s.tab==='prism'?' prism':''}</h2>`+(s.tab==='polygon'?`<label id="typeLabel">Polygon type</label><div class="type-options" role="group" aria-labelledby="typeLabel">${[['general','General'],['equal','Equal sides'],['regular','Regular']].map(([value,label])=>`<button type="button" data-type="${value}" class="${s.type===value?'active':''}" aria-pressed="${s.type===value}">${label}</button>`).join('')}</div><label><input id="marks" type="checkbox" ${s.marks?'checked':''}> Equal-side marks</label>`:`<div class="row">${['explore','cut','net'].map(m=>`<button data-mode="${m}" class="${s.mode===m?'active':''}">${{explore:'Explore',cut:'Slice',net:'Unfold'}[m]}</button>`).join('')}</div><label>Base: regular ${names[s.n].toLowerCase()}</label><label>Side length: <span id="sideVal">${s.side}</span></label><input id="side" aria-label="Base side length" type="range" min="1" max="3" step="0.1" value="${s.side}"><label>Prism height: <span id="hVal">${s.h}</span></label><input id="height" aria-label="Prism height" type="range" min="1" max="5" step="0.1" value="${s.h}">${s.mode==='cut'?`<p>Drag the orange plane to move it. Drag the white handle to tilt or turn it.</p><button id="resetCut">Reset cutter</button><svg id="thumb" class="sectionThumb" viewBox="-3 -3 6 6" aria-label="2D cross-section"></svg><p>Cross-section area: <strong id="area"></strong></p>`:''}${s.mode==='net'?`<label>Unfold: <span id="unfoldVal">${s.unfold}</span>%</label><input id="unfold" aria-label="Unfold prism" type="range" min="0" max="100" value="${s.unfold}">`:''}<button id="reset">Reset view</button>`)+`<label><input id="measure" type="checkbox" ${s.measure?'checked':''}> Show measurements</label>`;
document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{saveDraft();s.type=b.dataset.type;render();document.querySelector(`[data-type="${s.type}"]`).focus()});if($('angle'))$('angle').oninput=e=>{s.angle=+e.target.value;$('ang').textContent=s.angle;draw()};if($('marks'))$('marks').onchange=e=>{s.marks=e.target.checked;draw()};$('measure').onchange=e=>{s.measure=e.target.checked;draw()};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{saveDraft();s.mode=b.dataset.mode;render()});for(let [id,key,out] of [['side','side','sideVal'],['height','h','hVal'],['unfold','unfold','unfoldVal']])if($(id))$(id).oninput=e=>{s[key]=+e.target.value;$(out).textContent=s[key];draw()};if($('resetCut'))$('resetCut').onclick=()=>{Object.assign(cutter,{tilt:Math.PI/5,turn:.4,offset:0});draw()};if($('reset'))$('reset').onclick=()=>{s.yaw=.55;s.pitch=.48;draw()};draw()}
$('polygons').onclick=()=>{saveDraft();s.tab='polygon';s.guided=false;render()};$('prisms').onclick=()=>{saveDraft();s.tab='prism';s.guided=false;render()};
let drag=null;
const scene=$('scene');
scene.onpointerdown=e=>{
  if(s.tab!=='prism'||drag)return;
  drag={axis:moveAxis,x:e.clientX,y:e.clientY,kind:e.target.dataset.drag,id:e.pointerId};
  scene.setPointerCapture(e.pointerId);
};
scene.onpointermove=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(drag.kind==='move'){
    cutter.offset=Math.max(-1,Math.min(1,cutter.offset+dot([dx,dy],drag.axis)*.009));
  }else if(drag.kind==='tilt'){
    cutter.turn+=dx*.016;
    cutter.tilt=Math.max(0,Math.min(Math.PI,cutter.tilt+dy*.016));
  }else{
    s.yaw+=dx*.01;
    s.pitch=Math.max(.2,Math.min(1.5,s.pitch+dy*.008));
  }
  drag.x=e.clientX;drag.y=e.clientY;
  draw();
};
scene.onpointerup=scene.onpointercancel=scene.onlostpointercapture=e=>{
  if(drag?.id===e.pointerId)drag=null;
};
render();
