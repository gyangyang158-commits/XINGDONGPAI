/* Bounded planning tools shared by the browser and the local AI gateway. */
(function(root){
 'use strict';
 const KEYS=['lilac-bloom','lilac-letter','lilac-party','lilac-day','violet-night','lilac-photo'];
 const text=(v,n=300)=>typeof v==='string'?v.replace(/[\u0000-\u0008]/g,'').slice(0,n).trim():'';
 function context(input={}){
  return {goal:text(input.goal,1200),materials:(Array.isArray(input.materials)?input.materials:[]).slice(0,12).filter(m=>m&&typeof m==='object').map(m=>({id:text(m.id,50),name:text(m.name,100),note:text(m.note,300),cat:text(m.cat,30),hasPhoto:m.hasPhoto===true})).filter(m=>m.id)};
 }
 function requestedColors(goal){
  const colors={};for(const [key,words] of [['background','背景|底色'],['accent','强调色|插画色'],['ink','文字色|字体颜色']]){const match=new RegExp('(?:'+words+')[^#\\n]{0,12}(#[0-9a-f]{6})','i').exec(goal);if(match)colors[key]=match[1].toUpperCase();}
  if(!colors.background){const named=/(?:背景|底色)[^，。\n]{0,12}(紫色|浅蓝|蓝色|粉色|奶油|绿色|黑色|白色|红色|黄色|橙色)/.exec(goal);if(named)colors.background=({'紫色':'#E6DDF3','浅蓝':'#DDEFFA','蓝色':'#DDEFFA','粉色':'#FAE0E9','奶油':'#FAEFD8','绿色':'#E1EFE5','黑色':'#352D4B','白色':'#FFFDF9','红色':'#F3D0D5','黄色':'#FAEFC9','橙色':'#F9D9BF'})[named[1]];}
  if(colors.background==='#352D4B'&&!colors.ink)colors.ink='#F3EAD8';return Object.keys(colors).length?colors:undefined;
 }
 function validColors(value,fallback){if(!value||typeof value!=='object')return fallback;const colors={};for(const key of ['background','accent','ink'])if(/^#[0-9a-f]{6}$/i.test(value[key]||''))colors[key]=value[key].toUpperCase();return Object.keys(colors).length?colors:fallback;}
 function localPlan(input){
  const c=context(input),q=c.goal;
  const style=s=>/夜|星空|星光/.test(s)?'violet-night':/派对|咖啡|袋|热闹/.test(s)?'lilac-party':/信|祝福|文字/.test(s)?'lilac-letter':/自然|清晨|花园/.test(s)?'lilac-day':/照片|人像/.test(s)?'lilac-photo':null;
  const key=style(q)||style(c.materials.map(m=>m.name+' '+m.note).join(' '))||'lilac-bloom';
  const copyOnly=/文案|标题/.test(q);
  const title=(/标题[：:]\s*[“「]?([^\n”」]{2,16})/.exec(q)||[])[1];
  return {colors:requestedColors(q),title:'露紫生日共创方案',summary:copyOnly?'先收束标题与祝福，再用露紫版式承接；文案与预览都可修改。':'以露紫建立主调，用少量奶油黄、雾蓝和柔粉拉开层次，保留主视觉与文案的呼吸空间。',posterKey:key,headline:title||(/夜|星/.test(q)?'把星光，送给你':/派对|咖啡|袋/.test(q)?'今天只管开心':'把今天，留给喜欢'),subtitle:'赵露思 · 生日生咖一起过',sourceIds:c.materials.map(m=>m.id),steps:['读取已勾选素材的标题与说明','匹配露紫版式并整理标题、副标题','生成本地 SVG 排版预览，等待你确认'],warnings:[...(!c.materials.length?['未选择素材，当前方案只依据你的文字需求。']:[]),...(!c.materials.some(m=>m.hasPhoto)?['没有可用的人像原图；预览使用原创插画，不会伪造人物。']:[]),'预览尚未获得主办确认，也不是印刷交付文件。']};
 }
 function normalizePlan(raw,input){
  const c=context(input),fallback=localPlan(c);raw=raw&&typeof raw==='object'?raw:{};
  const allowed=new Set(c.materials.map(m=>m.id));const colors=validColors(raw.colors,fallback.colors);
  return {colors:colors||fallback.colors?{...colors,...fallback.colors}:undefined,title:text(raw.title,40)||fallback.title,summary:text(raw.summary,500)||fallback.summary,posterKey:KEYS.includes(raw.posterKey)?raw.posterKey:fallback.posterKey,headline:text(raw.headline,24)||fallback.headline,subtitle:text(raw.subtitle,50)||fallback.subtitle,sourceIds:[...new Set((Array.isArray(raw.sourceIds)?raw.sourceIds:[]).filter(id=>allowed.has(id)))],steps:fallback.steps,warnings:[...new Set([...fallback.warnings,...(Array.isArray(raw.warnings)?raw.warnings:[]).map(x=>text(x,180)).filter(Boolean)])].slice(0,6)};
 }
 const api={KEYS,context,localPlan,normalizePlan,requestedColors};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.XDPAssistant=api;
})(typeof window!=='undefined'?window:this);
