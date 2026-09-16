const $=id=>document.getElementById(id);
const state={target:null,lock:0,turns:[0,0,0],moves:0,completed:false,selected:0};
let targets=[{name:'左側樹梢',x:218/1536,y:361/1024},{name:'教堂尖頂',x:797/1536,y:515/1024},{name:'水塔頂端',x:1376/1536,y:458/1024}];
const vectors=[[0,-1],[-Math.sqrt(3)/2,.5],[Math.sqrt(3)/2,.5]];
const img=$('scene');let message='';
function offset(){let x=45,y=-30;state.turns.forEach((t,i)=>{x+=t*vectors[i][0]*8;y+=t*vectors[i][1]*8});return{x,y,d:Math.hypot(x,y)}}
function choose(i){if(!Number.isInteger(i)||!targets[i])throw Error('無效的標的');state.target=i;state.selected=0;state.lock=0;state.turns=[0,0,0];state.moves=0;state.completed=false;message='主鏡已置中並固定。請先將固定螺絲向外轉 ¼ 圈。';render()}
function lock(dir){if(state.target===null||state.completed)return;state.lock=Math.max(0,Math.min(3,state.lock+dir));message=state.lock>0?'固定已解除。試著轉動 A、B 或 C，觀察標的在尋星鏡中的移動。':state.lock===0?'已鎖緊。按「檢查對準」確認結果。':'固定螺絲稍微鬆開後，即可校準。';render()}
function turn(i,dir){if(!Number.isInteger(i)||i<0||i>2||![-1,1].includes(dir))throw Error('無效的螺絲操作');if(state.lock===0||state.completed||state.target===null)throw Error('請先解除固定');const step=$('fine').checked?.25:1;const n=state.turns[i]+dir*step;if(Math.abs(n)>12){message='這顆螺絲已達模擬行程上限，試著調整另一顆。';render();return}const before=offset().d;state.selected=i;state.turns[i]=n;state.moves++;const after=offset().d;message=after<=3?'標的已進入中心容許範圍。現在將固定螺絲向內轉至鎖緊，再檢查對準。':after<before?'標的更靠近中心了。繼續觀察，接近時可勾選「精細調整」。':'標的離中心更遠了。可反向旋轉，或改調另一顆螺絲。';render()}
function check(){if(state.target===null)return;if(state.lock!==0){message='檢查前，請將固定螺絲向內轉至鎖緊。'}else if(offset().d>3){message='仍有偏移。重新向外轉 ¼ 圈解除固定，再調整標的位置。'}else{state.completed=true;message='校準通過！固定螺絲已鎖緊，兩個視野的標的都在中心。'}render()}
function reset(){state.target=null;state.completed=false;message='';render();window.scrollTo({top:0,behavior:'smooth'})}
function targetLayout(){if(!img.naturalWidth)return;const w=$('landscape').clientWidth,h=$('landscape').clientHeight,s=(document.documentElement.classList.contains('phone-layout')?Math.min:Math.max)(w/img.naturalWidth,h/img.naturalHeight),ox=(w-img.naturalWidth*s)/2,oy=(h-img.naturalHeight*s)/2;$('targets').innerHTML=targets.map((t,i)=>`<button class="target" data-target="${i}" style="left:${(t.x*img.naturalWidth*s+ox)/w*100}%;top:${(t.y*img.naturalHeight*s+oy)/h*100}%" aria-label="選擇${t.name}"><i>+</i><span>${t.name}</span></button>`).join('')}
function draw(id,isFinder){
 const c=$(id),ctx=c.getContext('2d'),w=c.width;
 ctx.clearRect(0,0,w,w);ctx.save();ctx.beginPath();ctx.arc(w/2,w/2,w/2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#82b4cf';ctx.fillRect(0,0,w,w);
 if(img.complete&&img.naturalWidth&&state.target!==null){
  const t=targets[state.target],o=offset(),scale=isFinder?1.5:3.6;
  // Invert only the optical image around the field center. The reticle stays fixed.
  ctx.save();ctx.translate(w,w);ctx.scale(-1,-1);
  ctx.drawImage(img,w/2-t.x*img.naturalWidth*scale+(isFinder?o.x*2:0),w/2-t.y*img.naturalHeight*scale+(isFinder?o.y*2:0),img.naturalWidth*scale,img.naturalHeight*scale);
  ctx.restore();
 }
 const vignette=ctx.createRadialGradient(300,300,200,300,300,310);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#00101baa');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,w);
 ctx.strokeStyle=isFinder?'#d9fff3':'#ffffff9e';ctx.lineWidth=isFinder?1.6:1;ctx.beginPath();ctx.moveTo(0,300);ctx.lineTo(290,300);ctx.moveTo(310,300);ctx.lineTo(600,300);ctx.moveTo(300,0);ctx.lineTo(300,290);ctx.moveTo(300,310);ctx.lineTo(300,600);ctx.stroke();ctx.beginPath();ctx.arc(300,300,6,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function renderMechanism(){
 $('lockKnob').setAttribute('transform','translate('+(state.lock*9)+' 0)');
 $('lockDiagramState').textContent=state.lock===0?'已鎖緊':'可校準';
 $('lockKnob').setAttribute('aria-label',state.lock===0?'固定螺絲已鎖緊，向外轉四分之一圈':'固定螺絲已鬆開，繼續向外轉四分之一圈');
 $('lockKnob').setAttribute('aria-disabled',String(state.completed||state.lock===3));
 state.turns.forEach((t,i)=>{const knob=$('knob'+i);knob.setAttribute('transform','translate(0 '+(t*1.2)+')');knob.setAttribute('aria-pressed',String(i===state.selected));const phase=((t%1)+1)%1*8; $('knobMark'+i).setAttribute('d','M'+(143+phase)+' 6v22M'+(177-phase)+' 6v22');});
 document.querySelectorAll('.screw').forEach((row,i)=>row.classList.toggle('selected',i===state.selected));
 $('selectedScrew').textContent='已選 '+ 'ABC'[state.selected] +' 螺絲 · 點選白色旋鈕切換';
}
function selectScrew(i){if(!Number.isInteger(i)||i<0||i>2)return;state.selected=i;renderMechanism()}

function render(){const chosen=state.target!==null,o=offset(),stage=!chosen?0:state.completed?4:state.lock===0&&state.moves===0?1:o.d<=3?3:2;$('steps').innerHTML=['選擇標的','解除固定','三點校準','鎖緊確認'].map((s,i)=>`<div class="step ${i===stage?'active':i<stage?'done':''}" ${i===stage?'aria-current="step"':''}><b>${i<stage?'✓':'0'+(i+1)}</b>${s}</div>`).join('');$('selection').hidden=chosen;$('exercise').hidden=!chosen;$('success').hidden=!state.completed;$('chapter').textContent=!chosen?'01 / OBSERVE':state.completed?'COMPLETE / VERIFIED':stage===1?'02 / UNLOCK':stage===3?'04 / VERIFY':'03 / ALIGN';$('title').textContent=!chosen?'先找一個清楚的遠方標的。':state.completed?'很好，尋星鏡已經對準。':'讓兩個視野指向同一個位置。';$('intro').textContent=!chosen?'選擇景色中的固定物體，以尖端或邊角作為對準位置。':`目前標的：${targets[state.target].name} · 主鏡保持固定，只調整尋星鏡。`;$('restart').hidden=!chosen;if(!chosen){targetLayout();return}$('lockState').textContent=['已鎖緊','已鬆開 ¼ 圈','已鬆開 ½ 圈','已鬆開 ¾ 圈'][state.lock];$('lockTicks').innerHTML=[0,1,2].map(i=>`<i class="${i<state.lock?'on':''}"></i>`).join('');$('loosen').disabled=state.lock===3||state.completed;$('tighten').disabled=state.lock===0||state.completed;document.querySelectorAll('[data-screw]').forEach(b=>b.disabled=state.lock===0||state.completed);state.turns.forEach((t,i)=>$('out'+i).textContent=(t>0?'+':'')+t);$('fine').disabled=state.completed;$('check').disabled=state.completed;$('finderStatus').textContent=o.d<=3?'已進入中心範圍':'尚未對準';$('feedbackTitle').textContent=state.completed?'校準通過':state.lock===0&&state.moves===0?'先鬆開固定螺絲':o.d<=3?'對準了，鎖緊後再確認':'觀察偏移，微調螺絲';$('meter').style.width=Math.max(3,100-o.d/100*100)+'%';$('distanceLabel').textContent=o.d<=3?'中心範圍 ✓':'偏移程度 '+(o.d>40?'較大':o.d>15?'中等':'接近中心');$('hint').textContent=message;renderMechanism();draw('mainView',false);draw('finderView',true)}
$('screws').innerHTML=['A','B','C'].map((s,i)=>`<div class="screw"><label>${s}</label><button data-screw="${i}" data-dir="-1" aria-label="${s} 螺絲逆時針向外轉">↶ 向外</button><button data-screw="${i}" data-dir="1" aria-label="${s} 螺絲順時針向內轉">↷ 向內</button><output id="out${i}">0</output></div>`).join('');
document.querySelectorAll('[data-select]').forEach(knob=>{knob.addEventListener('click',()=>selectScrew(+knob.dataset.select));knob.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectScrew(+knob.dataset.select)}})});
$('targets').addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(b)choose(+b.dataset.target)});$('screws').addEventListener('click',e=>{const b=e.target.closest('[data-screw]');if(b)turn(+b.dataset.screw,+b.dataset.dir)});$('loosen').onclick=()=>lock(1);$('lockKnob').addEventListener('click',()=>lock(1));$('lockKnob').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lock(1)}});$('tighten').onclick=()=>lock(-1);$('check').onclick=check;$('restart').onclick=reset;$('again').onclick=reset;img.onload=render;img.onerror=()=>{$('intro').textContent='場景圖片暫時無法載入，請重新整理頁面。'};window.addEventListener('resize',targetLayout);render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'read_alignment_state',description:'讀取目前標的、固定狀態、三顆螺絲刻度和對準結果。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:(input)=>{if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).length)throw Error("此工具不接受參數");return {...state,offset:offset()}}})).catch(()=>{});}catch(e){}}



// Rotate the page in portrait phones; request native orientation only from a user gesture.
function fitPhoneLayout(){
 const width=window.innerWidth,height=window.innerHeight;
 const phone=window.matchMedia('(pointer: coarse)').matches&&Math.min(width,height)<=600;
 document.documentElement.classList.toggle('phone-layout',phone);
 document.documentElement.classList.toggle('portrait-layout',phone&&height>width);
 document.documentElement.style.setProperty('--stage-width',(phone?Math.max(width,height):width)+'px');
 document.documentElement.style.setProperty('--stage-height',(phone?Math.min(width,height):height)+'px');
 requestAnimationFrame(targetLayout);
}
window.addEventListener('resize',fitPhoneLayout);window.visualViewport?.addEventListener('resize',fitPhoneLayout);fitPhoneLayout();
$('fullscreen').onclick=async()=>{
 try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();}catch(e){}
 try{if(screen.orientation?.lock)await screen.orientation.lock('landscape');}catch(e){}
 fitPhoneLayout();
};


