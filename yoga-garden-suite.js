
const KEY='yogaGardenSuiteV4';

const CLASS_SEED=[
  {id:'warm-power-flow',dow:'SUN',date:'06',day:'Sunday',title:'Warm Power Flow',time:'12:00 PM',coach:'Genevieve',capacity:10,booked:6,waitlist:0,price:15},
  {id:'hot-yin',dow:'MON',date:'07',day:'Monday',title:'Hot Yin',time:'7:00 PM',coach:'Kristine',capacity:12,booked:9,waitlist:0,price:15},
  {id:'pilates-fusion',dow:'TUE',date:'08',day:'Tuesday',title:'Pilates Fusion',time:'7:00 PM',coach:'Karen',capacity:10,booked:10,waitlist:2,price:15},
  {id:'stott-pilates',dow:'WED',date:'09',day:'Wednesday',title:'STOTT Pilates',time:'7:00 PM',coach:'Kimberly',capacity:10,booked:7,waitlist:0,price:15},
  {id:'pilates-fx',dow:'THU',date:'10',day:'Thursday',title:'Pilates Fx',time:'5:30 PM',coach:'Danika',capacity:10,booked:5,waitlist:0,price:15},
  {id:'sculpt-sweat',dow:'SAT',date:'12',day:'Saturday',title:'Sculpt & Sweat',time:'11:30 AM',coach:'Karen',capacity:10,booked:8,waitlist:0,price:15}
];

