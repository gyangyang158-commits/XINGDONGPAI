/* Shared, deterministic scene actions. No network or hidden user profiling. */
(function(root){
 'use strict';
 const scenes=[{id:'tea',name:'场景1 茶话室',icon:'message',tag:'一起聊出好想法'},{id:'look',name:'场景2 看图共创',icon:'image',tag:'@ 助手，把喜欢放进画面'},{id:'join',name:'场景3 极简拼图',icon:'heart',tag:'一张照片，一句祝福'},{id:'decision',name:'场景4 决策间',icon:'check',tag:'加一点，减一点，Bingo'}];
 const tips=[
  {id:'space',title:'留白不是空着',sub:'给主角一点呼吸的位置',body:'先找出画面里最重要的人物或标题，再减少它周围的干扰。留白可以在四周，也可以只留在人物视线朝向的一侧。',steps:['选一个主角，不让所有元素同样大。','让文字避开人脸，沿一条线对齐。','缩小看一眼，先看见的还是主角吗？'],layout:'editorial'},
  {id:'stickers',title:'贴纸很多，也可以不乱',sub:'把装饰当成一组，而不是撒满',body:'先把贴纸集中在一个区域，再用大小差别拉开主次。贴纸是陪衬，可以少量重复，不必每个角落都填满。',steps:['先留下一组最喜欢的贴纸。','让其中一枚更大，其余做陪衬。','比较减少一枚后的效果，保留更舒服的一版。'],layout:'frame'},
  {id:'crop',title:'同一张照片，两种取景',sub:'先看人物，再决定怎么裁',body:'完整剧照保留故事环境，局部特写突出人物。裁切是选择画面的范围，不需要先抠掉所有背景。',steps:['用完整照片试一次。','拖动取景位置，确认没有切掉关键部位。','放大后再检查清晰度，不把预览当印刷原件。'],layout:'frame'},
  {id:'type',title:'远一点，也看得见标题',sub:'先分清标题和说明',body:'标题负责让人一眼知道主题，说明负责补充日期与地点。两者需要字号差别，但字大不等于把每个位置都填满。',steps:['把主题缩成一句短标题。','标题和说明分两档大小。','用手机缩略图检查，别只在放大状态下看。'],layout:'editorial'},
  {id:'tools',title:'想自己做，从哪一步开始？',sub:'按任务学，不用先学完整软件',body:'简单照片处理可在熟悉的醒图中练习裁切、拼图和边框；模板排版可在熟悉的模板工具中试改标题和图片。此处先提供不依赖其他软件的练习，外部功能与付费规则以各软件当前说明为准。',steps:['先只完成选图和裁切。','再试一个标题、一种对齐方式。','需要更复杂处理时再学习对应工具，不用为了参与先换软件。'],layout:'frame'}
 ];
 const clean=(v,n=600)=>typeof v==='string'?v.trim().slice(0,n):'';
 function safeLink(value){try{const u=new URL(clean(value,1500));return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
 function localReply(text,topic){
  if(/不会|不懂|不知道|零基础/.test(text))return '可以先不做整张。选一张喜欢的照片，或者写一句祝福，都能成为这次作品的一部分。你更想从哪一个开始？';
  if(/贴纸|丰富|太满|装饰/.test(text))return '先把装饰集中成一组，让人物和标题留出空间。可以试试同一张图的「少一点」与「多一点」，再凭感觉选择。';
  if(/酷|舞台|黑金/.test(text))return '这个方向可以单独留成一版：突出人物与标题，少量装饰放在边角。先选参考，再带自己的照片进去试，不需要覆盖其他人的方向。';
  if(/温柔|胶片|日常|暖/.test(text))return '可以试试照片占大部分、祝福放在留白处的排法。拍立得边框更像一张纪念卡，杂志式留白则让文字更清楚。';
  return topic==='daily'?'先凭感觉选就好。我们可以用同一张图试两种排法，看清差别后再决定喜欢哪一张。':'这条想法先留下，不替其他成员做决定。你可以分享一张参考，或者选一个方向，带着照片试一版。';
 }
 function summary(messages){return messages.filter(m=>m.role==='user').map(m=>({text:clean(m.text,300),sourceIds:[m.id],by:m.by}));}
 function imageSafe(url){return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(url||'');}
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 let svgSerial=0;
 const wrap=(text,count)=>{const chars=Array.from(text);return Array.from({length:Math.ceil(chars.length/count)},(_,i)=>chars.slice(i*count,(i+1)*count).join(''));};
 function photoPlacement(photo,opts={}){
  const finite=(v,fallback)=>Number.isFinite(Number(v))?Number(v):fallback;
  const layout=['editorial','panorama'].includes(opts.layout)?opts.layout:'frame',p=layout==='panorama'?{x:60,y:200,w:480,h:350}:layout==='frame'?{x:60,y:100,w:480,h:480}:{x:230,y:100,w:310,h:510};
  const x=Math.max(0,Math.min(100,finite(opts.x,50))),y=Math.max(0,Math.min(100,finite(opts.y,50))),zoom=Math.max(50,Math.min(200,finite(opts.zoom,100)));
  const w=photo?.width||600,h=photo?.height||800,scale=Math.max(p.w/w,p.h/h)*zoom/100,iw=w*scale,ih=h*scale;
  return {p,x:p.x-(iw-p.w)/2+(x-50)*p.w/100,y:p.y-(ih-p.h)/2+(y-50)*p.h/100,width:iw,height:ih,zoom};
 }
 function photoSVG(photo,opts={}){
  const layout=['editorial','panorama'].includes(opts.layout)?opts.layout:'frame',g=photoPlacement(photo,opts),p=g.p,clip='scene-photo-'+(++svgSerial);
  const safe=photo&&imageSafe(photo.url||photo.dataUrl),px=g.x,py=g.y,iw=g.width,ih=g.height;
  const title=clean(opts.title,24)||'把喜欢，留在这里',subtitle=clean(opts.subtitle,45)||'一起完成的这一刻';
  const titleLines=wrap(title,layout==='frame'?14:4),subLines=wrap(subtitle,28);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="${layout==='frame'?'纪念相框':'留白刊页'}排版预览"><defs><clipPath id="${clip}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${layout==='frame'?4:14}"/></clipPath></defs><rect width="600" height="800" fill="#E9E0F4"/><circle cx="590" cy="90" r="170" fill="#F2DDEB"/><path d="M0 710Q300 570 600 720V800H0Z" fill="#DAE8F2"/><text x="44" y="48" font-family="sans-serif" font-size="13" fill="#665277" letter-spacing="3">XINGDONGPAI / OUR LITTLE MOMENT</text><rect x="${p.x-16}" y="${p.y-16}" width="${p.w+32}" height="${p.h+32}" fill="#FFFCF6" rx="10"/>${safe?`<image data-scene-image="true" href="${E(photo.url||photo.dataUrl)}" x="${px}" y="${py}" width="${iw}" height="${ih}" clip-path="url(#${clip})"/>`:`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#D4C3E5"/><text x="${p.x+p.w/2}" y="${p.y+p.h/2}" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#665277">${opts.textOnly?'把心意，留在这一刻':'上传你的照片'}</text>`}<g data-scene-title="true">${titleLines.map((line,i)=>`<text x="${layout==='frame'?56:44}" y="${(layout==='frame'?637:145)+i*(layout==='frame'?38:43)}" font-family="sans-serif" font-size="${layout==='frame'?34:35}" fill="#59426F" font-weight="700">${E(line)}</text>`).join('')}</g><g data-scene-subtitle="true">${subLines.map((line,i)=>`<text x="48" y="${714+i*24}" font-family="sans-serif" font-size="17" fill="#756184">${E(line)}</text>`).join('')}</g><path d="M44 750H556" stroke="#BCA8D1"/><text x="44" y="777" font-family="sans-serif" font-size="11" fill="#756184">CO-CREATION / 照片与文字由参与者提供</text></svg>`;
 }

 function retitle(svg,title,subtitle){
  const update=(group,text,defaultSize,count,defaultY,gap)=>svg=svg.replace(new RegExp('(<g data-scene-'+group+'="true">)([\\s\\S]*?)(</g>)'),(_,open,body,close)=>{const first=body.match(/<text\b([^>]*)>/)?.[1]||'',attr=(name,fallback)=>Number(first.match(new RegExp('\\b'+name+'="([\\d.]+)"'))?.[1]||fallback),x=attr('x',48),y=attr('y',defaultY),size=attr('font-size',defaultSize);return open+wrap(clean(text,group==='title'?24:45),group==='title'?(x===56?14:4):count).map((line,i)=>`<text x="${x}" y="${y+i*(group==='title'?(x===56?38:43):gap)}" font-family="sans-serif" font-size="${size}" fill="${group==='title'?'#59426F':'#756184'}" ${group==='title'?'font-weight="700"':''}>${E(line)}</text>`).join('')+close;});
  update('title',title,34,14,637,43);update('subtitle',subtitle,17,28,714,24);return svg;
 }
 function revise(svg,kind,delta,decor=[],stickerSVG){
  let result=svg.replace(/<!--SCENE-EXTRAS-->[\s\S]*?<!--\/SCENE-EXTRAS-->/g,'');
  let layers=decor.map(x=>({...x})),changed=false,note='原稿保持不变。';
  if(kind==='title'&&delta){result=result.replace(/font-size="(\d+(?:\.\d+)?)"/g,(whole,size)=>{if(Number(size)<30)return whole;changed=true;return `font-size="${Math.max(24,Math.min(90,Math.round(Number(size)*(delta>0?1.12:.88))))}"`;});note=changed?`大标题字号${delta>0?'增加':'减少'}约 12%，其他内容保持不变。`:'这张图没有可单独调整的文字层，可尝试添加贴纸或打开二创。';}
  if(kind==='decoration'&&delta){if(delta>0&&layers.length<8){layers.push({type:layers.length%2?'flower':'star',x:500-layers.length%3*48,y:70+layers.length%3*47});changed=true;note='增加一枚边角贴纸，原有图片与文字不变。';}else if(delta<0&&layers.length){layers.pop();changed=true;note='减少一枚可编辑贴纸，原有图片与文字不变。';}else note=delta>0?'已放入八枚贴纸，先试试少一点。':'这张稿件没有本工具可单独减少的贴纸。可以调整标题，或进入二创修改原装饰。';}
  if(layers.length&&stickerSVG)result=result.replace('</svg>',`<!--SCENE-EXTRAS--><g>${layers.map(l=>`<g transform="translate(${l.x} ${l.y}) scale(.6)">${stickerSVG(l.type)}</g>`).join('')}</g><!--/SCENE-EXTRAS--></svg>`);
  return {svg:result,layers,changed,note};
 }
 const api={scenes,tips,clean,safeLink,localReply,summary,imageSafe,photoPlacement,photoSVG,retitle,revise};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.XDPScenes=api;
})(typeof window!=='undefined'?window:this);
