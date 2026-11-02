/* In-page workspace: creation, assistant and discussion share one content surface. */
'use strict';
const AssistantTools=window.XDPAssistant;
const workLegacy={render,paintStudioShell,paintChat,paintConsensus,paintShotVote,openMe,openQuests,artSVG,studioMaterialPreview,poolCardHTML,syncSubmitPts,paintSubmitPosted,poolPanelHTML,reviewGridHTML};
const WORK={page:null,back:null,goal:'',engine:'local',consent:false,selected:new Set(),busy:false,plan:null,dirty:false,posted:null,error:'',status:null,steps:[],compact:false,voiceConsent:false,voiceMessage:'',interim:'',listening:false,speaking:false,copyDirty:false};
const WORK_NAV=[
 {key:'home',label:'概览',icon:'grid'},
 {key:'pool',label:'灵感池',icon:'note'},
 {key:'create',label:'创作台',icon:'logo'},
 {key:'done',label:'评审',icon:'image'},
 {key:'discussion',label:'讨论',icon:'message'}
];
const WORK_MODES=[{key:'assistant',label:'助手起稿'},{key:'tpl',label:'选模板'},{key:'upload',label:'上传素材'}];
function workHeader(kicker,title,sub){return `<header class="work-heading"><div><span class="studio-eyebrow">${kicker}</span><h1>${title}</h1><p>${sub}</p></div></header>`;}
function workNav(){
 const active=WORK.page==='assistant'?'assistant':S.submit?.tab;
 return `<nav class="work-tabs" aria-label="创作方式">${WORK_MODES.map(mode=>`<button data-act="${mode.key==='assistant'?'work-page':'work-compose'}" ${mode.key==='assistant'?'data-page="assistant"':`data-tab="${mode.key}"`} class="${active===mode.key?'on':''}" aria-current="${active===mode.key?'page':'false'}">${mode.label}</button>`).join('')}</nav>`;
}
function clearWorkOverlays(){document.body.classList.remove('submit-open','chat-open','pool-open','gate-flow');for(const id of ['#submit-host','#sheet-host','#cons-host','#edit-host']){const h=$(id);if(h)h.innerHTML='';}S.chatOpen=false;S.seedFlow=false;}
function workEnter(page){stopWorkVoice();clearWorkOverlays();WORK.page=page;paintStudioShell();paintWorkspace();if(page==='assistant')checkAssistantServer();}
function workBack(){stopWorkVoice();WORK.page=null;WORK.back=null;clearWorkOverlays();S.consOpen=false;S.shotVoteOpen=false;render();}
function workCurrentNav(){
 if(WORK.page==='discussion')return 'discussion';if(WORK.page==='remix')return 'done';
 if(WORK.page==='compose'&&S.submit?.target==='review'||WORK.page==='consensus'||WORK.page==='detail'&&WORK.back==='board')return 'done';
 if(['assistant','compose','detail'].includes(WORK.page))return 'create';
 return S.stage===1?'home':S.stage>=3?'done':S.boardView;
}
function workNavMarkup(mobile=false){
 const current=workCurrentNav();
 return WORK_NAV.map(item=>{const create=item.key==='create',discussion=item.key==='discussion',count=item.key==='pool'?S.pool.length:item.key==='done'?S.arts.length:null;
 return `<button class="studio-nav ${current===item.key?'active':''}" data-nav-key="${item.key}" data-act="${create||discussion?'work-page':'studio-nav'}" ${create||discussion?`data-page="${create?'assistant':'discussion'}"`:`data-v="${item.key}"`} ${current===item.key?'aria-current="page"':''}>${uiIcon(item.icon)}<span>${item.label}</span>${!mobile&&count!==null?`<small>${count}</small>`:''}</button>`;}).join('');
}
paintStudioShell=function(){
 workLegacy.paintStudioShell();
 const nav=document.querySelector('#studio-sidebar nav');if(nav)nav.innerHTML=workNavMarkup();
 const mobile=$('#studio-mobile-nav');if(mobile)mobile.innerHTML=workNavMarkup(true);
 const bottom=document.querySelector('#studio-sidebar .sidebar-bottom');if(bottom)bottom.innerHTML=`<button class="studio-nav" data-act="open-me">${avatar(ME,'av-sm')}<span>我的贡献</span></button><div class="local-demo"><i></i>本地演示 · 刷新后重置</div>`;
 const chat=document.querySelector('.topbar .chat-toggle');if(chat)chat.hidden=true;
 const current=workCurrentNav(),location=$('#studio-location');if(location)location.textContent=WORK.page==='remix'?'海报二创':WORK.page==='detail'?'作品详情':WORK.page==='sheet'?'我的贡献':WORK.page==='consensus'?'共同决定':WORK_NAV.find(n=>n.key===current)?.label||'概览';
};
render=function(){workLegacy.render();if(WORK.page)paintWorkspace();};
function paintWorkspace(){
 const host=$('#stage-host');if(!host)return;
 if(WORK.page==='remix'){paintRemix();return;}
 if(WORK.page==='compose'){paintSubmit();return;}
 if(WORK.page==='assistant'){paintAssistant();return;}
 if(WORK.page==='discussion'){
  host.innerHTML=`<section class="stage"><div class="studio-content work-content">${workHeader('ROOM NOTES / DISCUSS','房间讨论','历史讨论保留原文；新消息仅保存在当前页面，不会发送到真实群聊。')}<section class="work-discussion"><div id="work-chat-feed">${S.chat.map(gmHTML).join('')}</div><form id="work-chat-form" class="work-chat-compose"><label for="work-chat-input">补充一句想法</label><div><input id="work-chat-input" class="input" maxlength="500" placeholder="关于素材、版式或下一步…"><button class="btn btn-primary" type="submit">记录</button></div></form></section></div></section>`;
 }
}
openSubmit=function(tab){
 if(['ai','agent'].includes(tab)){workEnter('assistant');return;}
 S.submit=S.submit&&S.submit.view!=='posted'?S.submit:{tab:'tpl',tpl:null,kw:[],prompt:'',up:[],view:'pick'};
 S.submit.tab=tab||'tpl';S.submit.target='pool';workEnter('compose');
};
closeSubmit=function(){S.submit=null;workBack();};
function composerReceipt(st){
 if(st.view!=='posted')return '';
 const review=st.target==='review',tpl=st.tab==='tpl',count=tpl?1:st.up?.length||1;
 return `<div class="composer-receipt" role="status" id="composer-receipt" tabindex="-1">${uiIcon('check',20)}<div><b>${review?'已提交评审':tpl?'版式已加入灵感池':count+' 张图片已加入灵感池'}</b><p>署名与来源已保留；数据仍只保存在当前页面。</p></div><button class="text-button" data-act="work-receipt-view">${review?'查看稿件':'在灵感池查看'}</button><button class="text-button" data-act="work-compose-reset">${tpl?'继续选择':'继续上传'}</button></div>`;
}
tplPane=function(){
 const st=S.submit||{},filter=POSTER_TONES.some(x=>x[0]===st.tplType)?st.tplType:'all';
 const list=STUDIO_POSTERS.filter(t=>filter==='all'||t.tone===filter),chosen=STUDIO_POSTERS.find(t=>t.id===st.tpl);
 return `<div class="work-template-layout"><section><div class="mode-section-title"><h2>选择一套版式</h2><p>点击模板，在同页查看预览；选定后再加入灵感池。</p></div><div class="poster-style-filter" aria-label="模板风格">${POSTER_TONES.map(([v,label])=>`<button data-act="tpl-type" data-t="${v}" class="${filter===v?'on':''}" aria-pressed="${filter===v}">${label}</button>`).join('')}</div><div class="tpl-grid work-template-grid">${list.map(t=>`<button class="tpl-card ${st.tpl===t.id?'on':''}" data-act="pick-tpl" data-tpl="${t.id}" aria-label="选择${esc(t.name)}" aria-pressed="${st.tpl===t.id}">${tplThumb(t)}<span class="tpl-meta"><b>${esc(t.name)}</b><span>${esc(t.sub)}</span></span></button>`).join('')}</div></section><aside class="work-template-preview" id="work-template-preview" aria-label="版式预览">${chosen?`<span class="studio-eyebrow">已选版式</span><h2>${esc(chosen.name)}</h2><div class="work-template-art">${posterSVG(chosen.posterKey)}</div><p>${esc(chosen.sub)}</p><p class="work-note">${chosen.needsPhoto?'照片区待替换为有权使用的原图。':'原创插画版式参考，尚未定稿。'}</p><button class="btn btn-primary" data-act="submit-do" id="submit-btn">加入灵感池</button>`:`<div class="template-empty">${uiIcon('image',32)}<h2>先选一套版式</h2><p>这里会显示完整海报，选择不会自动发布。</p></div>`}</aside></div>`;
};
syncSubmitPts=function(){workLegacy.syncSubmitPts();const btn=$('#submit-btn'),st=S.submit;if(!btn||!st)return;btn.disabled=st.view==='posted'||st.uploadBusy||(st.tab==='tpl'?!st.tpl:!uploadCanSubmit(st));btn.textContent=st.uploadBusy?'正在读取图片…':st.view==='posted'?'已提交':st.target==='review'?'提交评审':'加入灵感池';};
paintSubmit=function(){
 const st=S.submit;if(!st||WORK.page!=='compose')return;
 const note=$('#up-note');if(note)st.upNote=note.value;
 const review=st.target==='review';
 $('#stage-host').innerHTML=`<section class="stage"><div class="studio-content work-content">${workHeader('CREATE / WORKSPACE',review?'提交稿件':'创作台',review?'上传完成的稿件，保留原图和说明。':'从一个想法、一套版式或已有图片开始；确认后再发布。')}${review?'<button class="text-button review-context-back" data-act="work-review-back">返回评审</button>':workNav()}<section class="work-composer" id="submit-panel">${composerReceipt(st)}<div class="submit-body" id="submit-body">${st.tab==='tpl'?tplPane():upPane()}</div>${st.tab==='tpl'?'':`<footer class="submit-foot"><span id="submit-hint">图片只保存在本页面，不发送给 AI 或服务器</span><div class="grow"></div><button class="btn btn-primary" data-act="submit-do" id="submit-btn" disabled>加入灵感池</button></footer>`}</section></div></section>`;
 syncSubmitPts();normalizeUI();
};
paintSubmitPosted=function(el){if(WORK.page!=='compose')return workLegacy.paintSubmitPosted(el);paintSubmit();requestAnimationFrame(()=>{const receipt=$('#composer-receipt');receipt?.scrollIntoView({block:'nearest',behavior:reduceMotion()?'auto':'smooth'});receipt?.focus({preventScroll:true});});};
function showWorkDetail(title,body,back='compose'){
 stopWorkVoice();WORK.back=back;WORK.page='detail';clearWorkOverlays();paintStudioShell();
 $('#stage-host').innerHTML=`<section class="stage"><div class="studio-content work-content">${workHeader('LOOK CLOSER / PREVIEW',esc(title),'在当前工作区查看，返回后保留你的选择。')}<button class="text-button detail-back" data-act="work-detail-back">返回上一页</button>${body}</div></section>`;
}
openPosterPreview=function(id){if(!S.submit)openSubmit('tpl');S.submit.tpl=id;paintSubmit();requestAnimationFrame(()=>$('#work-template-preview')?.scrollIntoView({block:'nearest',behavior:reduceMotion()?'auto':'smooth'}));};
openArt=function(id){const a=S.arts.find(x=>x.id===id);if(!a)return;showWorkDetail(a.note||id,`<div class="work-art-detail"><div>${artSVG(a)}</div><section><span class="studio-eyebrow">${esc(id)} / 稿件评审</span><h2>${esc(a.note)}</h2><p>提交者：${esc(P(a.author).name)}</p><p>${esc((a.kw||[]).join(' · '))}</p><button class="btn btn-primary" data-act="like" data-art="${esc(id)}">${a.likes.includes(ME)?'已支持':'支持这一稿'}</button><p>最终决定仍由主办确认。</p>${stickyHTML(id)}</section></div>`,'board');};
function inlineLegacySheet(){
 const sheet=document.querySelector('#sheet-host .sheet');if(!sheet)return;
 WORK.page='sheet';sheet.classList.add('work-inline-sheet');sheet.removeAttribute('aria-modal');sheet.setAttribute('role','region');sheet.querySelectorAll('[data-act="close-sheet"]').forEach(x=>x.remove());
 $('#stage-host').innerHTML=`<section class="stage"><div class="studio-content work-content">${workHeader('PROJECT NOTES / ROOM','项目记录','成员贡献、任务与来源集中留在这里。')}<button class="text-button detail-back" data-act="work-back">返回房间</button><div id="work-sheet-content"></div></div></section>`;
 $('#work-sheet-content').appendChild(sheet);$('#sheet-host').innerHTML='';paintStudioShell();
}
openMe=function(){workLegacy.openMe();inlineLegacySheet();};openQuests=function(){workLegacy.openQuests();inlineLegacySheet();};
function inlineDecision(fn){fn();const sheet=document.querySelector('#cons-host .sheet');if(!sheet)return;WORK.page='consensus';sheet.classList.add('work-inline-sheet');sheet.removeAttribute('aria-modal');sheet.setAttribute('role','region');$('#stage-host').innerHTML=`<section class="stage"><div class="studio-content work-content">${workHeader('MAKE A DECISION / TOGETHER','共同决定','提名、投票与主办确认在同一工作区内完成。')}<div id="work-decision-content"></div></div></section>`;$('#work-decision-content').appendChild(sheet);$('#cons-host').innerHTML='';paintStudioShell();}
paintConsensus=function(){inlineDecision(workLegacy.paintConsensus);};paintShotVote=function(){inlineDecision(workLegacy.paintShotVote);};
paintChat=function(){workLegacy.paintChat();if(WORK.page==='discussion')paintWorkspace();};
agentWrapHTML=function(){return `<section class="assistant-request"><h2>设计助手已迁移到工作台</h2><p>在页面内整理需求、运行工具和确认预览。</p><button class="btn btn-primary" data-act="work-page" data-page="assistant">打开设计助手</button></section>`;};
// Generated candidates are deterministic layout studies, not a fake AI image job.
CONS_STEPS[3]={t:'④ 生成 3 套排版示意',d:'本地工具按方向生成三套可比较的 SVG 排版，未进行人物生图或抠图；设计师仍需完善。'};
CONS_STEPS[4]={t:'⑤ 成员投票',d:'三套排版在当前页面比较，一人一票；至少五位参与后由主办截止，平票公开裁决。'};
consMakeShots=function(){
 const dir=(S.cons.options||[]).find(o=>o.id===S.cons.dir);if(!dir)return;
 S.cons.shots=['lilac-bloom','lilac-letter','lilac-party'].map((key,i)=>({id:'shot'+(i+1),pose:'front',kw:'本地排版示意 '+(i+1),votes:0,posterKey:key,svg:posterSVG(key)}));
 S.cons.votesBy={};S.cons.demoLoaded=false;S.cons.voted=false;S.cons.winnerId=null;
};
sendPoolCmt=function(id,el,text){
 const p=S.pool.find(x=>x.id===id);if(!p)return;
 const input=document.querySelector(`.pool-cmt-input[data-id="${id}"]`),value=(text??input?.value??'').trim();
 if(!value){toast('写一句再记录');return;}
 p.cmts=p.cmts||[];p.cmts.push({by:ME,text:value});S.poolCmtsOpen[id]=true;S.poolDraft[id]='';
 pushChat({by:ME,text:`关于「${p.name}」：${value}`,t:nowTime()});paintPoolDrawer();
};
function workEmptyState(kind){
 const pool=kind==='pool';return `<section class="work-empty-state">${uiIcon(pool?'note':'image',32)}<h2>${pool?'这里还没有灵感':'还没有待评审稿件'}</h2><p>${pool?'写下一句想法、选择版式，或上传原图，留下第一条有署名的参考。':'上传完成的稿件后，大家可以查看、反馈与比较。'}</p><button class="btn btn-primary" data-act="${pool?'work-page':'studio-art-upload'}" ${pool?'data-page="assistant"':''}>${pool?'创建第一条灵感':'提交第一版稿件'}</button></section>`;
}
poolPanelHTML=function(){return S.pool.length?workLegacy.poolPanelHTML().replace(/<button class="contribution-template-link[\s\S]*?<\/button>/,''):workEmptyState('pool');};
reviewGridHTML=function(){if(!S.arts.length)return workEmptyState('review');const html=workLegacy.reviewGridHTML();if(S.final.picked)return html;return html.replace('<div class="studio-review-grid">',`<div class="review-handoff-note"><b>交付归档</b><span>${S.cons?.winningArtId?'推荐稿已产生，等待主办确认最终版。':'完成稿件比较与主办确认后，最终文件和共创记录在这里归档。'}</span></div><div class="studio-review-grid">`);};
function assistantContext(){return AssistantTools.context({goal:WORK.goal,materials:S.pool.filter(p=>WORK.selected.has(p.id)).map(p=>({id:p.id,name:p.name,note:p.note,cat:p.cat,hasPhoto:!!p.dataUrl}))});}
function assistantDraftSVG(p,options={}){
 const localPhoto=options.photoUrl?{dataUrl:options.photoUrl}:S.pool.find(m=>(p.sourceIds||[]).includes(m.id)&&m.dataUrl);
 const photo=p.posterKey==='lilac-photo',letter=p.posterKey==='lilac-letter';
 const base=(options.sourceSVG||posterSVG(p.posterKey,{photoUrl:localPhoto?.dataUrl})).replace(/<text\b[\s\S]*?<\/text>/g,node=>{
  const size=Number((/font-size="([\d.]+)"/.exec(node)||[])[1]||0);
  if(photo&&!localPhoto&&/把你的原图|YOUR PHOTO/.test(node))return node;
  return size>15?'':node;
 });
 const requestedInk=p.colors?.ink||p.ink;const ink=/^#[0-9a-f]{6}$/i.test(requestedInk||'')?requestedInk:p.posterKey==='violet-night'?'#F3EAD8':'#58436F';
 const punctuation=p.headline.split(/[，,。]/).filter(Boolean),letters=[...p.headline];
 const lines=punctuation.length===2&&punctuation.every(x=>[...x].length<=8)?[punctuation[0]+'，',punctuation[1]]:[letters.slice(0,8).join(''),letters.slice(8,16).join(''),letters.slice(16,24).join('')].filter(Boolean);
 const x=letter?300:46,y=photo?103:letter?116:151,font=photo?44:lines.length===1?60:64,gap=photo?47:71;
 const sub=[...p.subtitle],subLines=[sub.slice(0,22).join(''),sub.slice(22,44).join(''),sub.slice(44,50).join('')].filter(Boolean);
 const layer=`<g fill="${ink}" font-family="XDP Poster Serif, Microsoft YaHei, serif" text-anchor="${letter?'middle':'start'}" font-weight="600">${lines.map((line,i)=>`<text x="${x}" y="${y+i*gap}" font-size="${font}" letter-spacing="1">${esc(line)}</text>`).join('')}${subLines.map((line,i)=>`<text x="${x}" y="${690+i*26}" font-size="22">${esc(line)}</text>`).join('')}</g>`;
 let result=base.replace(/<\/svg>\s*$/,layer+'</svg>');if(p.colors&&window.XDPRemix){const original=window.XDPRemix.palette(result);result=window.XDPRemix.recolor(result,original,{...original,...p.colors});}return result;
}

poolCardHTML=function(p,i=0){
 const html=workLegacy.poolCardHTML(p.draftSvg?{...p,seed:null,kind:'tpl'}:p,i);
 return p.draftSvg?html.replace('<div class="pool-card-author">',`<p class="work-provenance">${p.assistantEngine==='online'?'在线 AI 策划 · 本机排版':'离线工具排版'}${p.sourceIds?.length?' · 来源 '+p.sourceIds.map(esc).join(' / '):' · 依据文字需求'}</p><div class="pool-card-author">`):html;
};
studioMaterialPreview=function(p){return p.draftSvg||workLegacy.studioMaterialPreview(p);};
artSVG=function(p,opts){return p.draftSvg||workLegacy.artSVG(p,opts);};
function assistantSourcesHTML(ctx){
 const selected=S.pool.filter(m=>WORK.selected.has(m.id)),available=[...selected,...S.pool.filter(m=>!WORK.selected.has(m.id))].slice(0,12);
 return `<details class="assistant-source-options" id="assistant-sources-details"><summary>参考灵感 <span id="assistant-source-count" aria-live="polite">${ctx.materials.length?'已选 '+ctx.materials.length+' 条':'选填'}</span></summary><p class="work-note">仅使用勾选素材的文字；原图不发送给模型。</p><div class="source-list">${available.length?available.map(m=>`<label><input type="checkbox" data-work-source="${esc(m.id)}" ${WORK.selected.has(m.id)?'checked':''} ${WORK.busy||WORK.listening?'disabled':''}><span><b>${esc(m.name)}</b><small>${esc(m.id)}${m.kind==='up'&&!m.dataUrl?' · 原图缺失':''}</small></span></label>`).join(''):'<p class="work-note">灵感池还没有素材，直接写下需求也可以开始。</p>'}</div></details>`;
}
function assistantSettingsHTML(){
 const online=WORK.engine==='online',configured=WORK.status?.configured;
 return `<details class="assistant-settings" id="assistant-settings-details" ${online?'open':''}><summary>生成方式 <span id="assistant-generation-label">${online?!configured?'在线 AI · 未连接':WORK.consent?'在线 AI · 已授权':'在线 AI · 待授权':'本地排版 · 不联网'}</span></summary><div class="engine-controls"><label for="assistant-engine">处理方式</label><select id="assistant-engine" ${WORK.busy?'disabled':''}><option value="local" ${!online?'selected':''}>本地排版 · 不调用模型</option><option value="online" ${online?'selected':''}>在线 AI · 银河智算</option></select>${online?`<span class="engine-status">${WORK.status===null?'正在检查连接':configured?'服务已连接':'服务未连接'}</span><button class="text-button engine-recheck" data-act="work-check" ${WORK.busy?'disabled':''}>重新检查</button>`:''}</div>${online?`<div class="ai-consent"><p>将本次需求与勾选素材的文字发送给银河智算，按服务商账户计费；不发送图片、署名或群聊。</p><label><input id="assistant-consent" type="checkbox" ${WORK.consent?'checked':''} ${WORK.busy?'disabled':''}>允许发送本次文字信息</label>${!configured?'<p>请启动本机 AI 服务后重试，也可以切回本地排版。</p>':''}</div>`:''}</details>`;
}
function assistantRequestHTML(ctx){
 const p=WORK.plan,recognition=window.XDPVoice?.available()||false,online=WORK.engine==='online';
 const start=p?`<details id="assistant-input-details" class="assistant-input-shell" ${WORK.compact?'':'open'}><summary><span>本次需求</span><b>${esc(WORK.goal.length>68?WORK.goal.slice(0,68)+'…':WORK.goal)}</b><small>调整需求</small></summary>`:'<div class="assistant-input-shell">';
 return `${start}<section class="assistant-request"><div class="assistant-title"><span class="assistant-emblem">${uiIcon('logo',24)}</span><div><h2>先说说这张海报</h2><p>一句话就能开始；也可以用语音输入。</p></div></div><div class="assistant-presets">${['露紫生日海报，丰富一点但别太满','做一张奶紫咖啡派对的手提袋','夜色星光，帮我想一句生日文案'].map((v,i)=>`<button data-act="work-preset" data-i="${i}" ${WORK.busy?'disabled':''}>${esc(v)}</button>`).join('')}</div><label class="sr-only" for="assistant-goal">你的设计需求</label><textarea id="assistant-goal" maxlength="1200" rows="4" placeholder="例如：露紫主调，带一点粉蓝；标题要在远处也能看清。" ${WORK.busy||WORK.listening?'disabled':''}>${esc(WORK.goal)}</textarea><div class="voice-toolbar"><button class="btn btn-ghost btn-sm ${WORK.listening?'recording':''}" data-act="work-voice" ${!recognition||WORK.busy?'disabled':''}>${WORK.listening?'停止并转写':'开始录音'}</button><span id="voice-status" role="status">${esc(WORK.interim||WORK.voiceMessage||(!recognition?'当前浏览器不支持识别，请直接输入文字。':'识别结果先填入文本，不会自动提交。'))}</span></div><label class="voice-consent"><input type="checkbox" id="voice-consent" ${WORK.voiceConsent?'checked':''} ${WORK.listening?'disabled':''}>允许将本次录音发送给银河智算做语音转写（按服务商计费）；文字仍需你检查。</label>${assistantSourcesHTML(ctx)}${assistantSettingsHTML()}<div class="assistant-run-row"><span>${online?'在线 AI 规划 · 本机排版':'本地排版 · 不发送文字到外部服务'}</span><button class="btn btn-primary" id="assistant-run" data-act="work-run" ${WORK.busy||WORK.listening||online&&(!WORK.status?.configured||!WORK.consent)?'disabled':''}>${WORK.busy?'正在生成方案…':WORK.error?'重试生成':'生成方案'} ${uiIcon('arrow',16)}</button></div>${WORK.busy?'<p class="work-note" role="status">正在处理本次需求，完成前不会发布。</p>':''}</section>${p?'</details>':'</div>'}`;
}
function assistantAdoptLabel(){return WORK.posted?WORK.copyDirty?'更新已发布方案':'已加入灵感池':'加入灵感池';}
function assistantResultHTML(){
 const p=WORK.plan;if(!p)return '';
 return `<div class="assistant-result-layout"><section class="assistant-result" aria-label="助手方案"><div class="result-kicker"><span>${WORK.resultEngine==='online'?'在线 AI 方案':'本地排版方案'}</span><button class="text-button" data-act="work-speak">${WORK.speaking?'停止朗读':'朗读方案'}</button></div><p id="readout-status" class="readout-status" role="status">${esc(WORK.voiceMessage)}</p><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><div class="plan-copy-fields"><label>海报标题<input id="plan-headline" class="input" value="${esc(p.headline)}" maxlength="24"></label><label>海报副标题<input id="plan-subtitle" class="input" value="${esc(p.subtitle)}" maxlength="50"></label></div><p class="work-note">改字会直接更新预览，不需要重新生成。</p><details class="assistant-trace"><summary>来源与处理记录 <span>${p.sourceIds.length} 条参考</span></summary><p class="work-note">${p.sourceIds.length?'参考来源：'+p.sourceIds.map(esc).join(' / '):'本次仅依据你输入的需求。'}</p><ol class="agent-tool-log">${WORK.steps.map(step=>`<li>${uiIcon('check',15)}${esc(step)}</li>`).join('')}</ol><ul class="assistant-warnings">${p.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></details><p id="assistant-publication-status" class="publication-status" role="status">${esc(WORK.notice||'')}</p><div class="result-actions"><button class="btn btn-primary" data-act="work-adopt" ${WORK.busy||WORK.dirty||WORK.posted&&!WORK.copyDirty?'disabled':''}>${assistantAdoptLabel()}</button><button class="text-button" data-act="work-adjust">调整需求</button>${WORK.posted?'<button class="text-button" data-act="work-pool">在灵感池查看</button>':''}</div><p class="work-note" id="assistant-dirty-notice" ${WORK.dirty?'':'hidden'}>需求或参考已改变，重新生成后再发布；上一次方案仍保留。</p></section><aside class="assistant-context"><section class="assistant-preview"><header><span>版式预览</span><small>尚未定稿</small></header><div class="assistant-preview-art">${assistantDraftSVG(p)}</div><p>SVG 排版预览，未进行人物生图或抠图。</p></section></aside></div>`;
}
function paintAssistant(){
 const previous=document.querySelector('.assistant-workspace'),scroll=previous?.scrollTop||0,active=document.activeElement;
 const focus=previous?.contains(active)&&active?.id?{id:active.id,start:active.selectionStart,end:active.selectionEnd}:null;
 const openSources=$('#assistant-sources-details')?.open,openSettings=$('#assistant-settings-details')?.open;
 $('#stage-host').innerHTML=`<section class="stage assistant-workspace"><div class="studio-content work-content">${workHeader('CREATE / WORKSPACE','创作台','从一个想法、一套版式或已有图片开始；确认后再发布。')}${workNav()}<div class="assistant-flow ${WORK.plan?'has-result':''}">${assistantRequestHTML(assistantContext())}<p class="work-error" id="assistant-error" role="alert">${esc(WORK.error)}</p>${assistantResultHTML()}</div></div></section>`;
 normalizeUI();window.XDPVoice?.mount();
 const stage=document.querySelector('.assistant-workspace');if(stage)stage.scrollTop=scroll;
 if(openSources!==undefined&&$('#assistant-sources-details'))$('#assistant-sources-details').open=openSources;
 if(openSettings!==undefined&&$('#assistant-settings-details')&&!WORK.forceSettingsOpen)$('#assistant-settings-details').open=openSettings;WORK.forceSettingsOpen=false;
 if(focus){const input=$('#'+focus.id);if(input&&!input.disabled)try{input.focus({preventScroll:true});if(focus.start!==null&&typeof input.setSelectionRange==='function')input.setSelectionRange(focus.start,focus.end);}catch{}}
}
function refreshAssistantCopy(renderPreview=true){
 const preview=document.querySelector('.assistant-preview-art');if(renderPreview&&preview&&WORK.plan)preview.innerHTML=assistantDraftSVG(WORK.plan);
 const button=document.querySelector('[data-act="work-adopt"]');if(button){button.disabled=WORK.busy||WORK.dirty||!!WORK.posted&&!WORK.copyDirty;button.textContent=assistantAdoptLabel();}
 const status=$('#assistant-publication-status');if(status)status.textContent=WORK.posted&&WORK.copyDirty?'有未发布的文字修改，原卡片暂未改变。':WORK.notice||'';
 const dirtyNotice=$('#assistant-dirty-notice');if(dirtyNotice)dirtyNotice.hidden=!WORK.dirty;
 refreshAssistantRequestControls();
}
// Checkbox changes update existing controls only: keep focus, list order and animations intact.
function refreshAssistantRequestControls(){
 const count=$('#assistant-source-count');if(count){const n=assistantContext().materials.length;count.textContent=n?'已选 '+n+' 条':'选填';}
 const run=document.querySelector('[data-act="work-run"]');if(run)run.disabled=WORK.busy||WORK.listening||WORK.engine==='online'&&(!WORK.status?.configured||!WORK.consent);
 const modeLabel=$('#assistant-generation-label');if(modeLabel)modeLabel.textContent=WORK.engine==='online'?!WORK.status?.configured?'在线 AI · 未连接':WORK.consent?'在线 AI · 已授权':'在线 AI · 待授权':'本地排版 · 不联网';
}
async function checkAssistantServer(){
 if(WORK.status!==null)return;
 try{if(!/^https?:$/.test(location.protocol))throw Error();const res=await fetch('/api/agent/status',{signal:AbortSignal.timeout(4000)});if(!res.ok)throw Error();WORK.status=await res.json();}catch{WORK.status={configured:false};}
 if(WORK.page==='assistant')paintAssistant();
}
async function runWorkspaceAssistant(){
 if(WORK.busy||WORK.listening)return;const ctx=assistantContext();if(!ctx.goal){WORK.error='先写下一句想法，或选上面的示例。';paintAssistant();return;}
 WORK.error='';WORK.busy=true;paintAssistant();
 try{
  let plan;
  if(WORK.engine==='online'){
   if(!WORK.consent||!WORK.status?.configured)throw Error('请先连接服务并确认文字发送范围。');
   const res=await fetch('/api/agent/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ctx,consent:true}),signal:AbortSignal.timeout(65000)});const data=await res.json();if(!res.ok)throw Error(data.error||'请求失败，请重试。');plan=AssistantTools.normalizePlan(data.plan,ctx);
  }else plan=AssistantTools.localPlan(ctx);
  // Rendering is a real bounded tool call, not a simulated delay or image API.
  assistantDraftSVG(plan);WORK.plan=plan;WORK.steps=[`已读取 ${ctx.materials.length} 条所选素材文字`,WORK.engine==='online'?'已收到在线模型的结构化方案':'已执行本地版式与文案匹配','已生成 SVG 预览，等待确认'];WORK.resultEngine=WORK.engine;WORK.posted=null;WORK.dirty=false;WORK.compact=true;WORK.copyDirty=false;WORK.notice='';
 }catch(e){WORK.error=e.name==='TimeoutError'?'请求超时，未采用任何新结果。':e.message||'处理失败，请重试。';}
 finally{WORK.busy=false;if(WORK.page==='assistant'){paintAssistant();if(!WORK.error)requestAnimationFrame(()=>document.querySelector('.assistant-result-layout')?.scrollIntoView({block:'start',behavior:reduceMotion()?'auto':'smooth'}));}}
}
function adoptWorkspacePlan(){
 if(!WORK.plan||WORK.busy||WORK.dirty||WORK.posted&&!WORK.copyDirty)return;
 const p=WORK.plan;if(!p.headline.trim()){WORK.error='请先补上海报标题。';WORK.compact=false;paintAssistant();return;}
 const existing=WORK.posted&&S.pool.find(card=>card.id===WORK.posted);
 if(WORK.posted&&!existing){WORK.error='原卡片已不存在，请重新生成后再发布。';paintAssistant();return;}
 if(existing&&existing.by!==ME){WORK.error='请切回原提交者后修改这张卡片。';paintAssistant();return;}
 if(existing){
  existing.name=p.title;existing.note=p.headline+' · '+p.subtitle;existing.draftSvg=assistantDraftSVG(p);if(existing.seed)existing.seed.word=p.headline;
  WORK.notice='已更新原卡片，署名、来源、支持与评论均保留。';
 }else{
  const id='P-AI-'+Date.now();
  addPool({id,cat:'layout',kind:'insp',seed:{type:'layout',typeName:'版式',story:WORK.goal,feel:p.summary,word:p.headline,keys:[],layout:'center'},name:p.title,note:p.headline+' · '+p.subtitle,by:ME,likes:[],cmts:[],posterKey:p.posterKey,draftSvg:assistantDraftSVG(p),sourceIds:p.sourceIds.slice(),assistantEngine:WORK.resultEngine,taken:false},8,{heartReason:'采用助手排版方案'});
  WORK.posted=id;S.myCard=true;S.cardByMember[ME]=true;WORK.notice='已加入灵感池，可以继续修改这张卡片。';
 }
 WORK.copyDirty=false;WORK.error='';paintStudioShell();paintAssistant();
}
function voiceStatus(message){WORK.voiceMessage=message;for(const id of ['#voice-status','#readout-status']){const node=$(id);if(node)node.textContent=message;}}
function stopWorkVoice(){
 window.XDPVoice?.cancel();WORK.listening=false;WORK.interim='';if(window.speechSynthesis)window.speechSynthesis.cancel();WORK.speaking=false;
}
function startWorkVoice(){if(window.XDPVoice)return window.XDPVoice.start();voiceStatus('语音模块未加载，请使用最新版服务页面。');}
function speakWorkspacePlan(){
 if(WORK.speaking){window.speechSynthesis?.cancel();WORK.speaking=false;paintAssistant();return;}
 if(!WORK.plan||!window.speechSynthesis||!window.SpeechSynthesisUtterance){voiceStatus('当前浏览器不支持朗读。');return;}
 if(WORK.listening){voiceStatus('请先停止语音输入，再朗读方案。');return;}
 const voices=window.speechSynthesis.getVoices(),local=voices.find(v=>/^zh/i.test(v.lang)&&v.localService),voice=local||voices.find(v=>/^zh/i.test(v.lang));
 if(!voice||!voice.localService){voiceStatus('当前浏览器未提供本机中文语音，暂不能朗读。');return;}
 const utterance=new window.SpeechSynthesisUtterance(`${WORK.plan.title}。${WORK.plan.summary}。建议标题：${WORK.plan.headline}。${WORK.plan.subtitle}。`);utterance.lang='zh-CN';if(voice)utterance.voice=voice;utterance.rate=1;
 utterance.onstart=()=>{WORK.speaking=true;voiceStatus('正在朗读方案。');if(WORK.page==='assistant')paintAssistant();};
 utterance.onend=utterance.onerror=()=>{WORK.speaking=false;voiceStatus('朗读已结束。');if(WORK.page==='assistant')paintAssistant();};window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);
}
document.addEventListener('toggle',e=>{if(e.target.id==='assistant-input-details')WORK.compact=!e.target.open;},true);
function markAssistantRequestDirty(){
 WORK.consent=false;WORK.dirty=!!WORK.plan;WORK.error='';const error=$('#assistant-error');if(error)error.textContent='';
 const consent=$('#assistant-consent');if(consent)consent.checked=false;
 const run=document.querySelector('[data-act="work-run"]');if(run){if(WORK.engine==='online')run.disabled=true;if(!WORK.busy)run.textContent='生成方案';}
 refreshAssistantCopy(false);
}
document.addEventListener('input',e=>{
 const input=e.target;
 if(input.id==='assistant-goal'){WORK.goal=input.value;markAssistantRequestDirty();}
 if(['plan-headline','plan-subtitle'].includes(input.id)&&WORK.plan){
  WORK.plan[input.id==='plan-headline'?'headline':'subtitle']=input.value;WORK.copyDirty=true;refreshAssistantCopy();
 }
});
document.addEventListener('change',e=>{
 const input=e.target;
 if(input.id==='assistant-engine'){WORK.engine=input.value;WORK.consent=false;WORK.forceSettingsOpen=WORK.engine==='online';paintAssistant();}
 if(input.id==='assistant-consent'){WORK.consent=input.checked;refreshAssistantRequestControls();}
 if(input.id==='voice-consent')WORK.voiceConsent=input.checked;
 if(input.dataset.workSource){if(input.checked)WORK.selected.add(input.dataset.workSource);else WORK.selected.delete(input.dataset.workSource);markAssistantRequestDirty();}
});
function workLocatePublished(view,id){
 stopWorkVoice();clearWorkOverlays();WORK.page=null;S.stage=2;S.boardView=view;S.browseUnlocked=true;S.browseByMember[ME]=true;render();
 requestAnimationFrame(()=>{const cards=document.querySelectorAll(view==='done'?'.review-card[data-art]':'[data-pool]');const card=Array.from(cards).find(node=>(view==='done'?node.dataset.art:node.dataset.pool)===id);card?.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});});
}
document.addEventListener('submit',e=>{if(e.target.id==='work-chat-form'){e.preventDefault();const input=$('#work-chat-input'),value=input.value.trim();if(value){const message={by:ME,text:value,t:nowTime()};pushChat(message);$('#work-chat-feed').insertAdjacentHTML('beforeend',gmHTML(message));input.value='';input.focus();requestAnimationFrame(()=>input.scrollIntoView({block:'nearest',behavior:reduceMotion()?'auto':'smooth'}));}}});
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;const act=el.dataset.act;
 if(/^(ag-|seed-)/.test(act)||act==='open-art-submit'){e.preventDefault();e.stopImmediatePropagation();workEnter('assistant');return;}
 if(act==='studio-nav'){WORK.page=null;stopWorkVoice();clearWorkOverlays();return;}
 const intercepted=['pick-tpl','work-adjust','work-review-back','work-receipt-view','work-compose-reset','work-check','work-page','work-back','work-compose','work-detail-back','work-preset','work-run','work-adopt','work-pool','work-voice','work-speak','toggle-chat','open-seed','resume-seed','open-seed-menu','open-submit-ai','open-upload-direct','open-submit','studio-open-templates','studio-art-upload','submit-tab','close-submit','close-sheet','close-cons','close-shotvote'];
 if(!intercepted.includes(act))return;e.preventDefault();e.stopImmediatePropagation();
 switch(act){
  case 'pick-tpl':{
   const id=el.dataset.tpl;if(!STUDIO_POSTERS.some(t=>t.id===id))break;
   if(!S.submit)openSubmit('tpl');const st=S.submit;
   if(st.tpl!==id){st.tpl=id;st.view='pick';st.posted=null;}
   paintSubmit();requestAnimationFrame(()=>{if(window.innerWidth<768)$('#work-template-preview')?.scrollIntoView({block:'nearest',behavior:reduceMotion()?'auto':'smooth'});});break;
  }
  case 'work-adjust':WORK.compact=false;paintAssistant();requestAnimationFrame(()=>{const input=$('#assistant-goal');input?.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});input?.focus({preventScroll:true});});break;
  case 'work-review-back':workLocatePublished('done',null);break;
  case 'work-receipt-view':{const review=S.submit?.target==='review';workLocatePublished(review?'done':'pool',review?S.lastSubmittedArtId:S.lastSubmittedPoolId);break;}
  case 'work-compose-reset':{const st=S.submit;if(!st)break;S.submit={tab:st.tab,target:st.target,tpl:null,kw:[],prompt:'',up:[],view:'pick'};paintSubmit();break;}
  case 'work-check':WORK.status=null;checkAssistantServer();paintAssistant();break;
  case 'work-page':workEnter(el.dataset.page);break;
  case 'toggle-chat':workEnter('discussion');break;
  case 'work-back':case 'close-submit':case 'close-sheet':case 'close-cons':case 'close-shotvote':workBack();break;
  case 'work-compose':openSubmit(el.dataset.tab);break;
  case 'submit-tab':if(el.dataset.tab==='agent')workEnter('assistant');else{S.submit.tab=el.dataset.tab;paintSubmit();}break;
  case 'open-seed':case 'resume-seed':case 'open-seed-menu':case 'open-submit-ai':workEnter('assistant');break;
  case 'studio-open-templates':case 'open-submit':openSubmit('tpl');break;
  case 'open-upload-direct':openSubmit('upload');break;
  case 'studio-art-upload':openSubmit('upload');S.submit.target='review';paintSubmit();break;
  case 'work-detail-back':if(WORK.back==='board'){workBack();S.stage=2;S.boardView='done';render();}else{WORK.page=WORK.back||'compose';paintWorkspace();paintStudioShell();}break;
  case 'work-preset':WORK.goal=['露紫生日海报，丰富一点但别太满','做一张奶紫咖啡派对的手提袋','夜色星光，帮我想一句生日文案'][Number(el.dataset.i)];WORK.dirty=!!WORK.plan;WORK.consent=false;paintAssistant();break;
  case 'work-run':runWorkspaceAssistant();break;
  case 'work-adopt':adoptWorkspacePlan();break;
  case 'work-pool':workLocatePublished('pool',WORK.posted);break;
  case 'work-voice':startWorkVoice();break;
  case 'work-speak':speakWorkspacePlan();break;
 }
},true);
window.addEventListener('pagehide',stopWorkVoice);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWorkVoice();if(WORK.page==='assistant')paintAssistant();}});
// Workspace initialization (kept last so pure VM tests can omit startup).
const workSheetObserver=new MutationObserver(()=>{if(document.querySelector('#sheet-host .sheet'))inlineLegacySheet();});
if($('#sheet-host'))workSheetObserver.observe($('#sheet-host'),{childList:true});
paintStudioShell();