const ROSTERS={
  'pilates-fusion':[
    {name:'Sarah MacNeil',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Amy Clarke',waiver:false,payment:'Cash',attendance:false},
    {name:'Jessica Reid',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Megan Foster',waiver:true,payment:'Cash',attendance:false},
    {name:'Tara Wells',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Olivia Hart',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Natalie King',waiver:true,payment:'Cash',attendance:false},
    {name:'Erin Wells',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Jenna Ross',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Claire Moore',waiver:true,payment:'Cash',attendance:false}
  ],
  'sculpt-sweat':[
    {name:'Megan Foster',waiver:true,payment:'Cash',attendance:false},
    {name:'Jessica Reid',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Sophie Grant',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Emma Walsh',waiver:true,payment:'Cash',attendance:false},
    {name:'Nina Cole',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Leah Young',waiver:true,payment:'Cash',attendance:false},
    {name:'Paige Miller',waiver:true,payment:'E-transfer',attendance:false},
    {name:'Hannah Ross',waiver:true,payment:'E-transfer',attendance:false}
  ]
};

function defaultState(){
  return {
    classes:JSON.parse(JSON.stringify(CLASS_SEED)),
    demoMode:'returning',
    client:{
      name:'Sarah MacNeil',
      email:'sarah@example.ca',
      phone:'902-555-0188',
      emergency:'Jamie MacNeil · 902-555-0123',
      payment:'E-transfer',
      waiverSigned:true,
      waiverDate:'August 27, 2026',
      waiverName:'Sarah MacNeil'
    },
    bookings:['pilates-fusion'],
    waiting:[],
    offers:[],
    rosters:JSON.parse(JSON.stringify(ROSTERS)),
    activity:[
      {kind:'booking',title:'Jessica Reid booked STOTT Pilates',time:'12 min ago'},
      {kind:'wait',title:'Rebecca Cole joined the Pilates Fusion cancellation list',time:'36 min ago'},
      {kind:'waiver',title:'Amy Clarke still needs a studio waiver',time:'Today'}
    ]
  };
}
function load(){
  try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):defaultState()}catch(e){return defaultState()}
}
let state=load();
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function resetDemo(){localStorage.removeItem(KEY);state=defaultState();renderAll()}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function cls(id){return state.classes.find(c=>c.id===id)}
function booked(id){return state.bookings.includes(id)}
function waiting(id){return state.waiting.includes(id)}
function dateLabel(){return new Intl.DateTimeFormat('en-CA',{month:'long',day:'numeric',year:'numeric'}).format(new Date())}

/* nav */
function wireNav(){
  document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',resetDemo));
  const mm=document.getElementById('mobileMenu'),mp=document.getElementById('mobilePanel');
  if(mm&&mp){mm.onclick=()=>{const o=mp.classList.toggle('open');mm.setAttribute('aria-expanded',String(o))};mp.querySelectorAll('a').forEach(a=>a.onclick=()=>mp.classList.remove('open'))}
}

/* generic modal */
function simpleModal(title,html){
  const bg=document.getElementById('simpleModal'),body=document.getElementById('simpleModalBody'),ttl=document.getElementById('simpleModalTitle');
  if(!bg||!body||!ttl)return;
  ttl.textContent=title;body.innerHTML=html;bg.classList.add('open');document.body.classList.add('locked');
}
function closeSimple(){const bg=document.getElementById('simpleModal');if(bg)bg.classList.remove('open');document.body.classList.remove('locked')}

/* schedule */
function renderSchedule(){
  const el=document.getElementById('classSchedule');if(!el)return;
  el.innerHTML=state.classes.map(c=>{
    const full=c.booked>=c.capacity,spots=Math.max(0,c.capacity-c.booked);
    let action='';
    if(booked(c.id)) action='<span class="status good">Booked ✓</span>';
    else if(waiting(c.id)) action='<span class="status lilac">On cancellation list</span>';
    else if(full) action=`<button class="button outline small" data-wait="${c.id}">Join cancellation list</button>`;
    else action=`<button class="button small" data-book="${c.id}">Book</button>`;
    return `<div class="class-row">
      <div class="class-day">${esc(c.day)}</div>
      <div class="class-main"><strong>${esc(c.title)}</strong><span>${esc(c.coach)} · $${c.price}</span></div>
      <div class="class-time">${esc(c.time)}</div>
      <div class="class-capacity">${full?'<span class="status lilac">Full</span>':`<span class="status good">${spots} ${spots===1?'spot':'spots'} left</span>`}</div>
      <div class="class-action">${action}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>startBooking(b.dataset.book));
  el.querySelectorAll('[data-wait]').forEach(b=>b.onclick=()=>joinWaitlist(b.dataset.wait));
}

/* demo persona */
function setMode(mode){
  state.demoMode=mode;
  if(mode==='new'){
    state.client={name:'',email:'',phone:'',emergency:'',payment:'E-transfer',waiverSigned:false,waiverDate:'',waiverName:''};
    state.bookings=[];
    state.waiting=[];
    state.offers=[];
  }else{
    const d=defaultState();
    state.client=d.client;state.bookings=d.bookings;state.waiting=d.waiting;state.offers=d.offers;
  }
  save();renderAll();
}
function renderMode(){
  document.querySelectorAll('[data-mode]').forEach(b=>{
    b.classList.toggle('active',b.dataset.mode===state.demoMode);
    b.onclick=()=>setMode(b.dataset.mode);
  });
}

/* booking drawer */
let bookingClassId=null;
let bookingStep=1;
function drawer(){return document.getElementById('bookingOverlay')}
function openDrawer(){const d=drawer();if(d){d.classList.add('open');document.body.classList.add('locked')}}
function closeDrawer(){const d=drawer();if(d)d.classList.remove('open');document.body.classList.remove('locked')}
function startBooking(id){
  bookingClassId=id;bookingStep=1;renderBookingStep();openDrawer();
}
function stepsHtml(active){
  const labels=['Details','Waiver','Confirm'];
  return labels.map((l,i)=>{
    const n=i+1,done=n<active,cl=done?'done':n===active?'active':'';
    return `<div class="step ${cl}"><b>${done?'✓':n}</b>${l}</div>`;
  }).join('');
}
function renderBookingStep(){
  const c=cls(bookingClassId),title=document.getElementById('drawerTitle'),meta=document.getElementById('drawerMeta'),steps=document.getElementById('drawerSteps'),body=document.getElementById('drawerBody');
  if(!c||!body)return;
  title.textContent=c.title;meta.textContent=`${c.day} · ${c.time} · ${c.coach} · $${c.price}`;steps.innerHTML=stepsHtml(bookingStep);

  if(bookingStep===1){
    body.innerHTML=`
      <span class="eyebrow">${state.demoMode==='new'?'First visit':'Your details'}</span>
      <h3 style="margin:6px 0 16px">${state.demoMode==='new'?'A few details first.':'Quick check before you book.'}</h3>
      <div class="field-grid">
        <div class="field"><label>Full name</label><input id="bName" value="${esc(state.client.name)}" placeholder="Full name"></div>
        <div class="field"><label>Email</label><input id="bEmail" type="email" value="${esc(state.client.email)}" placeholder="you@example.ca"></div>
        <div class="field"><label>Mobile</label><input id="bPhone" value="${esc(state.client.phone)}" placeholder="902-555-0000"></div>
        <div class="field"><label>Emergency contact</label><input id="bEmergency" value="${esc(state.client.emergency)}" placeholder="Name · phone"></div>
      </div>
      ${state.client.waiverSigned?`<div class="waiver-summary"><strong>Studio waiver on file ✓</strong><p>Signed ${esc(state.client.waiverDate)}. You won’t be asked to sign it again for every class.</p></div>`:`<div class="waiver-summary" style="background:var(--lilac-soft);border-color:var(--plum)"><strong style="color:var(--plum)">One-time waiver next</strong><p>First-time clients complete it here before the booking is confirmed.</p></div>`}
      <div class="drawer-actions"><button class="button ghost" id="drawerCancel">Cancel</button><button class="button green" id="detailsNext">${state.client.waiverSigned?'Review booking':'Continue to waiver'}</button></div>`;
    document.getElementById('drawerCancel').onclick=closeDrawer;
    document.getElementById('detailsNext').onclick=()=>{
      state.client.name=document.getElementById('bName').value.trim();
      state.client.email=document.getElementById('bEmail').value.trim();
      state.client.phone=document.getElementById('bPhone').value.trim();
      state.client.emergency=document.getElementById('bEmergency').value.trim();
      if(!state.client.name||!state.client.email||!state.client.phone){simpleModal('A couple of details are missing','<p>Please add a name, email, and mobile number before continuing.</p>');return}
      save();bookingStep=state.client.waiverSigned?3:2;renderBookingStep();
    };
  }else if(bookingStep===2){
    body.innerHTML=`
      <span class="eyebrow">One time only</span>
      <h3 style="margin:6px 0 5px">Studio waiver & consent</h3>
      <p class="small muted">This is sample demo wording, not the final legal waiver.</p>
      <div class="waiver-box">
        <h3>Participation & studio consent</h3>
        <p>I understand that yoga, Pilates, heated classes, and strength-based movement involve physical activity. I will participate within my own comfort and ability, and I can stop at any time.</p>
        <div class="check-list">
          <label class="check-row"><input class="waiver-check" type="checkbox"><span>I understand that participation involves movement and physical exertion, and I choose to participate voluntarily.</span></label>
          <label class="check-row"><input class="waiver-check" type="checkbox"><span>I will let the instructor know if I need support or a modification, and I will stop if I feel unwell or unsafe.</span></label>
          <label class="check-row"><input class="waiver-check" type="checkbox"><span>For heated classes, I understand the room may be warm and I am responsible for hydration and taking breaks when needed.</span></label>
          <label class="check-row"><input class="waiver-check" type="checkbox"><span>I consent to The Yoga Garden keeping this signed waiver with my client profile.</span></label>
        </div>
        <div class="signature-row">
          <div class="field"><label>Type your full name to sign</label><input id="waiverName" value="${esc(state.client.name)}"></div>
          <div class="field"><label>Date</label><input value="${esc(dateLabel())}" disabled></div>
        </div>
      </div>
      <div class="drawer-actions"><button class="button ghost" id="waiverBack">Back</button><button class="button green" id="waiverNext">Sign & continue</button></div>`;
    document.getElementById('waiverBack').onclick=()=>{bookingStep=1;renderBookingStep()};
    document.getElementById('waiverNext').onclick=()=>{
      const checks=[...document.querySelectorAll('.waiver-check')],sig=document.getElementById('waiverName').value.trim();
      if(checks.some(c=>!c.checked)||!sig){simpleModal('Almost there','<p>Please check each consent box and type your name before continuing.</p>');return}
      state.client.waiverSigned=true;state.client.waiverDate=dateLabel();state.client.waiverName=sig;save();bookingStep=3;renderBookingStep();
    };
  }else{
    body.innerHTML=`
      <span class="eyebrow">Ready to book</span>
      <h3 style="margin:6px 0 13px">Review your class.</h3>
      <div class="booking-summary">
        <div class="summary-line"><span>Class</span><strong>${esc(c.title)}</strong></div>
        <div class="summary-line"><span>When</span><strong>${esc(c.day)} · ${esc(c.time)}</strong></div>
        <div class="summary-line"><span>Instructor</span><strong>${esc(c.coach)}</strong></div>
        <div class="summary-line"><span>Price</span><strong>$${c.price}</strong></div>
        <div class="summary-line"><span>Waiver</span><strong>On file ✓</strong></div>
      </div>
      <span class="eyebrow">Payment at the studio</span>
      <div class="payment-options">
        <label class="payment-option"><input type="radio" name="pay" value="E-transfer" ${state.client.payment==='E-transfer'?'checked':''}><div><strong>E-transfer</strong><span>Mark the booking as paying by e-transfer.</span></div></label>
        <label class="payment-option"><input type="radio" name="pay" value="Cash" ${state.client.payment==='Cash'?'checked':''}><div><strong>Cash</strong><span>Pay at the studio.</span></div></label>
      </div>
      <div class="drawer-actions"><button class="button ghost" id="confirmBack">Back</button><button class="button green" id="confirmBook">Confirm booking</button></div>`;
    document.getElementById('confirmBack').onclick=()=>{bookingStep=state.client.waiverSigned?1:2;renderBookingStep()};
    document.getElementById('confirmBook').onclick=()=>{
      if(!booked(c.id)){state.bookings.push(c.id);c.booked=Math.min(c.capacity,c.booked+1)}
      const pay=document.querySelector('input[name="pay"]:checked');if(pay)state.client.payment=pay.value;
      state.activity.unshift({kind:'booking',title:`${state.client.name} booked ${c.title}`,time:'Just now'});
      save();renderAll();
      body.innerHTML=`<div class="success"><div class="success-mark">✓</div><h2>You’re booked.</h2><p>${esc(c.title)} · ${esc(c.day)} at ${esc(c.time)}</p><p class="small">It’s been added to My Garden.</p><div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="button green" href="yoga-garden-my-garden.html">Open My Garden</a><button class="button outline" id="successDone">Done</button></div></div>`;
      document.getElementById('successDone').onclick=closeDrawer;
    };
  }
}
function joinWaitlist(id){
  const c=cls(id);if(!c||waiting(id))return;
  if(!state.client.email){
    state.demoMode='new';save();startBooking(id);
    return;
  }
  simpleModal('Join the cancellation list',`
    <p><strong>${esc(c.title)}</strong><br>${esc(c.day)} · ${esc(c.time)}</p>
    <p class="small muted">If a spot opens, the first person waiting gets a temporary offer. If they don’t take it in time, the offer moves to the next person automatically.</p>
    <label class="check-row" style="margin:16px 0"><input type="checkbox" id="waitNotify" checked><span>Email me when a spot is offered.</span></label>
    <div style="display:flex;justify-content:flex-end;gap:9px;margin-top:20px"><button class="button outline small" id="waitCancel">Not now</button><button class="button green small" id="waitConfirm">Join list</button></div>`);
  document.getElementById('waitCancel').onclick=closeSimple;
  document.getElementById('waitConfirm').onclick=()=>{
    state.waiting.push(id);c.waitlist+=1;state.activity.unshift({kind:'wait',title:`${state.client.name||'New client'} joined the ${c.title} cancellation list`,time:'Just now'});save();closeSimple();renderAll();
  };
}

/* cancellation / offer */
function cancelBooking(id){
  const c=cls(id);if(!c||!booked(id))return;
  state.bookings=state.bookings.filter(x=>x!==id);c.booked=Math.max(0,c.booked-1);
  if(c.waitlist>0){
    c.waitlist=Math.max(0,c.waitlist-1);
    state.offers=state.offers.filter(o=>o.classId!==id);
    state.offers.push({classId:id,name:'Melissa Grant',expires:'4 hours'});
    state.activity.unshift({kind:'offer',title:`Open ${c.title} spot offered to Melissa Grant`,time:'Just now'});
  }
  state.activity.unshift({kind:'cancel',title:`${state.client.name} cancelled ${c.title}`,time:'Just now'});
  save();renderAll();
}

/* client portal */
function renderPortal(){
  const upcoming=document.getElementById('upcomingClasses');
  if(upcoming){
    const rows=state.classes.filter(c=>booked(c.id));
    upcoming.innerHTML=rows.length?rows.map(c=>`<div class="upcoming-line"><div><strong>${esc(c.title)}</strong><span>${esc(c.day)} · ${esc(c.time)} · ${esc(c.coach)} · ${esc(state.client.payment)}</span></div><button class="text-button danger" data-cancel="${c.id}">Cancel booking</button></div>`).join(''):'<p class="muted">No upcoming classes booked.</p>';
    upcoming.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>simpleModal('Cancel this class?',`<p>Cancel <strong>${esc(cls(b.dataset.cancel).title)}</strong>?</p><p class="small muted">If someone is on the cancellation list, the open spot can be offered automatically.</p><div style="display:flex;justify-content:flex-end;gap:9px;margin-top:18px"><button class="button outline small" id="keepBooking">Keep it</button><button class="button small" id="cancelIt">Cancel class</button></div>`));
  }
  const wait=document.getElementById('waitingClasses');
  if(wait){const rows=state.classes.filter(c=>waiting(c.id));wait.innerHTML=rows.length?rows.map(c=>`<div class="upcoming-line"><div><strong>${esc(c.title)}</strong><span>${esc(c.day)} · ${esc(c.time)}</span></div><span class="status lilac">Waiting</span></div>`).join(''):'<p class="muted">You’re not on any cancellation lists.</p>'}
  const offers=document.getElementById('clientOffers');
  if(offers){offers.innerHTML=state.offers.filter(o=>o.name===state.client.name).map(o=>{const c=cls(o.classId);return `<div class="offer-client"><strong>A spot opened in ${esc(c.title)}.</strong><p>You have ${esc(o.expires)} to claim it before the offer moves to the next person.</p><button class="button green small" data-claim="${c.id}">Claim spot</button></div>`}).join('')}
  const values={clientName:state.client.name||'—',clientEmail:state.client.email||'—',clientPhone:state.client.phone||'—',clientEmergency:state.client.emergency||'—',clientPayment:state.client.payment||'—',waiverStatus:state.client.waiverSigned?`Signed ${state.client.waiverDate}`:'Not signed'};
  Object.entries(values).forEach(([id,val])=>{const e=document.getElementById(id);if(e)e.textContent=val});
  document.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{const id=b.dataset.cancel;simpleModal('Cancel this class?',`<p>Cancel <strong>${esc(cls(id).title)}</strong>?</p><p class="small muted">If someone is waiting, the open spot can be offered automatically.</p><div style="display:flex;justify-content:flex-end;gap:9px;margin-top:18px"><button class="button outline small" id="keepBooking">Keep it</button><button class="button small" id="cancelIt">Cancel class</button></div>`);document.getElementById('keepBooking').onclick=closeSimple;document.getElementById('cancelIt').onclick=()=>{cancelBooking(id);closeSimple()}});
}

/* owner dashboard */
function renderOwner(){
  const classes=state.classes,totalBookings=classes.reduce((a,c)=>a+c.booked,0),totalSeats=classes.reduce((a,c)=>a+c.capacity,0),totalWait=classes.reduce((a,c)=>a+c.waitlist,0);
  const statBookings=document.getElementById('statBookings'),statFill=document.getElementById('statFill'),statWait=document.getElementById('statWait'),statWaivers=document.getElementById('statWaivers');
  if(statBookings)statBookings.textContent=totalBookings;
  if(statFill)statFill.textContent=Math.round(totalBookings/totalSeats*100)+'%';
  if(statWait)statWait.textContent=totalWait;
  if(statWaivers)statWaivers.textContent='1';
  const tbl=document.getElementById('ownerSchedule');
  if(tbl)tbl.innerHTML=classes.map(c=>`<tr><td><strong>${esc(c.day)}</strong><br><span class="tiny muted">${esc(c.time)}</span></td><td><strong>${esc(c.title)}</strong><br><span class="tiny muted">${esc(c.coach)}</span></td><td>${c.booked}/${c.capacity}<div class="capacity-bar"><i style="width:${Math.min(100,c.booked/c.capacity*100)}%"></i></div></td><td>${c.waitlist?`<span class="status lilac">${c.waitlist} waiting</span>`:'<span class="status neutral">—</span>'}</td><td><button class="text-button" data-manage="${c.id}">Manage</button></td></tr>`).join('');
  const feed=document.getElementById('activityFeed');
  if(feed)feed.innerHTML=state.activity.slice(0,6).map(a=>`<div class="activity-item"><div class="activity-dot"></div><div><strong>${esc(a.title)}</strong><p>${esc(a.time)}</p></div></div>`).join('');
  const offer=document.getElementById('ownerOffer'),o=state.offers.find(x=>x.classId==='pilates-fusion');
  if(offer)offer.innerHTML=o?`<div class="offer-box"><strong>${esc(o.name)} has the open Pilates Fusion spot.</strong><p>The offer expires in ${esc(o.expires)}. If it isn’t claimed, the next person can receive it automatically.</p></div>`:'<p class="small muted">No active spot offers right now.</p>';
}

/* instructor */
let instructor='Karen';
function renderInstructor(){
  const title=document.getElementById('instructorName');if(title)title.textContent=instructor;
  document.querySelectorAll('[data-instructor]').forEach(b=>{b.classList.toggle('active',b.dataset.instructor===instructor);b.onclick=()=>{instructor=b.dataset.instructor;renderInstructor()}});
  const my=state.classes.filter(c=>c.coach===instructor);
  const myTable=document.getElementById('myClasses');
  if(myTable)myTable.innerHTML=my.map(c=>`<tr><td><strong>${esc(c.day)}</strong><br><span class="tiny muted">${esc(c.time)}</span></td><td><strong>${esc(c.title)}</strong></td><td>${c.booked}/${c.capacity}</td><td>${c.waitlist?`<span class="status lilac">${c.waitlist} waiting</span>`:'—'}</td></tr>`).join('')||'<tr><td colspan="4">No classes assigned in this demo.</td></tr>';
  const next=my[0],nextTitle=document.getElementById('nextClassTitle'),nextMeta=document.getElementById('nextClassMeta');
  if(nextTitle)nextTitle.textContent=next?next.title:'No class assigned';
  if(nextMeta)nextMeta.textContent=next?`${next.day} · ${next.time} · ${next.booked}/${next.capacity} booked`:'';
  const roster=document.getElementById('instructorRoster');
  if(roster){
    const list=next?(state.rosters[next.id]||[]):[];
    roster.innerHTML=list.length?list.map((p,i)=>`<div class="attendee"><div><strong>${esc(p.name)}</strong><span>Client</span></div><div class="waiver-mini">${p.waiver?'<span class="status good">Waiver ✓</span>':'<span class="status danger">Waiver needed</span>'}</div><button class="attendance-btn ${p.attendance?'checked':''}" data-attend="${i}">${p.attendance?'Checked in ✓':'Check in'}</button></div>`).join(''):'<p class="muted small">No roster loaded for this class in the demo.</p>';
    roster.querySelectorAll('[data-attend]').forEach(b=>b.onclick=()=>{const list=state.rosters[next.id]||[];const i=Number(b.dataset.attend);list[i].attendance=!list[i].attendance;save();renderInstructor()});
  }
}

/* simple actions */
function wireActions(){
  document.querySelectorAll('[data-demo-action]').forEach(b=>b.onclick=()=>simpleModal(b.dataset.demoAction,'<p>This control is shown to demonstrate where that studio task would live. It is not wired to a real database in this static demo.</p>'));
  const sm=document.getElementById('simpleModal');
  if(sm)sm.addEventListener('click',e=>{if(e.target===sm)closeSimple()});
  const sx=document.getElementById('simpleModalClose');if(sx)sx.onclick=closeSimple;
  const d=drawer();if(d)d.addEventListener('click',e=>{if(e.target===d)closeDrawer()});
  const dc=document.getElementById('drawerClose');if(dc)dc.onclick=closeDrawer;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSimple();closeDrawer()}});
}

function renderAll(){renderMode();renderSchedule();renderPortal();renderOwner();renderInstructor()}
document.addEventListener('DOMContentLoaded',()=>{wireNav();wireActions();renderAll()});
