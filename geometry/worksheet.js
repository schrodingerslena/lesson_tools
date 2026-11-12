'use strict';
const el = id => document.getElementById(id);
const model = el('model');
const topics = [
  ['Q1–2 · Polyhedra','Q3–6 · Prism types','Q7–8 · Name the faces'],
  ['Q1–3 · Cross sections','Q4–6 · Uniform sections','Q7–8 · Blank paper','Q9–10 · Isometric','Q11–12 · Oblique']
];
const state = {chapter:0, topic:0, shape:0, yaw:.6, pitch:.56, step:0, selected:-1};
const resetCut = () => Object.assign(state,{offset:0, tiltX:0, tiltY:0, parallel:true, reveal:false, area:false});
resetCut();
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const scale=(a,k)=>a.map(x=>x*k);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const cross=([a,b,c],[x,y,z])=>[b*z-c*y,c*x-a*z,a*y-b*x];
const unit=a=>scale(a,1/Math.hypot(...a));
const loop=n=>Array.from({length:n},(_,i)=>i);
const polygon=(pts,fill,extra='')=>'<polygon points="'+pts.map(p=>p.slice(0,2).join(',')).join(' ')+'" fill="'+fill+'" stroke="#254554" stroke-width="2" '+extra+'/>';
const line=(a,b,color='#254554',dash='')=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+color+'" stroke-width="2.5" '+(dash?'stroke-dasharray="7 5"':'')+'/>';
function buttons(id, labels, selected, action) {
  el(id).replaceChildren(...labels.map((label,i)=>{
    const button=document.createElement('button');
    button.textContent=label;
    if(selected>=0) button.setAttribute('aria-pressed',i===selected);
    button.onclick=()=>{action(i); render();};
    return button;
  }));
}
function options(){
  if(state.chapter===0) return [['Cuboid','Pentagonal pyramid','Cylinder','Sphere'],['Square','Rectangle','Equilateral triangle','Scalene triangle'],['Q7 · Four-sided base','Q8 · Six-sided base']][state.topic];
  return state.topic<2?['Cuboid','Triangular prism','Pentagonal prism']:['Cuboid','Triangular prism'];
}
function mesh(){
  const {chapter,topic,shape,oblique}=state;
  const solids=chapter===0&&topic===0;
  const pyramid=solids&&shape===1, curved=solids&&shape===2;
  let n=4;
  if(pyramid) n=5;
  if(curved) n=48;
  if(chapter===0&&topic===1&&shape>=2) n=3;
  if(chapter===0&&topic===2&&shape===1) n=6;
  if(chapter===1&&shape===1) n=3;
  if(chapter===1&&shape===2) n=5;
  let base=loop(n).map(i=>{const a=2*Math.PI*i/n-Math.PI/2;return [1.24*Math.cos(a),1.24*Math.sin(a)];});
  if(n===4) {
    const width=chapter===0&&topic===1&&shape===0?1:1.4;
    base=[[-width,-1],[width,-1],[width,1],[-width,1]];
  }
  if(chapter===0&&topic===1&&shape===3) base=[[-1.1,-.8],[1.3,-.8],[-.65,1]];
  const shift=chapter===0&&topic===1&&oblique?.85:0;
  const vertices=[...base.map(([x,y])=>[x,y,-1]),...(pyramid?[[0,0,1.25]]:base.map(([x,y])=>[x+shift,y,1]))];
  const faces=[loop(n).reverse()];
  if(!pyramid) faces.push(loop(n).map(i=>i+n));
  for(let i=0;i<n;i++){
    const j=(i+1)%n;
    faces.push(pyramid?[i,j,n]:[i,j,j+n,i+n]);
  }
  const edges=[];
  for(const face of faces) face.forEach((a,i)=>{const b=face[(i+1)%face.length];if(!edges.some(([x,y])=>x===Math.min(a,b)&&y===Math.max(a,b)))edges.push([Math.min(a,b),Math.max(a,b)]);});
  return {vertices,faces,edges,n,pyramid,curved};
}
function cutGeometry(vertices,edges){
  const normal=unit([state.tiltX,state.tiltY,1]);
  const u=unit(cross([0,1,0],normal)),v=cross(normal,u);
  const center=scale(normal,state.offset);
  const points=[];
  function include(p){if(!points.some(q=>Math.hypot(...sub(p,q))<1e-7))points.push(p);}
  for(const [i,j] of edges){
    const a=vertices[i],b=vertices[j], da=dot(a,normal)-state.offset,db=dot(b,normal)-state.offset;
    if(Math.abs(da)<1e-8)include(a);
    if(Math.abs(db)<1e-8)include(b);
    if(da*db<0)include(add(a,scale(sub(b,a),da/(da-db))));
  }
  if(points.length){
    const mean=scale(points.reduce(add,[0,0,0]),1/points.length);
    points.sort((a,b)=>Math.atan2(dot(sub(a,mean),v),dot(sub(a,mean),u))-Math.atan2(dot(sub(b,mean),v),dot(sub(b,mean),u)));
  }
  return {center,u,v,points,flat:points.map(p=>[dot(p,u),dot(p,v)])};
}
function draw(){
  const {vertices,faces,edges,n,pyramid,curved}=mesh();
  const cut=state.chapter===1&&state.topic<2;
  const sketch=state.chapter===1&&state.topic>=2;
  const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
  const project=([x,y,z])=>[300+83*(cy*x-sy*y),210+83*(sp*(sy*x+cy*y)-cp*z),cp*(sy*x+cy*y)+sp*z];
  let html='';
  if(sketch){
    const mode=state.topic-2;
    const axes=mode===1?[[Math.sqrt(3)*14,14],[-Math.sqrt(3)*14,14],[0,-28]]:[[32,0],[mode===2?16:14,mode===2?16:11],[0,-32]];
    if(mode){
      const [a,b]=mode===1?axes:[[32,0],[0,32]];
      const grid=(i,j)=>[300+i*a[0]+j*b[0],218+i*a[1]+j*b[1]];
      for(let i=-25;i<=25;i++){
        html+=line(grid(i,-25),grid(i,25),'#e4eeee')+line(grid(-25,i),grid(25,i),'#e4eeee');
        if(mode===1)html+=line(grid(-25,-25+i),grid(25,25+i),'#e4eeee');
        else html+=line(grid(-25,-25+i),grid(25,25+i),'#e4eeee');
      }
    }
    const basePoints=n===3?[[0,0],[4,0],[0,3]]:[[0,0],[4,0],[4,3],[0,3]];
    const pts=basePoints.map(([x,y])=>[245+x*axes[0][0]+y*axes[1][0],260+x*axes[0][1]+y*axes[1][1]]);
    const top=pts.map(p=>add(p,scale(axes[2],3)));
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      html+=line(pts[i],pts[j],'#1865a2',state.step===2&&(i===0||i===n-1)?'hidden':'');
      if(state.step>=(mode===0?1:2))html+=line(top[i],top[j],'#883fa0');
      if(state.step>=(mode===0?2:1))html+=line(pts[i],top[i],'#254554',state.step===2&&i===0?'hidden':'');
    }
    pts.forEach(([x,y],i)=>{html+='<text x="'+(x+5)+'" y="'+(y+18)+'">'+String.fromCharCode(65+i)+'</text>';});
    if(state.step>=(mode===0?1:2))top.forEach(([x,y],i)=>{html+='<text x="'+(x+5)+'" y="'+(y-8)+'">'+String.fromCharCode(65+n+i)+'</text>';});
  }else if(state.chapter===0&&state.topic===0&&state.shape===3){
    html='<defs><radialGradient id="ball" cx="32%" cy="24%"><stop stop-color="#dff8fa"/><stop offset="1" stop-color="#3f8499"/></radialGradient></defs><circle cx="300" cy="210" r="112" fill="url(#ball)" stroke="#254554" stroke-width="2" data-face="0"/>';
  }else{
    const pts=vertices.map(project);
    const sorted=faces.map((indices,i)=>({i,pts:indices.map(j=>pts[j])})).sort((a,b)=>depth(a.pts)-depth(b.pts));
    const section=cut?cutGeometry(vertices,edges):null;
    if(section){
      const {center,u,v}=section;
      const corner=(x,y)=>add(center,add(scale(u,x),scale(v,y)));
      html+=polygon([corner(-1.8,-1.8),corner(1.8,-1.8),corner(1.8,1.8),corner(-1.8,1.8)].map(project),'#ffbd64','opacity=".34"');
    }
    for(const f of sorted){
      const fill=state.selected===f.i?'#ffd07b':f.i===0?'#297abd':f.i===1&&!pyramid?'#9e56b6':'#b9d0d4';
      if(curved&&f.i>=2){
        html+=polygon(f.pts,fill,'data-face="'+f.i+'" opacity=".78" style="stroke-width:0"');
      }else html+=polygon(f.pts,fill,'data-face="'+f.i+'" opacity="'+(cut?.52:.9)+'"');
    }
    if(section){
      const {center,u,points,flat}=section;
      if(points.length>=3)html+=polygon(points.map(project),state.reveal?'#f39628':'none','stroke-dasharray="7 5"');
      const handle=(p,label,kind)=>{
        const [x,y]=project(p);
        return '<g data-drag="'+kind+'" transform="translate('+x+' '+y+')"><rect x="-44" y="-24" width="88" height="48" rx="16" fill="#a85009"/><text text-anchor="middle" y="6" fill="white" font-weight="bold">'+label+'</text></g>';
      };
      html+=handle(center,'↕ Move','move');
      if(!state.parallel)html+=handle(add(center,scale(u,1.65)),'↻ Tilt','tilt');
      const result=el('result');
      if(state.reveal&&flat.length>=3){
        const area=Math.abs(flat.reduce((sum,[x,y],i)=>{const [a,b]=flat[(i+1)%flat.length];return sum+x*b-y*a;},0))/2;
        const extent=Math.max(2,...flat.flat().map(Math.abs));
        result.innerHTML='<strong>Cross section</strong><svg viewBox="-'+extent+' -'+extent+' '+(2*extent)+' '+(2*extent)+'" aria-label="Cross section viewed straight on">'+polygon(flat,'#f6af55','style="stroke-width:.035"')+'</svg>'+(state.area?'<p>'+area.toFixed(2)+' square units</p>':'');
      }else result.textContent=state.reveal?'Move the plane into the solid.':'';
    }
    if(state.chapter===0&&state.topic===2){
      const labels=state.shape===0?'ABCDGHEF':'ABCDEFGHIJKL';
      pts.forEach(([x,y],i)=>{html+='<text x="'+x+'" y="'+(y-7)+'" text-anchor="middle" font-weight="bold" paint-order="stroke" stroke="white" stroke-width="4">'+labels[i]+'</text>';});
      el('result').textContent=state.selected>=0?'Vertices: '+faces[state.selected].map(i=>labels[i]).join(' '):'Blue and purple mark the two bases.';
    }
  }
  model.innerHTML=html;
}
const depth=pts=>pts.reduce((sum,p)=>sum+p[2],0)/pts.length;
function change(chapter,topic){
  Object.assign(state,{chapter,topic,shape:0,step:0,selected:-1,oblique:false,yaw:.6,pitch:.56});
  resetCut();
  if(chapter===1&&topic===0)Object.assign(state,{parallel:false,tiltX:.8,tiltY:.25});
}
function render(){
  buttons('chapters',['5.2A · Solids','5.2B · Cut and sketch'],state.chapter,i=>change(i,0));
  buttons('topics',topics[state.chapter],state.topic,i=>change(state.chapter,i));
  buttons('choices',options(),state.shape,i=>{state.shape=i;state.step=0;state.selected=-1;});
  el('result').textContent='';
  const a=state.chapter===0, t=state.topic;
  if(a){
    el('help').textContent=['Drag to turn the solid. Tap a surface. Is every face a polygon?','Change the base shape or tilt the sides. Which lateral faces are rectangles?','Drag to turn the prism. Tap a face to read its vertex letters.'][t];
    if(t===1)buttons('actions',['Right','Oblique'],Number(state.oblique),i=>state.oblique=Boolean(i));
    else el('actions').replaceChildren();
    if(t===0&&state.selected>=0)el('result').textContent=state.shape===3||(state.shape===2&&state.selected>=2)?'Curved surface':'Flat face';
    if(t===1)el('result').textContent='Blue = lower base · Purple = upper base';
  }else if(t<2){
    el('help').textContent='Drag Move to push the plane through the prism. In Free cut, drag Tilt to change its direction. Drag elsewhere to turn the prism.';
    buttons('actions',['Parallel to base','Free cut',state.reveal?'Hide cross section':'Show cross section',state.area?'Hide area':'Show area'],-1,i=>{
      if(i===0)Object.assign(state,{parallel:true,tiltX:0,tiltY:0,offset:Math.max(-.9,Math.min(.9,state.offset))});
      if(i===1){state.parallel=false;if(!state.tiltX&&!state.tiltY)state.tiltX=.65;}
      if(i===2)state.reveal=!state.reveal;
      if(i===3){state.area=!state.area;if(state.area)state.reveal=true;}
    });
    [...el('actions').children].slice(0,2).forEach((b,i)=>b.setAttribute('aria-pressed',i===Number(!state.parallel)));
  }else{
    const steps=t===2?['Draw one base','Draw the other base','Join matching vertices']:['Draw one base','Draw the heights','Complete the other base'];
    el('help').textContent=(state.step+1)+' / 3 · '+steps[state.step];
    buttons('actions',['Back','Next step','Start over'],-1,i=>state.step=i===2?0:Math.max(0,Math.min(2,state.step+(i===0?-1:1))));
    el('actions').children[0].disabled=state.step===0;
    el('actions').children[1].disabled=state.step===2;
    el('result').textContent='Dashed lines show hidden edges.';
  }
  draw();
}
let drag;
model.onpointerdown=e=>{
  if(state.chapter===1&&state.topic>=2)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,kind:e.target.closest('[data-drag]')?.dataset.drag,face:e.target.dataset.face,moved:false};
  model.setPointerCapture(e.pointerId);
};
model.onpointermove=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<3)return;
  drag.moved=true;
  if(drag.kind==='move'){
    const limit=state.parallel?.97:2.6;
    state.offset=Math.max(-limit,Math.min(limit,state.offset-dy*.019));
  }else if(drag.kind==='tilt'){
    state.tiltX=Math.max(-8,Math.min(8,state.tiltX+dx*.025));
    state.tiltY=Math.max(-8,Math.min(8,state.tiltY-dy*.025));
  }else{
    state.yaw+=dx*.012;
    state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+dy*.01));
  }
  drag.x=e.clientX;drag.y=e.clientY;
  draw();
};
model.onpointerup=e=>{
  if(drag&&drag.id===e.pointerId&&!drag.moved&&drag.face!==undefined&&state.chapter===0){state.selected=Number(drag.face);render();}
  drag=null;
};
model.onpointercancel=()=>drag=null;
render();
