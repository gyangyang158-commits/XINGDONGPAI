/* Recorded-audio transcription. Never silently rely on SpeechRecognition services. */
(function(scope){
 'use strict';
 function encodeMono(samples,rate=16000){if(rate!==16000||!samples.length||samples.length>rate*60)throw Error('录音须为 60 秒以内。');const result=new Uint8Array(44+samples.length*2),view=new DataView(result.buffer);const word=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};word(0,'RIFF');view.setUint32(4,36+samples.length*2,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){const v=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,v<0?v*32768:v*32767,true);}return result;}
 const api={encodeMono};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
 let recorder=null,stream=null,chunks=[],timer=null,token=0,processing=false,waiting=false,abort=null;
 function available(){return /^https?:$/.test(location.protocol)&&WORK.status?.voiceConfigured===true;}
 function support(){if(location.protocol==='file:')return '当前是离线文件，不能连接语音转写。请使用服务版，或直接输入文字。';if(WORK.status===null)return '正在检查语音服务。';if(!WORK.status?.voiceConfigured)return '语音转写服务未配置，暂时不能识别。';if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return '此浏览器不能直接录音，可选择录音文件转写。';return '停止后将录音转写为文字，不会自动生成或发布。';}
 function status(text){voiceStatus(text);mount();}
 function mount(){
  const toolbar=document.querySelector('.voice-toolbar');if(!toolbar)return;
  const button=toolbar.querySelector('[data-act="work-voice"]'),input=$('#assistant-goal'),consent=$('#voice-consent');
  if(button){button.disabled=!available()||WORK.busy||processing||waiting||(!WORK.listening&&(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder));button.textContent=processing?'正在转写…':waiting?'等待麦克风权限…':WORK.listening?'停止并转写':available()?'开始录音':'语音需服务版';}
  if(input)input.disabled=WORK.busy||processing||waiting||WORK.listening;
  if(consent){consent.disabled=WORK.listening||processing||waiting;const label=consent.closest('label');if(label){for(const node of [...label.childNodes])if(node.nodeType===3)node.textContent='允许将本次录音发送给银河智算做语音转写（按服务商计费）；识别文字仍需你检查。';}}
  let upload=$('#voice-audio-upload');if(!upload){upload=document.createElement('button');upload.id='voice-audio-upload';upload.type='button';upload.className='btn btn-ghost btn-sm';upload.textContent='选择录音文件';toolbar.insertBefore(upload,$('#voice-status'));const file=document.createElement('input');file.type='file';file.id='voice-audio-file';file.accept='audio/*';file.hidden=true;toolbar.appendChild(file);upload.addEventListener('click',()=>{if(!WORK.voiceConsent){status('请先勾选本次录音的转写授权。');return;}file.click();});file.addEventListener('change',()=>{if(file.files?.[0])transcribe(file.files[0]);});}
  upload.disabled=!available()||WORK.busy||processing||waiting||WORK.listening;
  let cancel=$('#voice-audio-cancel');if(!cancel){cancel=document.createElement('button');cancel.id='voice-audio-cancel';cancel.type='button';cancel.className='text-button';cancel.textContent='取消录音';toolbar.appendChild(cancel);cancel.addEventListener('click',()=>{cancelSession();status('录音已取消，没有发送音频。');});}cancel.hidden=!WORK.listening&&!waiting;
  if(!WORK.voiceMessage)$('#voice-status').textContent=support();
 }
 async function toWav(blob){
  if(blob.size>8*1024*1024)throw Error('音频不能超过 8 MB。');const Audio=window.AudioContext||window.webkitAudioContext,Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Audio||!Offline)throw Error('当前浏览器不能处理录音，请尝试 Chrome、Safari 或 Edge 的服务版。');
  const context=new Audio();try{const decoded=await context.decodeAudioData(await blob.arrayBuffer());if(decoded.duration>60)throw Error('录音最长 60 秒，请先截短。');const offline=new Offline(1,Math.max(1,Math.ceil(decoded.duration*16000)),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();const rendered=await offline.startRendering();return new Blob([encodeMono(rendered.getChannelData(0))],{type:'audio/wav'});}finally{context.close();}
 }
 async function transcribe(blob,currentToken=++token){
  if(!available()){status(support());return;}if(!WORK.voiceConsent){status('未授权，本次录音没有发送。');return;}processing=true;WORK.listening=false;mount();
  try{
   status('正在处理音频…');const wav=await toWav(blob);if(currentToken!==token)return;
   const audio=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(wav);});
   if(!WORK.voiceConsent||currentToken!==token)return;abort=new AbortController();status('正在识别实际录音，请稍候…');
   const response=await fetch('/api/voice/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audio,consent:true}),signal:abort.signal});const result=await response.json();if(!response.ok)throw Error(result.error||'语音转写失败。');if(currentToken!==token)return;
   if(!result.text?.trim())throw Error('没有识别到可辨语音，请重新录制。');WORK.goal=(WORK.goal+(WORK.goal?'，':'')+result.text.trim()).slice(0,1200);markAssistantRequestDirty();const input=$('#assistant-goal');if(input)input.value=WORK.goal;status('录音已转写，请检查文字后再生成方案。');
  }catch(e){if(currentToken===token&&e.name!=='AbortError')status(e.message||'语音识别失败，请重试。');}
  finally{if(currentToken===token){processing=false;abort=null;mount();}}
 }
 async function start(){
  if(WORK.listening&&recorder){if(recorder.state!=='inactive')recorder.stop();return;}if(waiting||processing||WORK.busy)return;if(!available()){status(support());return;}if(!WORK.voiceConsent){status('请先勾选本次录音发送给银河智算转写的授权。');return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status(support());return;}
  const current=++token;waiting=true;mount();try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});if(current!==token){media.getTracks().forEach(track=>track.stop());return;}stream=media;chunks=[];const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(type=>window.MediaRecorder.isTypeSupported?.(type));recorder=new MediaRecorder(media,mime?{mimeType:mime}:undefined);recorder.ondataavailable=e=>{if(current===token&&e.data.size)chunks.push(e.data);};recorder.onerror=()=>{if(current!==token)return;cancelSession();status('录音失败，请检查麦克风，或选择录音文件。');};recorder.onstop=()=>{if(current!==token)return;clearInterval(timer);stream?.getTracks().forEach(track=>track.stop());stream=null;WORK.listening=false;if(current!==token)return;const blob=new Blob(chunks,{type:recorder.mimeType||mime||'audio/mp4'});if(!blob.size){status('没有录到音频，请重试。');mount();return;}transcribe(blob,current);};
   recorder.start();waiting=false;WORK.listening=true;const started=Date.now();status('正在录音 00:00，点击停止后转写。');timer=setInterval(()=>{if(current!==token)return;const seconds=Math.floor((Date.now()-started)/1000);if(seconds>=60){if(recorder?.state==='recording')recorder.stop();return;}voiceStatus('正在录音 00:'+String(seconds).padStart(2,'0')+'，点击停止后转写。');},1000);
  }catch(error){if(current===token){waiting=false;status(error.name==='NotAllowedError'?'麦克风未授权。请允许后重试，或选择已有录音文件。':'无法打开麦克风。请检查设备，或选择录音文件。');}}
 }
 function cancelSession(){token++;clearInterval(timer);stream?.getTracks().forEach(track=>track.stop());stream=null;if(recorder&&recorder.state!=='inactive')recorder.stop();recorder=null;abort?.abort();abort=null;processing=false;waiting=false;WORK.listening=false;}
 Object.assign(api,{available,support,mount,start,cancel:cancelSession});scope.XDPVoice=api;
 startWorkVoice=start;
})(typeof window!=='undefined'?window:this);
