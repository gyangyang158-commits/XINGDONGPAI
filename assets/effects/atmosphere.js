/*
 * XINGDONGPAI atmosphere — local WebGL2/CSS implementation.
 * Visual research: Shader Effects Inc., MeshGradient / FilmGrain / Sparkle,
 * commit 9eb037d8db63a0783f67d58ce7291726d698933f, MIT.
 * Not the upstream WebGPU runtime or a pixel-identical port. No telemetry.
 * Attribution and license: assets/effects/SHADERS-LICENSE.txt.
 */
(function(scope){
 'use strict';
 const VERTEX=`#version 300 es
 in vec2 a_position;
 void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
 const FRAGMENT=`#version 300 es
 precision highp float;
 uniform vec2 u_resolution;
 uniform vec2 u_pointer;
 uniform float u_time;
 out vec4 fragColor;
 float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution; uv.y=1.0-uv.y;
  float t=u_time*0.09;
  vec2 q=uv+vec2(sin(uv.y*4.0+t)*0.047,cos(uv.x*3.1-t*.7)*0.038);
  q+=(u_pointer-0.5)*0.018;
  vec2 anchors[6]; vec3 colors[6];
  anchors[0]=vec2(.08+sin(t*.7)*.13,.07+cos(t*.5)*.09);
  anchors[1]=vec2(.98+cos(t*.6)*.11,.13+sin(t*.7)*.13);
  anchors[2]=vec2(.47+sin(t*.4)*.12,.42+cos(t*.5)*.1);
  anchors[3]=vec2(.91+sin(t*.5)*.12,.82+cos(t*.6)*.12);
  anchors[4]=vec2(.34+cos(t*.4)*.14,1.03+sin(t*.5)*.12);
  anchors[5]=vec2(-.12+sin(t*.6)*.08,.72+cos(t*.4)*.12);
  colors[0]=vec3(.77,.65,.91); colors[1]=vec3(.97,.77,.86);
  colors[2]=vec3(.89,.81,.96); colors[3]=vec3(.73,.86,.97);
  colors[4]=vec3(.99,.92,.75); colors[5]=vec3(.79,.72,.92);
  vec3 color=vec3(0.0); float sum=0.0;
  float aspect=clamp(u_resolution.x/u_resolution.y,.7,1.7);
  for(int i=0;i<6;i++){
   vec2 d=(q-anchors[i])*vec2(aspect,1.0);
   float weight=exp(-dot(d,d)*9.0);
   color+=colors[i]*weight; sum+=weight;
  }
  color=mix(vec3(.99,.98,1.0),color/max(sum,.0001),.81);
  float luminance=dot(color,vec3(.2126,.7152,.0722));
  color+=(grain(gl_FragCoord.xy)-.5)*.022*(1.25-luminance);
  fragColor=vec4(color,1.0);
 }`;
 function policy(options={}){
  const reason=options.forcedColors?'contrast':options.lost||!options.gpu?'fallback':options.reduced?'reduced':options.saveData?'saving':options.paused?'paused':options.hidden?'hidden':'running';
  return {animate:reason==='running',reason,fps:options.small?12:20,maxPixels:options.small?280000:650000};
 }
 function resolution(width,height,maxPixels){
  width=Math.max(1,Number(width)||1);height=Math.max(1,Number(height)||1);
  const scale=Math.min(1,Math.sqrt(maxPixels/(width*height)));
  return [Math.max(1,Math.floor(width*scale)),Math.max(1,Math.floor(height*scale))];
 }
 function createPlayback({draw,requestFrame,cancelFrame,notify=()=>{}}){
  let pending=null,previous=null,lastDraw=null,time=0,current={animate:false,fps:20,reason:'paused'},destroyed=false;
  function frame(now){
   pending=null;if(destroyed||!current.animate)return;
   if(previous!==null)time+=Math.max(0,Math.min(now-previous,1000));previous=now;
   if(lastDraw===null||now-lastDraw>=1000/current.fps){draw(time/1000);lastDraw=now;}
   pending=requestFrame(frame);
  }
  return {
   update(next){if(destroyed)return;current=next;notify(next);if(!next.animate){if(pending!==null)cancelFrame(pending);pending=null;previous=null;lastDraw=null;draw(time/1000);}else if(pending===null){previous=null;pending=requestFrame(frame);}},
   redraw(){if(!destroyed)draw(time/1000);},
   destroy(){destroyed=true;if(pending!==null)cancelFrame(pending);pending=null;},
  };
 }
 function webgl(canvas){
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
  if(!gl)return null;
  const shaders=[];let program=null,buffer=null;
  try{
   for(const [type,source] of [[gl.VERTEX_SHADER,VERTEX],[gl.FRAGMENT_SHADER,FRAGMENT]]){
    const shader=gl.createShader(type);if(!shader)throw Error('shader');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('compile');
   }
   program=gl.createProgram();gl.attachShader(program,shaders[0]);gl.attachShader(program,shaders[1]);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');
   gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
   const uniforms={resolution:gl.getUniformLocation(program,'u_resolution'),pointer:gl.getUniformLocation(program,'u_pointer'),time:gl.getUniformLocation(program,'u_time')};
   for(const s of shaders)gl.deleteShader(s);
   return {draw(t,p){if(gl.isContextLost())return;gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform2f(uniforms.pointer,p[0],p[1]);gl.uniform1f(uniforms.time,t);gl.drawArrays(gl.TRIANGLES,0,6);},destroy(){gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
  }catch{
   shaders.forEach(s=>gl.deleteShader(s));if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);return null;
  }
 }
 function mount(win=window,doc=document){
  const main=doc.querySelector('.main');if(!main||doc.getElementById('studio-atmosphere'))return null;
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),contrast=win.matchMedia('(forced-colors: active)'),small=win.matchMedia('(max-width: 767px)');
  const layer=doc.createElement('div');layer.id='studio-atmosphere';layer.setAttribute('aria-hidden','true');
  const canvas=doc.createElement('canvas');canvas.setAttribute('aria-hidden','true');layer.appendChild(canvas);
  for(const [x,y,size,delay] of [[91,16,21,0],[14,61,14,2],[72,85,18,4],[45,35,11,1]]){
   const star=doc.createElement('span');star.className='atmosphere-star';star.style.cssText=`left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:-${delay}s`;layer.appendChild(star);
  }
  main.prepend(layer);
  let renderer=null;try{if(!contrast.matches)renderer=webgl(canvas);}catch{/* Static background is the baseline, not an error screen. */}
  layer.dataset.renderer=renderer?'webgl2':'css';
  let paused=false,lost=false,leaving=false;try{const preference=win.localStorage.getItem('xdp-atmosphere-motion');paused=preference==='paused'||(preference!=='running'&&small.matches);}catch{paused=small.matches;}
  let currentPolicy,pointer=[.5,.5],target=[.5,.5];
  const button=doc.createElement('button');button.id='atmosphere-toggle';button.className='btn btn-ghost btn-sm atmosphere-toggle';button.type='button';button.setAttribute('aria-label','背景动效');
  button.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg><span>动效</span>';
  const toolbar=main.querySelector('.topbar'),chat=toolbar?.querySelector('.chat-toggle');if(chat)toolbar.insertBefore(button,chat);else toolbar?.appendChild(button);
  const player=createPlayback({
   draw(t){if(renderer&&!lost){pointer=pointer.map((v,i)=>v+(target[i]-v)*.07);renderer.draw(t,pointer);}},
   requestFrame:fn=>win.requestAnimationFrame(fn),cancelFrame:id=>win.cancelAnimationFrame(id),
   notify(p){layer.dataset.state=p.reason;button.setAttribute('aria-pressed',String(p.animate));button.disabled=['reduced','contrast','saving','fallback'].includes(p.reason);button.title=({reduced:'系统已开启减少动态效果，保留静态氛围',saving:'省流量模式：保留静态氛围',contrast:'高对比度模式：关闭背景装饰',fallback:'当前环境使用静态渐变',paused:'开启背景动效',hidden:'页面隐藏时暂停',running:'暂停背景动效'})[p.reason];button.querySelector('span').textContent=p.animate?'动效':'静态';},
  });
  function resize(){if(!currentPolicy)return;const r=layer.getBoundingClientRect();const [w,h]=resolution(r.width,r.height,currentPolicy.maxPixels);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}player.redraw();}
  function update(){currentPolicy=policy({gpu:!!renderer,reduced:reduced.matches,forcedColors:contrast.matches,saveData:win.navigator.connection?.saveData===true,paused,hidden:doc.hidden||leaving,small:small.matches,lost});player.update(currentPolicy);resize();}
  const onChange=media=>{if(media.addEventListener)media.addEventListener('change',update);else media.addListener?.(update);};[reduced,contrast,small].forEach(onChange);
  button.addEventListener('click',()=>{paused=!paused;try{win.localStorage.setItem('xdp-atmosphere-motion',paused?'paused':'running');}catch{}update();});
  main.addEventListener('pointermove',e=>{if(!currentPolicy.animate||e.pointerType==='touch')return;const rect=layer.getBoundingClientRect();target=[Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(rect.width,1))),Math.max(0,Math.min(1,(e.clientY-rect.top)/Math.max(rect.height,1)))];},{passive:true});
  main.addEventListener('pointerleave',()=>{target=[.5,.5];},{passive:true});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;layer.dataset.renderer='css';update();});
  canvas.addEventListener('webglcontextrestored',()=>{renderer=webgl(canvas);lost=false;layer.dataset.renderer=renderer?'webgl2':'css';update();});
  doc.addEventListener('visibilitychange',update);win.addEventListener('resize',resize,{passive:true});
  win.addEventListener('pagehide',()=>{leaving=true;update();});win.addEventListener('pageshow',()=>{leaving=false;update();});
  const observer=win.ResizeObserver?new win.ResizeObserver(resize):null;observer?.observe(main);
  update();
  return {layer,player,update,destroy(){player.destroy();observer?.disconnect();renderer?.destroy();}};
 }
 const api={policy,resolution,createPlayback,VERTEX,FRAGMENT,mount};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else{scope.XDPAtmosphere=api;mount();}
})(typeof window!=='undefined'?window:this);
