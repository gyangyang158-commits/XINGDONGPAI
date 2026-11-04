/* 设计助手 Studio: presentation layer over the original, local-only prototype. */
'use strict';
const STUDIO_ICONS = {
  mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8',
  grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  layers:'m12 3 10 6-10 6L2 9 12 3Z M3 13l9 5 9-5 M3 17l9 5 9-5',
  image:'M4 3h16v18H4z M4 15l5-5 5 6 3-3 3 4 M15 7h.01',
  note:'M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5',
  arrow:'M4 12h15 M13 6l6 6-6 6', check:'m5 12 4 4L19 6',
  plus:'M12 5v14 M5 12h14', message:'M4 4h16v13H8l-4 4V4Z M8 8h8 M8 12h5',
  heart:'M20 5c-2-2-5-1-8 2C9 4 6 3 4 5c-4 4 0 9 8 15 8-6 12-11 8-15Z',
  user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M4 21v-2a8 8 0 0 1 16 0v2',
  upload:'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M12 7v5l3 2',
  vote:'m7 3 10 4-4 9-10-4 4-9Z M3 16v5h18v-9h-4',
  close:'m6 6 12 12 M6 18 18 6', download:'M12 3v13 M7 11l5 5 5-5 M4 17v4h16v-4',
  settings:'M4 7h16 M4 17h16 M8 4v6 M16 14v6', switch:'M4 7h15l-4-4 M20 17H5l4 4',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  logo:'M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
};
function uiIcon(name, size=18){return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${STUDIO_ICONS[name] || STUDIO_ICONS.note}"/></svg>`;}
function studioCover(){return posterSVG('lilac-bloom');}
const studioLegacy = {render, renderWall, paintSubmitPosted, likeArt, doSubmit, artSVG};
const STUDIO_POSTERS = [
 {id:'T1',name:'露紫花笺',sub:'露紫花束 · 宋体标题 · 清爽留白',posterKey:'lilac-bloom',tone:'fresh',theme:'sky',type:'版头',pcat:'visual'},
 {id:'T2',name:'紫调来信',sub:'浅紫纸色 · 花信 · 温柔祝福',posterKey:'lilac-letter',tone:'letter',theme:'sunset',type:'异形手幅',pcat:'copy'},
 {id:'T3',name:'奶紫派对',sub:'奶紫主调 · 咖啡杯 · 轻快生日感',posterKey:'lilac-party',tone:'party',theme:'sunset',type:'杜邦袋',pcat:'element'},
 {id:'T4',name:'晨雾花园',sub:'灰紫花园 · 雏菊 · 自然舒展',posterKey:'lilac-day',tone:'fresh',theme:'sky',type:'透扇',pcat:'layout'},
 {id:'T5',name:'紫夜星图',sub:'墨紫星图 · 露紫星芒 · 夜场应援',posterKey:'violet-night',tone:'night',theme:'cool',type:'版头',pcat:'element'},
 {id:'T6',name:'露紫相册',sub:'露紫纸框 · 原图替换区 · 照片主视觉',posterKey:'lilac-photo',tone:'photo',theme:'dusk',type:'版头',pcat:'visual',needsPhoto:true}
];
TPLS.splice(0,TPLS.length,...STUDIO_POSTERS);
const POSTER_TONES=[['all','全部风格'],['fresh','花园留白'],['letter','花信祝福'],['party','生日派对'],['night','紫夜星图'],['photo','照片版式']];
tplThumb=function(t,big=false){return `<div class="tpl-thumb poster-template-art ${big?'large':''}">${posterSVG(t.posterKey||'lilac-bloom')}</div>`;};
tplPane=function(){
 const st=S.submit||{};const filter=POSTER_TONES.some(x=>x[0]===st.tplType)?st.tplType:'all';
 const list=STUDIO_POSTERS.filter(t=>filter==='all'||t.tone===filter);const chosen=STUDIO_POSTERS.find(t=>t.id===st.tpl);
 return `<div class="poster-library"><header class="poster-library-intro"><span class="studio-eyebrow">POSTER COLLECTION / 01</span><h2>让喜欢，有自己的样子。</h2><p>从完整的配色与构图开始。挑一张作为参考，再和大家一起改成这一期的海报。</p></header>
 ${chosen?`<section class="poster-selected" aria-label="已选模板"><div class="poster-selected-art">${tplThumb(chosen,true)}</div><div class="poster-selected-copy"><span class="studio-eyebrow">已选版式</span><h3>${esc(chosen.name)}</h3><p>${esc(chosen.sub)}</p><p class="poster-honest-note">${chosen.needsPhoto?'照片区需要替换为你有权使用的原图；当前预览明确保留空位。':'插画与文字已组成完整的风格参考，尚未经过本期成员定稿。'}</p><button class="btn btn-ghost btn-sm" data-act="poster-preview" data-tpl="${chosen.id}">${uiIcon('eye',16)}放大看完整海报</button></div></section>`:''}
 <div class="poster-style-filter" aria-label="模板风格">${POSTER_TONES.map(([v,label])=>`<button data-act="tpl-type" data-t="${v}" class="${filter===v?'on':''}" aria-pressed="${filter===v}">${label}</button>`).join('')}</div>
 <div class="tpl-grid poster-template-grid">${list.map(t=>`<button class="tpl-card ${st.tpl===t.id?'on':''}" data-act="pick-tpl" data-tpl="${t.id}" aria-label="选择${esc(t.name)}" aria-pressed="${st.tpl===t.id}">${tplThumb(t)}<span class="tpl-meta"><b class="tpl-name">${esc(t.name)}</b><span class="tpl-sub">${esc(t.sub)}</span>${st.tpl===t.id?'<span class="poster-selected-label">已选择</span>':''}</span></button>`).join('')}</div><p class="poster-library-foot">6 套原创 SVG 版式示意 · 文案和日期为本期参考内容 · 照片不使用人物剪影代替</p></div>`;
};
function openPosterPreview(id){const t=STUDIO_POSTERS.find(x=>x.id===id);if(!t)return;$('#sheet-host').innerHTML=`<div class="sheet-mask poster-preview-mask" data-act="close-poster-preview"><section class="sheet poster-preview-sheet" role="dialog" aria-modal="true" aria-label="${esc(t.name)}完整海报预览" data-stop="1"><header><div><small>完整海报预览</small><h2>${esc(t.name)}</h2></div><button class="icon-button" data-act="close-poster-preview" aria-label="关闭海报预览">${uiIcon('close',20)}</button></header><div class="poster-full-art">${posterSVG(t.posterKey)}</div><p>${esc(t.sub)}${t.needsPhoto?' · 照片待替换':''}</p></section></div>`;}
function paintStudioShell(){
 const aside=$('#studio-sidebar'); if(!aside)return;
 const cur=S.stage===1?'home':S.stage>=3?'delivery':S.boardView;
 const nav=(v,label,icon,count)=>`<button class="studio-nav ${cur===v?'active':''}" data-act="studio-nav" data-v="${v}" ${cur===v?'aria-current="page"':''}>${uiIcon(icon)}<span>${label}</span>${count!=null?`<small>${count}</small>`:''}</button>`;
 aside.innerHTML=`<button class="studio-brand" data-act="home" aria-label="设计助手项目概览"><span class="studio-logomark">${uiIcon('logo',23)}</span><span>设计助手<small>CO-CREATION STUDIO</small></span></button>
 <div class="sidebar-section-label">共创空间</div><div class="sidebar-project"><span class="sidebar-project-cover">${studioCover()}</span><span><b>赵露思生日生咖</b><small>海报共创 · 第一期</small></span></div>
 <nav aria-label="工作区导航">${nav('home','项目概览','grid')}${nav('pool','灵感收集','note',S.pool.length)}<button class="studio-nav" data-act="studio-open-templates">${uiIcon('image')}<span>海报模板</span><small>6</small></button>${nav('done','稿件评审','image',S.arts.length)}${nav('delivery','交付归档','layers')}</nav>
 <div class="sidebar-rule"></div><div class="sidebar-section-label">一起完成</div><div class="sidebar-members">${avStack(['lu','t0','yao','maggie'],4)}<span>${S.people.length} 位演示成员</span></div><p class="sidebar-note">想法留下来源，<br>每一次决定都有记录。</p>
 <div class="sidebar-bottom"><button class="studio-nav" data-act="open-quests">${uiIcon('check')}<span>任务与贡献</span></button><button class="studio-nav" data-act="open-me">${avatar(ME,'av-sm')}<span>${esc(P(ME).name)}<small class="member-role">${ME==='lu'?'主办':'参与者'}</small></span>${uiIcon('settings',16)}</button><div class="local-demo"><i></i>本地演示 · 刷新后重置</div></div>`;
 const loc=$('#studio-location');if(loc)loc.textContent=cur==='home'?'项目概览':cur==='pool'?'灵感收集':cur==='done'?'稿件评审':'交付归档';
 const mobile=$('#studio-mobile-nav'); if(mobile)mobile.innerHTML=`${nav('home','概览','grid')}${nav('pool','灵感','note')}${nav('done','评审','image')}${nav('delivery','交付','layers')}`;
}
function studioJourney(){
 const phase=S.final.picked?3:S.cons&&S.cons.winningArtId?2:0;
 return `<ol class="studio-journey">${[['收集灵感','每个人的想法，都留在这里'],['凝聚与投票','先独立选择，再公开结果'],['确认最终版','主办说明决定，设计师完善'],['交付与留档','正式文件与共创记录一起保留']].map((x,i)=>`<li class="${i<phase?'completed':i===phase?'current':''}"><span>${i<phase?uiIcon('check',15):String(i+1).padStart(2,'0')}</span><div><b>${x[0]}</b><small>${x[1]}</small></div>${i===phase?'<em>当前阶段</em>':''}</li>`).join('')}</ol>`;
}
renderLobby=function(){return `<section class="stage studio-overview" id="stage-1"><div class="studio-content">
 <div class="studio-eyebrow">ROOM 001 <span>/</span> 本期共创</div>
 <div class="studio-overview-hero"><div class="overview-copy"><div class="studio-status"><i></i>灵感征集中</div><h1>把喜欢<span class="inline-art" aria-hidden="true">${posterSVG('lilac-letter')}</span><br>做成共同的作品。</h1><p class="overview-project">赵露思 · 生日生咖应援海报</p><p class="overview-description">一张主图、一句祝福，或一个只有同担懂的小细节。把你的想法带进来，和大家一起把它做成海报。</p><button class="btn btn-primary" data-act="enter-room">进入共创空间 ${uiIcon('arrow')}</button><div class="overview-people">${avStack(['lu','t0','yao','maggie'],4)}<span>主办、参与者与设计师在这里协作</span></div></div>
 <figure class="overview-visual"><div class="poster-study">${studioCover()}</div><figcaption><span>露紫花笺 · 本期视觉参考</span><small>原创插画版式 · 非最终稿</small></figcaption></figure></div>
 <div class="overview-lower overview-process-only"><section><div class="studio-section-hd"><h2>一张海报，怎样一起完成</h2><span>共创流程</span></div>${studioJourney()}</section></div>
 <footer class="studio-page-foot">每个人的贡献都有署名。<span>本地原型 · 群聊仅演示，在线 AI 需授权</span></footer></div></section>`;};
function studioBoardHead(){const pool=S.boardView==='pool';return `<header class="studio-page-hd"><div><div class="studio-eyebrow">本期项目 <span>/</span> ${pool?'COLLECT':'REVIEW'}</div><h1>${pool?'灵感池':'稿件评审'}</h1><p>${pool?'查看带有署名和来源的想法、素材与方案。':'比较稿件、留下反馈，再由主办确认最终版。'}</p></div><button class="btn btn-primary" data-act="${pool?'open-seed-menu':'studio-art-upload'}">${uiIcon('plus')}${pool?'去创作台':'提交稿件'}</button></header>`;}
function studioMemberTask(){return `<div class="studio-taskline"><span>${S.myCard?uiIcon('check'):uiIcon('note')}${S.myCard?'你已提交灵感，可以参与后续讨论与投票。':'可以先浏览；准备好后，从创作台提交想法、模板或原图。'}</span></div>`;}
function reviewGridHTML(){
 const rec=S.cons&&S.cons.winningArtId;
 const list=[...S.arts].sort((a,b)=>Number(b.id===S.final.picked||b.id===rec)-Number(a.id===S.final.picked||a.id===rec));
 return `<div class="studio-review-toolbar"><span>${list.length} 版稿件 <small>选定一稿查看大图与反馈</small></span><div class="studio-view-switch" aria-label="稿件展示方式"><button class="on" data-act="studio-layout" data-v="grid" aria-pressed="true">${uiIcon('grid',16)}评审列表</button><button data-act="studio-layout" data-v="canvas" aria-pressed="false">${uiIcon('layers',16)}白板</button></div></div>
 ${S.final.picked?`<div class="studio-decision">${uiIcon('check')}<span>最终版 ${esc(S.final.picked)} 已由主办确认${S.final.reason?` · ${esc(S.final.reason)}`:''}</span><button class="text-button" data-act="goto" data-to="3">查看交付 ${uiIcon('arrow',16)}</button></div>`:rec?`<div class="studio-decision">${uiIcon('vote')}<span>投票推荐 ${esc(rec)} · ${ME==='lu'?'请核对后确认最终版，改选需说明原因':'等待主办确认最终版'}</span></div>`:''}
 <div class="studio-review-grid">${list.map((a,i)=>`<article class="review-card art-card ${a.id===S.final.picked?'final-pick':''}" data-art="${a.id}" style="--order:${Math.min(i,4)}"><div class="review-card-hd"><span class="draft-number">${esc(a.id)}</span><span class="draft-status">${a.id===S.final.picked?'最终版':a.id===rec?'投票推荐':!a.dataUrl&&!a.posterKey?'本地示意稿':'待评审'}</span></div><button class="review-art" data-act="view-art" data-art="${a.id}" aria-label="查看 ${a.id} 大图">${a.dataUrl?`<img src="${esc(a.dataUrl)}" alt="${esc(a.note)}">`:artSVG(a,{uid:'review-'+a.id})}</button><div class="review-card-body"><h2>${esc(a.note)}</h2><div class="review-metadata">${avatar(a.author,'av-sm')}<span>${esc(P(a.author).name)}</span><span>${a.kw.map(esc).join(' / ')}</span></div><div class="review-card-actions"><button class="art-heart ${a.likes.includes(ME)?'on':''}" data-act="like" data-art="${a.id}" data-review="true" aria-label="支持 ${a.id}">${uiIcon('heart',17)}<span>${a.likes.length} 人支持</span></button><button data-act="sticky" data-art="${a.id}">${uiIcon('message',17)}留反馈</button><button data-act="open-edit" data-art="${a.id}">${uiIcon('layers',17)}二创</button>${ME==='lu'&&!S.final.picked&&rec?`<button class="review-confirm" data-act="pick-final" data-art="${a.id}">确认最终版</button>`:''}</div><div class="stickies" id="st-${a.id}">${stickyHTML(a.id)}</div></div></article>`).join('')}</div>`;
}
renderWall=function(){
 if(S.boardView==='done'&&S.boardLayout==='canvas')return studioLegacy.renderWall().replace('<div class="wall-main">',`<div class="wall-main"><div class="canvas-return"><button class="text-button" data-act="studio-layout" data-v="grid">${uiIcon('grid',16)}返回评审列表</button><span>白板布局 · 按住空白拖动，滚轮缩放</span></div>`);
 return `<section class="stage studio-board" id="stage-2"><div class="studio-content">${studioBoardHead()}${studioMemberTask()}${S.boardView==='pool'?poolPanelHTML():reviewGridHTML()}</div></section>`;
};
consEntryHTML=function(){
 const counts=Object.fromEntries(SEED_TYPES.map(t=>[t.k,S.pool.filter(p=>p.kind==='insp'&&p.cat===t.k).length]));
 const ready=SEED_TYPES.filter(t=>counts[t.k]>=SUMMARY_THRESHOLD); const first=ready[0]||SEED_TYPES[0];
 return `<section class="studio-consensus"><div><span class="studio-eyebrow">共同决定</span><h2>${S.cons&&S.cons.winningArtId?'本轮推荐稿已产生':'把大家的想法，整理成方向。'}</h2><p>同类 ${SUMMARY_THRESHOLD} 张卡可启动。来源先公开，主办提名，再由成员投票。</p><button class="btn btn-ghost" data-act="open-cons" data-cat="${first.k}" ${ready.length&&S.myCard?'':'disabled'}>${S.cons&&S.cons.winningArtId?'查看共识记录':ready.length?'查看来源并开始凝聚':'等待同类卡满 5 张'} ${uiIcon('arrow',16)}</button></div><div class="consensus-counts">${SEED_TYPES.map(t=>`<div><span>${esc(t.t)}</span><b>${counts[t.k]}<small> / ${SUMMARY_THRESHOLD}</small></b><span>${counts[t.k]>=SUMMARY_THRESHOLD?'可凝聚':`还差 ${SUMMARY_THRESHOLD-counts[t.k]} 张`}</span></div>`).join('')}</div></section>`;
};
poolPanelHTML=function(){const chips=POOL_CATS.map(c=>`<button class="pool-cat ${S.poolCat===c.k?'on':''}" data-act="pool-cat" data-c="${c.k}">${esc(c.t)}<small>${c.k==='all'?S.pool.length:S.pool.filter(p=>p.cat===c.k).length}</small></button>`).join('');return `<div class="pool-main" id="pool-main">
 ${S.inspirationChoiceOpen?`<section class="contribution-options" aria-label="选择贡献方式"><button data-act="open-seed"><span class="choice-icon">${uiIcon('message',23)}</span><b>跟助手整理想法</b><p>从一段记忆出发，三个问题整理成灵感卡。</p><span class="choice-link">开始表达 ${uiIcon('arrow',16)}</span></button><button data-act="open-upload-direct"><span class="choice-icon">${uiIcon('upload',23)}</span><b>提交我已有的作品</b><p>上传原图、手绘或参考，并保留你的说明。</p><span class="choice-link">选择图片 ${uiIcon('arrow',16)}</span></button></section>`:''}
 <button class="contribution-template-link text-button" data-act="studio-open-templates">${uiIcon('image',17)}想从版式开始？挑一张海报模板 ${uiIcon('arrow',16)}</button>${consEntryHTML()}<div class="pool-cats" aria-label="灵感分类">${chips}<span class="pool-sort-label">按支持数排序</span></div><div class="pool-grid-main" id="pool-grid">${poolGridInner()}</div>
 <details class="demo-controls"><summary>演示工具与数据说明</summary><p>预置内容仅供原型体验。以下按钮显式载入模拟成员投稿，不代表真实共识。</p><div>${SEED_TYPES.map(t=>`<button class="btn btn-sm btn-ghost" data-act="demo-fill-cards" data-cat="${t.k}">补充${esc(t.t)}演示卡</button>`).join('')}</div></details></div>`;};
poolGridInner=function(){const list=S.pool.filter(p=>S.poolCat==='all'||p.cat===S.poolCat).sort((a,b)=>b.likes.length-a.likes.length);return list.length?list.map(poolCardHTML).join(''):`<div class="studio-empty">${uiIcon('note',32)}<h2>这个模块还在等第一条灵感</h2><p>一张图或一句话，都能成为大家的起点。</p><button class="btn btn-ghost" data-act="open-seed-menu">贡献一条灵感</button></div>`;};
poolCardHTML=function(p,i=0){const cat=POOL_CATS.find(c=>c.k===p.cat)||{};const seed=p.seed;const cmts=p.cmts||[];const open=!!S.poolCmtsOpen[p.id];return `<article class="pool-card ${seed?'seed-card':'material-card'} ${p.id===S.lastSubmittedPoolId?'just-added':''}" data-pool="${esc(p.id)}" style="--order:${Math.min(i,4)}"><div class="pool-card-category"><span>${esc(cat.t||'灵感')}</span><small>${p.demo?'演示投稿':esc(p.id)}${p.kind==='up'&&!p.dataUrl?' · 原图待上传':''}${p.taken?' · 已取用':''}</small></div>${!seed?`<div class="material-visual">${studioMaterialPreview(p)}</div>`:''}<div class="pool-card-copy"><h3>${esc(seed&&seed.word||p.name)}</h3><p class="ps-story">${esc(seed&&seed.story||p.note)}</p>${seed?`<div class="ps-kw">${[...new Set(seed.keys||[])].map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}<div class="pool-card-author">${avatar(p.by,'av-sm')}<span>${esc(P(p.by).name)}</span>${p.dataUrl?`<small>${p.width} × ${p.height} px</small>`:''}</div><div class="pool-ft"><button class="pool-like ${p.likes.includes(ME)?'on':''}" data-act="pool-like" data-id="${p.id}" aria-label="支持 ${esc(p.name)}">${uiIcon('heart',16)} ${p.likes.length}</button><button class="pool-cmt-btn" data-act="pool-cmt-toggle" data-id="${p.id}" aria-expanded="${open}">${uiIcon('message',16)} ${cmts.length} 条反馈</button></div><div class="pool-cmts ${open?'show':''}">${cmts.slice(-3).map(c=>`<div class="pool-cmt">${avatar(c.by,'av-sm')}<div><b>${esc(P(c.by).name)}</b> ${esc(c.text)}</div></div>`).join('')}<div class="pool-cmt-in"><input class="pool-cmt-input" data-id="${p.id}" aria-label="给 ${esc(p.name)} 留反馈" placeholder="写下具体的反馈" maxlength="40" value="${esc(S.poolDraft[p.id]||'')}"><button data-act="pool-cmt-send" data-id="${p.id}">发送</button></div></div></div></article>`;};
// Render every legacy mock preview through the same lilac visual system.
// Data URLs are always kept intact; missing photographs are explicitly labeled.
let materialPreviewInstance=0;
function studioPosterKeyFor(art={}){
 if(art.posterKey)return art.posterKey;
 const words=[art.name,art.note,...(art.kw||[])].filter(Boolean).join(' ');
 if(/相册|原图待|照片版式/.test(words))return 'lilac-photo';
 if(/夜|星光|灯海/.test(words))return 'violet-night';
 if(/咖啡|派对|杜邦袋/.test(words))return 'lilac-party';
 if(/晨雾|清晨|自然/.test(words))return 'lilac-day';
 if(/来信|花信|文案/.test(words))return 'lilac-letter';
 return ({b1:'lilac-bloom',b2:'lilac-bloom',b3:'lilac-letter',b4:'lilac-party',b5:'lilac-day',b6:'lilac-party',b7:'violet-night',b8:'lilac-letter',b9:'violet-night',b10:'lilac-day',b11:'lilac-day',b12:'lilac-photo'})[art.vibe]||'lilac-bloom';
}
function studioNestedPoster(key,x,y,width,height){return posterSVG(key).replace('width="600" height="800"',`x="${x}" y="${y}" width="${width}" height="${height}"`);}
function studioMaterialSVG(p){
 const id='material-'+(++materialPreviewInstance);const ink='#66517F';
 const kind=p.kind==='up'?'photo':p.kind==='tpl'?'template':'element';
 let body='';
 const heading=(left,right)=>`<text x="30" y="35" font-family="Geist,Microsoft YaHei,sans-serif" font-size="10" fill="${ink}" letter-spacing="1.5">${left}</text><text x="570" y="35" text-anchor="end" font-family="Geist,Microsoft YaHei,sans-serif" font-size="10" fill="${ink}" letter-spacing="1">${right}</text>`;
 if(kind==='template'&&/袋/.test(p.name||'')){
  body=heading('BAG STUDY / 袋面示意','LULU PURPLE');
  body+=`<ellipse cx="310" cy="371" rx="167" ry="20" fill="#BCA8D2" opacity=".22"/><path d="M249 151V102c0-76 131-76 131 0v49" fill="none" stroke="#C0AFD0" stroke-width="16"/><path d="M220 153V111c0-77 130-77 130 0v42" fill="none" stroke="#E5DCEC" stroke-width="16"/><path d="M159 133h292l23 229q-164 26-338 0Z" fill="#FCFAF6" stroke="#D7C9E0" stroke-width="2"/><path d="M159 133h292v17H159Z" fill="#EAE1F0"/>`;
  body+=studioNestedPoster(studioPosterKeyFor(p),240,174,130,173);
  body+=`<path d="m481 295 46-10 21 59-45 11Z" fill="#D5C5E8"/><path d="m488 302 16 48" stroke="#B89BD0"/><text x="30" y="393" font-family="Geist,Microsoft YaHei,sans-serif" font-size="11" fill="${ink}">袋面版式参考 · 露紫主调</text>`;
 }else if(kind==='template'){
  body=heading('LAYOUT STUDY / 版式参考','LULU PURPLE');
  body+=`<path d="m106 100 174-30 48 269-176 30Z" fill="#D7C6E9"/><path d="m392 75 100 20-39 240-100-18Z" fill="#E1D6ED"/>`;
  body+=studioNestedPoster(studioPosterKeyFor(p),190,61,221,295);
  body+=`<path d="M444 337h96M444 345h62" stroke="#B59DCA" stroke-width="2"/><text x="30" y="393" font-family="Geist,Microsoft YaHei,sans-serif" font-size="11" fill="${ink}">完整版式参考 / POSTER STUDY</text>`;
 }else if(kind==='photo'){
  body=heading('PHOTO REFERENCE / 原图待上传',esc(p.id||''));
  body+=`<path d="m126 99 318-24 22 263-318 25Z" fill="#CBB9DE" opacity=".65"/><rect x="142" y="73" width="317" height="277" rx="4" fill="#FFFEFC" stroke="#DACFE3"/><rect x="156" y="87" width="289" height="212" fill="url(#${id}-wash)"/><path d="M156 267c79-59 172-60 289-22v54H156Z" fill="#C4AFDA" opacity=".6"/><g transform="translate(307 174)" fill="#EDE5F6"><ellipse cy="-30" rx="20" ry="48"/><ellipse cy="-30" rx="20" ry="48" transform="rotate(72)"/><ellipse cy="-30" rx="20" ry="48" transform="rotate(144)"/><ellipse cy="-30" rx="20" ry="48" transform="rotate(216)"/><ellipse cy="-30" rx="20" ry="48" transform="rotate(288)"/><circle r="13" fill="#F5EBD3"/></g><text x="300" y="282" text-anchor="middle" font-family="Geist,Microsoft YaHei,sans-serif" font-size="16" fill="${ink}">原图待上传</text><text x="159" y="329" font-family="Geist,Microsoft YaHei,sans-serif" font-size="11" fill="${ink}">照片参考位 · 保留文件名，等待替换</text><path d="m263 63 82 0-3 29-77-2Z" fill="#DCCEEA" opacity=".8"/>`;
  body+=`<text x="30" y="393" font-family="Geist,Microsoft YaHei,sans-serif" font-size="11" fill="${ink}">当前为示意图，未提供原始照片</text>`;
 }else{
  body=heading('ELEMENT STUDY / 元素参考','LULU PURPLE');
  body+=`<path d="m104 104 127-13 14 137-129 12Z" fill="#FAF7FD" stroke="#DDCEEA"/><path d="m395 187 94-32 43 135-94 26Z" fill="#FAF7FD" stroke="#DDCEEA"/><path d="m180 74 65 30-40 87-63-29Z" fill="#D8C7E9"/>`;
  body+=`<g fill="#BCA3D4" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"><path d="m166 129 11 28 29 11-29 11-11 29-11-29-29-11 29-11Z"/><path d="m456 208 8 20 22 8-22 8-8 22-8-22-20-8 20-8Z"/></g><g transform="translate(307 237)"><ellipse cx="-74" cy="10" rx="20" ry="13" fill="#A890BE" transform="rotate(-20 -74 10)"/><ellipse cx="-39" cy="49" rx="23" ry="13" fill="#A890BE" transform="rotate(25 -39 49)"/><ellipse cx="38" cy="48" rx="23" ry="13" fill="#A890BE" transform="rotate(-25 38 48)"/><circle cx="89" cy="-17" r="29" fill="#BAA4CE" stroke="#fff" stroke-width="8"/><ellipse rx="83" ry="61" fill="#CDB8E3" stroke="#fff" stroke-width="8"/><path d="m0-40 35 20-2 40L0 39-36 19l0-39Z" fill="#B59ACF"/><circle cx="99" cy="-23" r="3" fill="#66517F"/></g><text x="30" y="393" font-family="Geist,Microsoft YaHei,sans-serif" font-size="11" fill="${ink}">贴纸与点缀示意 · 不是已上传的原始素材</text>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" role="img" aria-label="${esc(p.name||'素材')} · ${kind==='photo'?'原图待上传，当前为参考示意':'露紫风格示意'}" data-preview-kind="${kind}"><defs><linearGradient id="${id}-wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#EDE4F8"/><stop offset="1" stop-color="#C6B0DF"/></linearGradient></defs><rect width="600" height="420" rx="8" fill="url(#${id}-wash)"/><path d="M-40 352C160 252 405 445 650 228" fill="none" stroke="#F9F6FF" stroke-width="34" opacity=".4"/><circle cx="543" cy="81" r="45" fill="#F6F1FB" opacity=".35"/>${body}</svg>`;
}
function studioMaterialPreview(p){return p.dataUrl?`<img src="${esc(p.dataUrl)}" alt="${esc(p.name)}">`:p.posterKey?posterSVG(p.posterKey):studioMaterialSVG(p);}
const UPLOAD_LIMITS={bytes:8*1024*1024,count:6,types:['image/jpeg','image/png','image/webp']};
function uploadFileError(file){if(!UPLOAD_LIMITS.types.includes(file.type))return '仅支持 JPG、PNG、WebP；HEIC 请先转换格式。';if(file.size>UPLOAD_LIMITS.bytes)return '单张图片不能超过 8 MB。';if(!file.size)return '图片为空，请重新选择。';return '';}
function uploadCanSubmit(st){return !!st&&['up','upload'].includes(st.tab)&&!!st.up&&st.up.length>0&&!st.uploadBusy;}
upPane=function(){const st=S.submit||{};return `<div class="studio-upload"><input id="upload-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden><button type="button" class="up-drop" data-act="fake-upload" id="up-drop" ${st.uploadBusy?'disabled':''}>${uiIcon('upload',30)}<b>${st.uploadBusy?'正在读取图片…':'把你的图放进来'}</b><span>点击选择，或拖动图片到这里</span><small>JPG / PNG / WebP · 单张最多 8 MB · 每次最多 6 张</small></button><p class="upload-error" role="alert">${esc(st.uploadError||'')}</p><div class="upload-feedback" aria-live="polite">${st.up&&st.up.length?`已选择 ${st.up.length} 张 · 仅在本页面保存，不会上传到服务器`:''}</div><div class="upload-previews">${(st.up||[]).map(u=>`<div class="upload-preview"><img src="${esc(u.dataUrl)}" alt="${esc(u.name)}"><div><b>${esc(u.name)}</b><small>${u.width} × ${u.height} px · ${u.size}</small></div><button class="icon-button" data-act="remove-upload" data-id="${u.id}" aria-label="移除 ${esc(u.name)}">${uiIcon('close',16)}</button></div>`).join('')}</div>${st.up&&st.up.length?`<label class="upload-label" for="up-note">为这组图片补一句说明 <small>选填</small></label><input class="input" id="up-note" value="${esc(st.upNote||'')}" placeholder="例如：这是同系列的原图，想用来做主视觉" maxlength="80">`:''}</div>`;};
syncSubmitPts=function(){const st=S.submit;if(!st)return;const pts=$('#submit-pts');if(pts)pts.textContent=({tpl:8,agent:12,upload:10,up:10})[st.tab]||0;const btn=$('#submit-btn');if(btn){btn.disabled=st.tab==='tpl'?!st.tpl:!uploadCanSubmit(st);btn.textContent=st.uploadBusy?'正在读取图片…':st.target==='review'?'确认提交到稿件评审':'确认提交到灵感池';}};
pickUploads=function(){const input=$('#upload-file-input');if(input)input.click();};
async function handleUploadFiles(files){
 const st=S.submit;if(!st||st.uploadBusy)return;st.uploadBusy=true;st.uploadError='';paintSubmit();
 const problems=[];try{for(const file of Array.from(files)){
  if((st.up||[]).length>=UPLOAD_LIMITS.count){problems.push('每次最多选择 6 张图片。');break;}
  const error=uploadFileError(file);if(error){problems.push(`${file.name}：${error}`);continue;}
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('文件读取失败'));r.readAsDataURL(file);});
  const dims=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>reject(Error('图片无法解码，请检查格式或文件是否损坏'));img.src=dataUrl;});
  if(S.submit!==st)return;
  st.up=st.up||[];st.up.push({id:'U-'+Date.now()+'-'+st.up.length,name:file.name,size:file.size<1024*1024?(file.size/1024).toFixed(1)+' KB':(file.size/1024/1024).toFixed(2)+' MB',tag:'用户选择的图片',dataUrl,...dims,vibe:'b2',pose:'front'});
 }}catch(e){problems.push(e.message||'读取图片失败，请重试');}finally{st.uploadBusy=false;st.uploadError=problems.join(' ');if(S.submit===st)paintSubmit();}
}
addPool=function(entry,base,o={}){if(S.pool.some(p=>p.id===entry.id)){const baseId=entry.id;let suffix=1;while(S.pool.some(p=>p.id===baseId+'-'+suffix))suffix++;entry.id=baseId+'-'+suffix;}S.pool.unshift(entry);S.lastSubmittedPoolId=entry.id;addHeart(base,o.heartReason||'提交灵感',{from:o.by,silent:true});if(o.chatMine)pushChat({by:ME,text:o.chatMine,t:nowTime()});if(o.chatSys)pushChat({sys:true,text:o.chatSys});paintPoolEntry();if(S.poolOpen)paintPoolDrawer();paintStudioShell();};
paintSubmitPosted=function(el){if(S.submit&&S.submit.posted&&['up','upload'].includes(S.submit.posted.tab)){const body=$('#submit-body');if(!body)return;body.innerHTML=`<div class="upload-success">${uiIcon('check',36)}<h2>${S.submit.target==='review'?'稿件已加入评审':'图片已加入灵感池'}</h2><p>原图预览与说明保留在本页面中，尚未发送到真实群聊。</p><button class="btn btn-primary" data-act="studio-upload-done">${S.submit.target==='review'?'查看刚提交的稿件':'查看刚提交的素材'} ${uiIcon('arrow',16)}</button></div>`;const foot=document.querySelector('.submit-foot');if(foot)foot.hidden=true;return;}if(S.submit&&S.submit.posted&&S.submit.posted.isTpl){const st=S.submit;const body=$('#submit-body');if(!body)return;body.innerHTML=`<div class="upload-success template-success">${uiIcon('check',30)}<h2>版式参考已加入灵感池</h2><div class="template-success-art">${tplThumb(st.posted.tpl,true)}</div><p>「${esc(st.posted.tpl.name)}」保留了完整预览与模板来源，大家可以在它的基础上继续讨论。</p><button class="btn btn-primary" data-act="studio-upload-done">查看刚提交的版式 ${uiIcon('arrow',16)}</button></div>`;const foot=document.querySelector('.submit-foot');if(foot)foot.hidden=true;return;}studioLegacy.paintSubmitPosted(el);};
likeArt=function(...args){studioLegacy.likeArt(...args);const a=S.arts.find(x=>x.id===args[0]);const btn=document.querySelector(`.art-heart[data-art="${args[0]}"][data-review]`);if(a&&btn)btn.innerHTML=uiIcon('heart',17)+`<span>${a.likes.length} 人支持</span>`;};
doSubmit=function(el){
 const st=S.submit;if(!st||st.target!=='review')return studioLegacy.doSubmit(el);
 if(st.view==='posted'||!uploadCanSubmit(st))return;
 for(const u of st.up){const id='A'+(S.arts.length+1);S.lastSubmittedArtId=id;S.arts.push({id,author:ME,note:(st.upNote||'').trim()||u.name,up:true,likes:[],vibe:'b2',pose:'front',side:'c',kw:['用户上传','待评审'],dataUrl:u.dataUrl,width:u.width,height:u.height});S.artPos[id]={x:30+((S.arts.length-1)%4)*240,y:30+Math.floor((S.arts.length-1)/4)*340};}
 st.view='posted';st.posted={tab:'upload',name:st.up[0].name};pushChat({sys:true,text:`${P(ME).name} 向本地稿件评审提交了 ${st.up.length} 张图片；尚未发送到真实群聊`});paintStudioShell();paintSubmitPosted(el);
};
artSVG=function(art,opts={}){return art.dataUrl?`<svg viewBox="0 0 ${art.width||220} ${art.height||232}" role="img" aria-label="${esc(art.note||art.name||'用户上传图片')}"><image href="${esc(art.dataUrl)}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/></svg>`:posterSVG(studioPosterKeyFor(art));};
// Keep legacy source material intact; normalize only decorative UI pictographs.
function normalizeUI(root=document.body){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 const emoji=/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D]/gu;
 for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest('script,style,svg,textarea,input,#chat-msgs,.ps-story,.ps-kw,.pool-card h3,.credit-desc,.art-note,.review-card-body h2,.cs-card .tx,.pool-cmt'))continue;if(!emoji.test(node.textContent)){emoji.lastIndex=0;continue;}emoji.lastIndex=0;const clean=node.textContent.replace(emoji,'').trim();if(!clean&&parent.tagName==='BUTTON'&&!parent.querySelector('svg')){const label=parent.title||parent.getAttribute('aria-label')||'操作';parent.setAttribute('aria-label',label);node.textContent='';parent.insertAdjacentHTML('afterbegin',uiIcon(/关闭|收起/.test(label)?'close':/发/.test(label)?'arrow':'plus'));}else node.textContent=node.textContent.replace(emoji,'');}
}
const normalizeObserver=new MutationObserver(()=>{normalizeObserver.disconnect();normalizeUI();normalizeObserver.observe(document.body,{childList:true,subtree:true});});
render=function(){studioLegacy.render();document.body.classList.toggle('gate-flow',!!S.seedFlow);paintStudioShell();normalizeUI();};
startAmbient=function(){stopAmbient();};moveCursor=function(){};heartBurst=function(){};
document.addEventListener('change',e=>{if(e.target.id==='upload-file-input')handleUploadFiles(e.target.files);});
for(const event of ['dragenter','dragover'])document.addEventListener(event,e=>{const drop=e.target.closest('.up-drop');if(drop){e.preventDefault();drop.classList.add('hot');}});
document.addEventListener('dragleave',e=>{const drop=e.target.closest('.up-drop');if(drop&&!drop.contains(e.relatedTarget))drop.classList.remove('hot');});
document.addEventListener('drop',e=>{const drop=e.target.closest('.up-drop');if(drop){e.preventDefault();drop.classList.remove('hot');handleUploadFiles(e.dataTransfer.files);}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;switch(el.dataset.act){
 case 'studio-nav':{const v=el.dataset.v;if(v==='home'){S.stage=1;}else if(v==='delivery'){if(!S.final.picked){toast('最终版确认后，在这里查看交付与归档。');return;}S.stage=3;}else{S.stage=2;S.boardView=v;S.browseUnlocked=true;S.browseByMember[ME]=true;}render();break;}
 case 'studio-layout':S.boardLayout=el.dataset.v;render();break;
 case 'studio-open-templates':document.body.classList.remove('gate-flow');S.seedFlow=false;openSubmit('tpl');break;
 case 'poster-preview':openPosterPreview(el.dataset.tpl);break;
 case 'close-poster-preview':if(!el.classList.contains('sheet-mask')||!e.target.closest('.sheet'))$('#sheet-host').innerHTML='';break;
 case 'studio-art-upload':openSubmit('upload');S.submit.target='review';paintSubmit();break;
 case 'view-art':openArt(el.dataset.art);break;
 case 'remove-upload':if(S.submit&&!S.submit.uploadBusy){S.submit.up=S.submit.up.filter(u=>u.id!==el.dataset.id);paintSubmit();}break;
 case 'studio-upload-done':{const target=S.submit&&S.submit.target;closeSubmit();S.stage=2;S.boardView=target==='review'?'done':'pool';render();requestAnimationFrame(()=>{const card=document.querySelector(target==='review'?`.review-card[data-art="${S.lastSubmittedArtId}"]`:`[data-pool="${S.lastSubmittedPoolId}"]`);if(card)card.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});});break;}
 }});
stopAmbient();S.stage=1;S.boardLayout='grid';S.inspirationChoiceOpen=false;render();normalizeObserver.observe(document.body,{childList:true,subtree:true});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.poster-preview-mask')){$('#sheet-host').innerHTML='';e.preventDefault();}});
