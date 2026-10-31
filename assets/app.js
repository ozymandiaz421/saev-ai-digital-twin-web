/* SAEV v2D-1 browser replay UI. NO fresh incident injection, detection, GPT API calls, or policy simulations. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const D=JSON.parse($('embeddedData').textContent);
for(const k of ['initial','baseline','selected','zones','depots','model','obs','metrics','moved'])if(!Object.hasOwn(D,k))throw Error(`리플레이 데이터 누락: ${k}`);
if(D.initial.length!==1574||D.model.options.length!==3||D.metrics.length!==2)throw Error('공개 기록 데이터 형식 오류');
const state={step:0,phase:'ready',choice:null,playing:false,speed:1,minute:19,runId:0};
const colors={IDLE:'#2879b3',PICKUP:'#299789',WITH_PASSENGER:'#6665a9',REBALANCING:'#e39b4d',MOVING:'#299789',CHARGING:'#8897a6',CHARGING_QUEUE:'#8897a6',CHARGING_ROUTE:'#8897a6',MAINTENANCE:'#8897a6',MAINTENANCE_QUEUE:'#8897a6',MAINTENANCE_ROUTE:'#8897a6'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const canScroll=()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setText(id,value){$(id).textContent=value;}
function show(id,yes){$(id).hidden=!yes;}
function scrollToBlock(id){$(id).scrollIntoView({behavior:canScroll()?'smooth':'auto',block:'start'});}
function stageStatus(step,status){document.querySelectorAll('.stage').forEach((el,i)=>{
  el.classList.toggle('is-done',i<step||i===step&&status==='done');
  el.classList.toggle('is-active',i===step&&status!=='done');
  el.classList.toggle('is-error',i===step&&status==='error');
  const label=el.querySelector('.stage-state');label.textContent=i<step?'완료':i===step?({'ready':'준비','running':'진행 중','waiting':'승인 대기','done':'완료','error':'실패'}[status]||'진행 중'):'예정';
  if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
});state.step=step;state.phase=status;
}
function report(msg,headline){setText('liveStatus',msg);setText('screenReaderState',msg);if(headline)setText('flowSummary',headline);}
function renderOptions(){const root=$('options');root.replaceChildren();for(const opt of D.model.options){
  const count=opt.max_moves_per_zone.reduce((a,b)=>a+b,0);
  const regions=opt.zone_ids.map((zone,i)=>`${zone}번 ${opt.max_moves_per_zone[i]}대`).join(' · ');
  const item=document.createElement('button');item.type='button';item.className='option-card';item.dataset.id=opt.id;item.setAttribute('aria-pressed',String(opt.id===state.choice));
  item.innerHTML=`<div class="option-top"><span class="option-radio" aria-hidden="true"></span><span class="option-id">${esc(opt.id)}</span><span class="option-count">${count}대 재배치</span></div><div><h3>${esc(opt.title)}</h3><div class="option-places">${esc(regions)}</div></div><div class="forecast"><span>사전 예상 개선치</span><strong>미산출</strong></div><span class="option-limit">${opt.id==='OPT_B'?'과거 분기 기록 보유':'실행 기록 없음'}</span>`;
  item.addEventListener('click',()=>selectOption(opt.id));root.appendChild(item);
}}
function selectOption(id){if(state.step!==3||state.phase!=='waiting')return;state.choice=id;renderOptions();
  const ready=id==='OPT_B';$('approveBtn').disabled=!ready;
  setText('optionNotice',ready?'OPT_B: 저장된 두 분기 결과를 불러올 수 있습니다.':`${id}: GPT가 제안했지만 계산된 결과가 없어 리플레이에서 실행할 수 없습니다.`);
}
function inject(){if(state.phase!=='ready')return;const token=++state.runId;state.choice=null;stageStatus(0,'done');setText('injectionBadge','기록 적용');$('injectionBadge').className='status-chip done';$('injectBtn').disabled=true;$('injectBtn').firstElementChild.textContent='이상 주입 기록 적용됨';
  setText('incidentMetric','관측 진행 중');setText('incidentSub','T+15분 · 추가 60건 기록');report('T+15분 수요 급증 기록을 불러왔습니다. 관측 기반 탐지 과정을 재생합니다.','주입 완료 · 탐지 기록 재생 중');
  stageStatus(1,'running');setText('diagnosisBadge','관측 중');
  window.setTimeout(()=>{if(token!==state.runId)return;
    stageStatus(1,'done');setText('incidentMetric','이상 감지');$('incidentMetric').parentElement.classList.add('is-detected');setText('incidentSub','27번 구역 · T+19분');
    setText('idleMetric',D.obs.global.observed_idle.toLocaleString('ko-KR')+'대');setText('waitingMetric',D.obs.global.unpicked_passengers+'명');
    setText('mapSubtitle','T+19분 · 탐지 시점 저장 스냅샷');setText('diagnosisBadge','탐지 완료');$('storyObserved').classList.add('is-observed');setText('storyObservedValue','호출 2.36배');setText('storyObservedSub','최근 5분 23건 · 기대 9.75건');setText('focusMapLabel','최근 5분 23건 / 기대 9.75건 · 가용 0대');
    show('diagnosisPlaceholder',false);show('diagnosisContent',true);
    $('diagnosisEvidence').textContent=D.model.evidence.join(' ');
    report('T+19분 Python 탐지기가 27번 구역의 호출 이상을 감지했습니다. GPT 진단 기록을 불러옵니다.','이상 감지 · GPT 분석 기록 로딩');
    stageStatus(2,'running');drawAll();
    window.setTimeout(()=>{if(token!==state.runId)return;
      stageStatus(2,'done');setText('diagnosisBadge','GPT 분석 완료');$('diagnosisBadge').className='status-chip done';
      stageStatus(3,'waiting');show('decisionSection',true);renderOptions();
      report('GPT 대응안 3개를 표시했습니다. 사용자가 조치를 승인해야 비교가 진행됩니다.','GPT 진단 완료 · 대응 승인 대기');scrollToBlock('decisionSection');
    },1100);
  },900);
}
function approve(){if(state.step!==3||state.phase!=='waiting'||state.choice!=='OPT_B')return;const token=state.runId;
  stageStatus(3,'done');$('approveBtn').disabled=true;setText('optionNotice','OPT_B 승인됨 · 저장된 분기 결과를 불러오는 중입니다.');stageStatus(4,'running');
  report('선택된 OPT_B의 과거 분기 시뮬레이션 결과를 불러옵니다. 이번 화면은 새 계산을 수행하지 않습니다.','대응 승인 · 결과 기록 로딩');
  window.setTimeout(()=>{if(token!==state.runId)return;stageStatus(4,'done');stageStatus(5,'done');show('comparison',true);state.playing=false;state.minute=19;
    setText('incidentMetric','결과 준비');setText('incidentSub','OPT_B · T+19~34분 비교');
    $('storyOutcome').classList.add('is-verified');setText('storyOutcomeValue','픽업 +4건');setText('storyOutcomeSub','운송 완료 +2건 · 15분 결과');compareView(true);report('두 미래의 재생 데이터가 준비되었습니다. OPT_B의 +4건·+2건은 사후 실험 결과입니다.','분기 기록 준비 · 대응 효과 비교');drawAll();scrollToBlock('comparison');
  },650);
}
function resetAll(){++state.runId;state.step=0;state.phase='ready';state.choice=null;state.playing=false;state.speed=1;state.minute=19;
  stageStatus(0,'ready');setText('flowSummary','준비 완료 · 이상 주입을 시작하세요');report('현재는 저장된 결과의 단계별 시연입니다. 실제 서버 계산은 실행하지 않습니다.');
  setText('incidentMetric','주입 대기');setText('incidentSub','저장된 시나리오 시작 전');$('incidentMetric').parentElement.classList.remove('is-detected');
  setText('idleMetric','—');setText('waitingMetric','—');setText('diagnosisBadge','대기');$('diagnosisBadge').className='status-chip';
  setText('injectionBadge','대기');$('injectionBadge').className='status-chip';$('injectBtn').disabled=false;$('injectBtn').firstElementChild.textContent='이상 주입';
  show('diagnosisPlaceholder',true);show('diagnosisContent',false);show('decisionSection',false);show('comparison',false);$('options').replaceChildren();
  $('approveBtn').disabled=true;setText('optionNotice','대응책을 선택하세요.');$('storyObserved').classList.remove('is-observed');$('storyOutcome').classList.remove('is-verified');setText('storyObservedValue','탐지 대기');setText('storyObservedSub','Python 탐지 이후 공개');setText('storyOutcomeValue','비교 대기');setText('storyOutcomeSub','승인 후 15분 분기 결과');setText('focusMapLabel','관측 기록 대기');cityMain();maps.focus.setView(centerIncident,13.2);compareView(true);setText('mapSubtitle','감지 시점 스냅샷 · T+19분');
  setText('playBtn','▶ 재생');setText('speedBtn','1×');drawAll();scrollToBlock('overview');
}
$('injectBtn').addEventListener('click',inject);$('approveBtn').addEventListener('click',approve);$('restartTop').addEventListener('click',resetAll);
$('scrubber').addEventListener('input',e=>{state.minute=Number(e.target.value)/10;state.playing=false;setText('playBtn','▶ 재생');drawAll();});
$('resetBtn').addEventListener('click',()=>{state.playing=false;state.minute=19;setText('playBtn','▶ 재생');drawAll();});
$('speedBtn').addEventListener('click',()=>{state.speed=state.speed===1?2:state.speed===2?4:1;setText('speedBtn',state.speed+'×');});
$('playBtn').addEventListener('click',()=>{state.playing=!state.playing;if(state.playing&&state.minute>=34)state.minute=19;setText('playBtn',state.playing?'Ⅱ 일시정지':'▶ 재생');drawAll();});
const dialog=$('infoDialog');let previousFocus=null;
function openDialog(){previousFocus=document.activeElement;show('infoDialog',true);$('modalClose').focus();}
function closeDialog(){show('infoDialog',false);(previousFocus||$('helpOpen')).focus();}
$('helpOpen').addEventListener('click',openDialog);$('openLog').addEventListener('click',openDialog);$('modalClose').addEventListener('click',closeDialog);$('modalOkay').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeDialog();if(e.key==='Tab'&&!dialog.hidden){const f=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
function makeIndex(k){const result=Array.from({length:D.initial.length},()=>[]);for(const e of D[k])if(result[e[0]])result[e[0]].push(e);for(const events of result)events.sort((a,b)=>a[1]-b[1]);return result;}
// Geographic renderer. The OpenStreetMap tile layer is only requested for the user's visible viewport.
// Replay vehicle positions are linear coordinate interpolations; they are not road-routed traces.
const idx={baseline:makeIndex('baseline'),selected:makeIndex('selected')};
const zone27=D.zones.find(z=>z[0]===27);
const centerCity=[37.483,126.626], centerIncident=[zone27[2],zone27[3]];
const tileStore=new Map();
const tileMaps=[];
const TILE_URL='https://tile.openstreetmap.org';
function loadTile(z,x,y){const key=`${z}/${x}/${y}`;if(tileStore.has(key))return tileStore.get(key);
  const tile={img:null,status:'pending'};tileStore.set(key,tile);
  const img=new Image();img.decoding='async';
  img.onload=()=>{tile.status='ready';tile.img=img;tileMaps.forEach(m=>m.drawSoon());};
  img.onerror=()=>{tile.status='error';tileMaps.forEach(m=>m.drawSoon());};
  img.src=`${TILE_URL}/${z}/${x}/${y}.png`;
  if(tileStore.size>260){for(const [key,value] of tileStore){if(value.status!=='pending'&&tileStore.size>220)tileStore.delete(key);else if(tileStore.size<=220)break;}}
  return tile;
}
function projection(lat,lon,z){const size=256*Math.pow(2,z);const clamped=Math.max(-85,Math.min(85,lat));const r=clamped*Math.PI/180;return [(lon+180)/360*size,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*size];}
function unprojection(x,y,z){const size=256*Math.pow(2,z);return [Math.atan(Math.sinh(Math.PI*(1-2*y/size)))*180/Math.PI,x/size*360-180];}
function vehicle(id,t,events){let pos=D.initial[id],last=null;for(const e of events[id]){if(t>=e[1]&&t<=e[2]){const r=Math.max(0,Math.min(1,(t-e[1])/(e[2]-e[1]||1)));return [e[3]+r*(e[5]-e[3]),e[4]+r*(e[6]-e[4]),e[7]];}if(e[2]<t)last=e;else break;}if(last)pos=[last[5],last[6]];return [pos[0],pos[1],'IDLE'];}
class GeoCanvasMap{
  constructor(id,mode,initialCenter,zoom,syncGroup=null){this.canvas=$(id);this.ctx=this.canvas.getContext('2d');this.mode=mode;this.center=[...initialCenter];this.zoom=zoom;this.syncGroup=syncGroup;this.raf=0;this.pointers=new Map();this.drag0=null;this.pinch0=null;this.failed=false;this.w=0;this.h=0;
    this.canvas.addEventListener('pointerdown',e=>this.down(e));this.canvas.addEventListener('pointermove',e=>this.move(e));this.canvas.addEventListener('pointerup',e=>this.up(e));this.canvas.addEventListener('pointercancel',e=>this.up(e));
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoomAt(e.deltaY>0?-.33:.33,e.offsetX,e.offsetY);},{passive:false});
    this.canvas.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){e.preventDefault();this.zoomBy(.7);}else if(e.key==='-'||e.key==='_'){e.preventDefault();this.zoomBy(-.7);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const d={ArrowLeft:[-65,0],ArrowRight:[65,0],ArrowUp:[0,-65],ArrowDown:[0,65]}[e.key];this.panBy(d[0],d[1]);}});
    tileMaps.push(this);if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>this.drawSoon()).observe(this.canvas);this.drawSoon();
  }
  resize(){const r=this.canvas.getBoundingClientRect();if(r.width<2||r.height<2)return false;const dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.ctx.setTransform(dpr,0,0,dpr,0,0);this.w=r.width;this.h=r.height;return true;}
  xy(lat,lon){const p=projection(lat,lon,this.zoom),c=projection(...this.center,this.zoom);return [p[0]-c[0]+this.w/2,p[1]-c[1]+this.h/2];}
  at(x,y){const c=projection(...this.center,this.zoom);return unprojection(c[0]+x-this.w/2,c[1]+y-this.h/2,this.zoom);}
  setView(center,zoom,notify=true){this.center=[...center];this.zoom=Math.min(15,Math.max(9,zoom));this.canvas.dataset.camera=`${this.center.map(x=>x.toFixed(5)).join(',')};${this.zoom.toFixed(2)}`;this.drawSoon();if(notify&&this.syncGroup){tileMaps.forEach(m=>{if(m!==this&&m.syncGroup===this.syncGroup)m.setView(this.center,this.zoom,false);});}}
  panBy(dx,dy){if(!this.w)return;const p=projection(...this.center,this.zoom);this.setView(unprojection(p[0]+dx,p[1]+dy,this.zoom),this.zoom);}
  zoomAt(delta,x=this.w/2,y=this.h/2){if(!this.w)return;const zoom=Math.min(15,Math.max(9,this.zoom+delta));const coordinate=this.at(x,y);const screen=projection(...coordinate,zoom);const middle=[screen[0]-(x-this.w/2),screen[1]-(y-this.h/2)];this.setView(unprojection(...middle,zoom),zoom);}
  zoomBy(d){this.zoomAt(d);}
  down(e){this.canvas.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===1){this.drag0=[e.clientX,e.clientY];this.pinch0=null;}if(this.pointers.size===2){const p=[...this.pointers.values()];this.pinch0={dist:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])||1,zoom:this.zoom};this.drag0=null;}}
  move(e){if(!this.pointers.has(e.pointerId))return;const old=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===1&&this.drag0){const dx=e.clientX-this.drag0[0],dy=e.clientY-this.drag0[1];this.drag0=[e.clientX,e.clientY];this.panBy(-dx,-dy);}else if(this.pointers.size===2&&this.pinch0){const p=[...this.pointers.values()];const dist=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])||1;const z=this.pinch0.zoom+Math.log2(dist/this.pinch0.dist);const rect=this.canvas.getBoundingClientRect();const mx=(p[0][0]+p[1][0])/2-rect.left,my=(p[0][1]+p[1][1])/2-rect.top;if(Math.abs(z-this.zoom)>.008)this.zoomAt(z-this.zoom,mx,my);this.pinch0={dist,zoom:this.zoom};}}
  up(e){this.pointers.delete(e.pointerId);if(this.pointers.size===1){this.drag0=[...[...this.pointers.values()][0]];this.pinch0=null;}else{this.drag0=null;this.pinch0=null;}}
  drawSoon(){if(!this.raf)this.raf=requestAnimationFrame(()=>{this.raf=0;this.draw();});}
  draw(){if(!this.resize())return;const ctx=this.ctx,w=this.w,h=this.h;ctx.clearRect(0,0,w,h);ctx.fillStyle='#e8f0f4';ctx.fillRect(0,0,w,h);
    // Quiet fallback coordinate grid when real background tiles are unavailable.
    ctx.strokeStyle='#dbe7ee';ctx.lineWidth=1;const c=projection(...this.center,this.zoom);
    for(let x=(((-c[0]+w/2)%85)+85)%85;x<w;x+=85){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=(((-c[1]+h/2)%85)+85)%85;y<h;y+=85){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    const z=Math.floor(this.zoom),sf=Math.pow(2,this.zoom-z),size=256*sf,world=1<<z;let success=0;
    // Only fetch currently visible tiles. No bulk download or speculative prefetch.
    const zx=Math.floor((c[0]-w/2)/size),zy=Math.floor((c[1]-h/2)/size),xx=Math.floor((c[0]+w/2)/size),yy=Math.floor((c[1]+h/2)/size);
    for(let iy=Math.max(0,zy);iy<=Math.min(world-1,yy);iy++)for(let ix=Math.max(0,zx);ix<=Math.min(world-1,xx);ix++){
      const tile=loadTile(z,((ix%world)+world)%world,iy);if(tile.status!=='ready')continue;const left=ix*size-c[0]+w/2,top=iy*size-c[1]+h/2;ctx.drawImage(tile.img,Math.floor(left),Math.floor(top),Math.ceil(size)+1,Math.ceil(size)+1);success++;
    }
    this.drawOverlay(ctx,w,h);
    if(success===0&&this.mode==='overview'){ctx.fillStyle='#678393';ctx.font='600 10px sans-serif';ctx.fillText('배경 타일 연결 전 · 좌표 기반 위치 표시',17,h-42);}
  }
  drawOverlay(ctx,w,h){const detected=state.step>=2;
    // Zone markers are centroids, not real neighborhood boundaries or shock radii.
    if(detected){const[x,y]=this.xy(...centerIncident);if(x>-100&&x<w+100&&y>-100&&y<h+100){const r=this.mode==='overview'?25:this.mode==='focus'?46:38;ctx.fillStyle='rgba(218,106,61,.11)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.setLineDash([5,4]);ctx.strokeStyle='#c97958';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#bb6548';ctx.beginPath();ctx.arc(x,y,5.5,0,Math.PI*2);ctx.fill();this.label(ctx,`27 송도 · 탐지`,x+13,y-26,'#b7654a');}}
    if(this.mode==='overview'||this.mode==='focus'){if(!detected)return;this.vehicles(ctx,w,h,'baseline',19,false);return;}
    this.vehicles(ctx,w,h,this.mode,state.minute,true);
    const label=$('branchTime'+(this.mode==='baseline'?'A':'B'));if(label)label.textContent=`T+${state.minute.toFixed(1)}분`;
  }
  label(ctx,label,x,y,color){ctx.save();ctx.font='700 11px sans-serif';const width=ctx.measureText(label).width+15;ctx.fillStyle='#fffffff2';ctx.strokeStyle='#d9e5eb';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-4,y-3,width,21,5);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillText(label,x+3,y+11);ctx.restore();}
  vehicles(ctx,w,h,branch,minute,comparison){const events=idx[branch];const important=Boolean($('highlightMoved')?.checked);ctx.save();
    for(let id=0;id<D.initial.length;id++){const p=vehicle(id,minute,events);const [x,y]=this.xy(p[0],p[1]);if(x<-9||x>w+9||y<-9||y>h+9)continue;const moved=D.moved.includes(id);const fade=important&&comparison&&!moved;ctx.globalAlpha=fade?.28:p[2]==='IDLE'?.56:.84;ctx.fillStyle=colors[p[2]]||colors.IDLE;const r=this.zoom>12.8?2.9:2.0;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    if(important&&comparison){for(const id of D.moved){const p=vehicle(id,minute,events);const [x,y]=this.xy(p[0],p[1]);if(x<-18||x>w+18||y<-18||y>h+18)continue;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.93)';ctx.fill();ctx.strokeStyle=branch==='selected'?'#b56b24':'#356b98';ctx.lineWidth=2.5;ctx.stroke();ctx.beginPath();ctx.arc(x,y,2.3,0,Math.PI*2);ctx.fillStyle=branch==='selected'?'#b56b24':'#356b98';ctx.fill();}}
    ctx.restore();}
}
const maps={
  main:new GeoCanvasMap('mainMap','overview',centerCity,10.8),
  focus:new GeoCanvasMap('focusMap','focus',centerIncident,13.2),
  baseline:new GeoCanvasMap('mapA','baseline',centerIncident,12.2,'compare'),
  selected:new GeoCanvasMap('mapB','selected',centerIncident,12.2,'compare')
};
function focusMain(){maps.main.setView(centerIncident,12.5);maps.focus.setView(centerIncident,13.2);}
function cityMain(){maps.main.setView(centerCity,10.8);}
function compareView(incident){const focus=incident?centerIncident:centerCity,z=incident?12.2:10.8;maps.baseline.setView(focus,z);$('compareFocus').classList.toggle('is-current',incident);$('compareCity').classList.toggle('is-current',!incident);$('compareFocus').setAttribute('aria-pressed',String(incident));$('compareCity').setAttribute('aria-pressed',String(!incident));}
$('focusMain').addEventListener('click',focusMain);$('resetMain').addEventListener('click',cityMain);
$('mainZoomIn').addEventListener('click',()=>maps.main.zoomBy(.8));$('mainZoomOut').addEventListener('click',()=>maps.main.zoomBy(-.8));
$('compareFocus').addEventListener('click',()=>compareView(true));$('compareCity').addEventListener('click',()=>compareView(false));
$('highlightMoved').addEventListener('change',drawAll);
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{state.playing=false;setText('playBtn','▶ 재생');state.minute=Number(button.dataset.time);drawAll();}));
function drawAll(){setText('timeLabel',`T+${state.minute.toFixed(1)}분`);$('scrubber').value=String(Math.round(state.minute*10));
  document.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('is-current',Number(b.dataset.time)===state.minute));
  maps.main.drawSoon();maps.focus.drawSoon();if(!$('comparison').hidden){maps.baseline.drawSoon();maps.selected.drawSoon();}
}
let last=0,visualMs=0;function tick(t){if(!last)last=t;const dt=Math.min(.08,(t-last)/1000);last=t;
  if(state.playing&&!$('comparison').hidden){state.minute=Math.min(34,state.minute+dt*.65*state.speed);if(state.minute>=34){state.playing=false;setText('playBtn','▶ 재생');}visualMs+=dt;if(visualMs>.11||!state.playing){visualMs=0;drawAll();}}
  requestAnimationFrame(tick);
}
function validateReplay(){const [b,a]=D.metrics;if(a.picked_up-b.picked_up!==4||a.completed-b.completed!==2||D.moved.length!==6)throw Error('저장된 KPI와 화면 수치가 불일치합니다.');}
validateReplay();stageStatus(0,'ready');drawAll();window.addEventListener('resize',drawAll);requestAnimationFrame(tick);
})();
