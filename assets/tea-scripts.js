/* Tea-room dramaturgy adapted from the user's ai提问(2).ppt, slides 1–6.
 * References are examples, never evidence of current celebrity news or completed tool actions. */
(function(root){
 'use strict';
 const scenarios=[
  {id:'birthday',label:'生日海报',sourceSlides:[1,4,5],greeting:'Hello，让我们今天来创造点什么吧！想做生日海报也不用先会排版。你更喜欢温柔浅紫，还是酷一点的舞台感？',prompts:['我想做生日海报，浅紫 + 米白，温柔风，线上发，不会排版','我要舞台黑金款，总觉得画面很乱','我已经选好图，接下来怎么做？'],tip:'先问用途与感觉，再给一个能立即尝试的建议。',turns:[
   {role:'assistant',speaker:'AI 设计助手',text:'大家好～想做应援海报的宝可以说说想法，我帮大家匹配模板、简单讲讲排版小技巧。',adapted:true},
   {role:'user',speaker:'用户 A · 示例',text:'我想做生日海报，浅紫 + 米白，温柔风，线上发，不会排版'},
   {role:'assistant',speaker:'AI 设计助手',text:'收到！小知识点：柔和配色尽量不堆元素，多留白。可以先试「露紫相册」或纪念相框，把照片放进去。',adapted:true,action:'look',layout:'frame'},
   {role:'user',speaker:'用户 B · 示例',text:'我要舞台黑金款，总觉得画面很乱'},
   {role:'assistant',speaker:'AI 设计助手',text:'黑金对比强，闪片只做边角点缀，人物放中心。我们现有的「紫夜星图」可以先试舞台感，再到二创调整颜色。',adapted:true,action:'templates'},
   {role:'user',speaker:'用户 A · 示例',text:'那我先选浅紫款，试着排一版。',adapted:true},
   {role:'assistant',speaker:'AI 设计助手',text:'好，选模板、上传自己的图片，先看标题有没有挡住人脸。留下一版后，再带到决策间比较；没有看过图，我先不替你选最优方案。',adapted:true,action:'look',layout:'frame'}]},
  {id:'drama',label:'剧照点评',sourceSlides:[2,5,6],greeting:'Hello，让我们今天来创造点什么吧！有喜欢的剧照，或者你已经拼好的图吗？可以先说说喜欢它的哪种感觉，也可以带图来让我一起看。',prompts:['我喜欢这组剧照的氛围，但完全不会做图','我已经自己拼了一张图，@AI 求点评','侧脸照片适合怎么排？'],tip:'没有收到图片时不虚构画面；看图先说一个亮点，再给一个优先改动。',turns:[
   {role:'user',speaker:'用户 A · 示例',text:'赵露思新剧剧照也太好看了吧，氛围感拉满！'},
   {role:'user',speaker:'用户 C · 示例',text:'狠狠心动，但我不会做图'},
   {role:'assistant',speaker:'AI 设计助手',text:'没关系，不需要你懂设计审美！你只要告诉我喜欢或者不喜欢什么风格，剩下排版交给模板，上传图片到编辑器就可以生成，做完还能发群里帮你看效果。'},
   {role:'user',speaker:'用户 A · 示例',text:'我已经自己拼了一张图，@AI 求点评'},
   {role:'assistant',speaker:'AI 设计助手',text:'收到！先把图片放进「看图共创」，点击 @AI 我才能看见当前预览。我们先找一个亮点，再决定要不要减一点装饰。',adapted:true,action:'look',layout:'editorial'},
   {role:'user',speaker:'用户 C · 示例',text:'我也跃跃欲试了！我想用另一张侧脸剧照'},
   {role:'assistant',speaker:'AI 设计助手',text:'可以哒！侧脸图重点保留面部空间，不要大面积遮挡。可以先试留白刊页，让文字和照片分开，再比较取景位置。',adapted:true,action:'look',layout:'editorial'}]},
  {id:'commerce',label:'商务 / 晒单',sourceSlides:[3,5],greeting:'Hello，让我们今天来创造点什么吧！今天想做一张喜欢的商务图，还是分享自己的晒单照片？不用先想好排版，说说你想突出人物、产品，还是一句文案就行。',prompts:['我想做温柔的商务安利图，不知道文案怎么放','我也想做一张晒单图！','人物和产品放在一起怎么不显乱？'],tip:'以用户提供的图片为依据，不虚构新品动态、购买经历或代言关系。',turns:[
   {role:'assistant',speaker:'AI 设计助手',text:'早安大家！今天如果有喜欢的商务图或晒单照片，可以一起试着做成海报。不会做图也没关系，先说说你喜欢的感觉。',adapted:true},
   {role:'user',speaker:'用户 A · 示例',text:'想试试，但不知道文案怎么放'},
   {role:'assistant',speaker:'AI 设计助手',text:'给你思路：人物放主视觉，产品放在右下角小区域，文案简洁。',action:'look',layout:'editorial'},
   {role:'user',speaker:'用户 B · 示例',text:'我也想做一张晒单图！'},
   {role:'assistant',speaker:'AI 设计助手',text:'可以，先用自己的实拍商品图试一张留白刊页。想再加人物或小贴纸，可以留稿后进入完整二创；成图之后我们再一起看。',adapted:true,action:'look',layout:'editorial'}]}
 ];
 function scenario(id){return scenarios.find(s=>s.id===id)||scenarios[0];}
 function opening(id){const s=scenario(id);return {id:'opening-'+s.id,role:'assistant',engine:'script',text:s.greeting,scripted:true};}
 const api={scenarios,scenario,opening};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.XDPTeaScripts=api;
})(typeof window!=='undefined'?window:this);
