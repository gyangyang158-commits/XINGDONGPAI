/* Browser-native voice input. Recognition fills a draft and never submits it. */
(function(scope){
 'use strict';
 function encodeMono(samples,rate=16000){if(rate!==16000||!samples.length||samples.length>rate*60)throw Error('录音须为 60 秒以内。');const result=new Uint8Array(44+samples.length*2),view=new DataView(result.buffer);const word=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};word(0,'RIFF');view.setUint32(4,36+samples.length*2,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){const v=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,v<0?v*32768:v*32767,true);}return result;}

 function createBrowserVoice(options={}){
  const getConstructor=options.getConstructor||(()=>scope.SpeechRecognition||scope.webkitSpeechRecognition);
  const later=options.setTimeout||setTimeout,clear=options.clearTimeout||clearTimeout;
  let active=null,serial=0;
  function supported(){return typeof getConstructor()==='function';}
  function cancel(){if(!active)return;const old=active;active=null;serial++;clear(old.timer);try{old.recognition.abort();}catch{}old.callbacks.onState?.(false);old.callbacks.onStatus?.('语音已停止，文字不会自动发送。');}
  function start(callbacks){
   cancel();if(!supported()){callbacks.onStatus?.('当前浏览器未提供语音识别，请直接输入文字。');return false;}
   const Ctor=getConstructor(),id=++serial,base=String(callbacks.getText()||'');let recognition;
   try{recognition=new Ctor();}catch{callbacks.onStatus?.('无法启动浏览器语音识别，请直接输入文字。');return false;}
   const session={recognition,callbacks,lastText:base,heard:false,timer:null};active=session;
   const valid=()=>active===session&&serial===id;
   const finish=message=>{if(!valid())return;active=null;serial++;clear(session.timer);callbacks.onState?.(false);callbacks.onStatus?.(message);};
   recognition.lang=callbacks.lang||'zh-CN';recognition.continuous=false;recognition.interimResults=true;
   recognition.onstart=()=>{if(valid())callbacks.onStatus?.('正在聆听…识别文字会填入输入框，点击停止后可继续编辑。');};
   recognition.onresult=event=>{
    if(!valid())return;
    if(String(callbacks.getText()||'')!==session.lastText){finish('检测到手动编辑，已停止语音，保留你的文字。');try{recognition.abort();}catch{}return;}
    let transcript='';for(let i=0;i<event.results.length;i++)transcript+=event.results[i]?.[0]?.transcript||'';
    if(!transcript.trim())return;session.heard=true;
    const separator=base&&!/\s$/.test(base)?' ':'';const text=(base+separator+transcript).slice(0,callbacks.maxLength||1200);
    session.lastText=text;callbacks.onText(text);
   };
   recognition.onerror=event=>{const messages={'not-allowed':'麦克风或语音识别权限未允许，请直接输入文字或在浏览器中授权后重试。','service-not-allowed':'当前浏览器的语音服务不可用，请直接输入文字。','audio-capture':'没有可用麦克风，请检查设备或直接输入文字。','network':'浏览器语音服务连接失败，请直接输入文字。','no-speech':'没有识别到语音，草稿保留，可重新点击语音。',aborted:'语音已停止，文字不会自动发送。'};finish(messages[event.error]||'语音识别暂不可用，草稿保留，请直接输入文字。');};
   recognition.onend=()=>finish(session.heard?'识别文字已填入草稿，请检查后点击发送。':'语音已结束，没有识别到文字。');
   callbacks.onState?.(true);callbacks.onStatus?.('正在启动浏览器语音识别，首次使用可能需要允许麦克风。');
   session.timer=later(()=>{if(valid()){finish('语音已达到 60 秒，已保留识别文字，请检查后发送。');try{recognition.abort();}catch{}}},60000);
   try{recognition.start();return true;}catch{finish('浏览器未能启动语音识别，请直接输入文字。');return false;}
  }
  function stop(){if(!active)return;try{active.recognition.stop();}catch{cancel();}}
  return {supported,start,stop,cancel,isListening:()=>!!active};
 }
 const api={encodeMono,createBrowserVoice};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
 const browser=createBrowserVoice();
 function available(){return browser.supported();}
 function support(){return available()?'使用浏览器语音识别，可能由浏览器语音服务联网处理；本应用不上传录音。识别后先检查，再发送。':'当前浏览器未提供语音识别，请直接输入文字。';}
 function mount(){const button=document.querySelector('[data-act="work-voice"]');if(button){button.disabled=!available()||WORK.busy;button.textContent=WORK.listening?'停止语音':'浏览器语音输入';button.setAttribute('aria-pressed',String(!!WORK.listening));}const input=document.querySelector('#assistant-goal');if(input)input.disabled=WORK.busy;const status=document.querySelector('#voice-status');if(status)status.textContent=WORK.voiceMessage||support();}
 function start(){if(browser.isListening()){browser.stop();return;}if(WORK.busy)return;browser.start({getText:()=>WORK.goal,onText:text=>{WORK.goal=text;const field=document.querySelector('#assistant-goal');if(field)field.value=text;markAssistantRequestDirty();},onState:value=>{WORK.listening=value;mount();},onStatus:message=>{WORK.voiceMessage=message;mount();},maxLength:1200});}
 function cancelSession(){browser.cancel();WORK.listening=false;}
 Object.assign(api,{browser,available,support,mount,start,cancel:cancelSession});scope.XDPVoice=api;startWorkVoice=start;
})(typeof window!=='undefined'?window:this);
