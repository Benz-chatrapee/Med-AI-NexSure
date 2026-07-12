/*
  Med AI NexSure - Medical Certificate Dashboard interactions
  Refactored from the standalone HTML while preserving original behavior.
*/
const chartsAvailable = typeof Chart !== 'undefined';
if(!chartsAvailable){
  window.Chart = function(){
    return {data:{labels:[],datasets:[]},update(){}};
  };
  Chart.defaults = {font:{},plugins:{legend:{labels:{}},tooltip:{}}};
}

const toast = (message) => {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
};

const palette = {deep:'#0F2A5F',primary:'#1E3A8A',ai:'#2563EB',azure:'#38BDF8',success:'#059669',warning:'#D97706',danger:'#DC2626',muted:'#94A3B8',border:'#E2E8F0'};
Chart.defaults.font.family = "Inter, 'Noto Sans Thai', sans-serif";
Chart.defaults.color = '#475569';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
Chart.defaults.plugins.tooltip.padding = 10;

const labels30 = ['13 Jun','15 Jun','17 Jun','19 Jun','21 Jun','23 Jun','25 Jun','27 Jun','29 Jun','01 Jul','03 Jul','05 Jul','07 Jul','09 Jul','11 Jul'];
const volumeSets = {
  daily: {labels:labels30, created:[4,6,5,8,7,9,8,10,7,11,9,12,10,13,14], signed:[3,5,5,7,6,8,8,9,7,10,9,11,11,12,13], voided:[0,0,1,0,0,1,0,0,0,1,0,0,1,0,0], reissued:[0,1,0,0,1,0,0,1,0,0,0,1,0,0,0]},
  weekly: {labels:['W1','W2','W3','W4'], created:[27,36,31,34], signed:[24,32,33,35], voided:[1,1,1,1], reissued:[1,1,1,1]},
  monthly: {labels:['Apr','May','Jun','Jul'], created:[102,116,121,128], signed:[94,109,115,120], voided:[4,3,5,4], reissued:[3,4,3,4]}
};
const volumeChart = new Chart(document.getElementById('volumeChart'), {
  type:'line', data:{labels:volumeSets.daily.labels,datasets:[
    {label:'Created',data:volumeSets.daily.created,borderColor:palette.ai,backgroundColor:'rgba(37,99,235,.12)',fill:true,tension:.35},
    {label:'Signed',data:volumeSets.daily.signed,borderColor:palette.success,backgroundColor:'rgba(5,150,105,.05)',tension:.35},
    {label:'Voided',data:volumeSets.daily.voided,borderColor:palette.danger,tension:.25},
    {label:'Reissued',data:volumeSets.daily.reissued,borderColor:palette.warning,tension:.25}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},scales:{y:{beginAtZero:true,grid:{color:'#EEF2F7'}},x:{grid:{display:false}}},plugins:{legend:{position:'bottom'}}}
});
new Chart(document.getElementById('statusChart'),{type:'doughnut',data:{labels:['Draft','Ready to Sign','Signed','Voided','Reissued'],datasets:[{data:[22,12,86,4,4],backgroundColor:[palette.muted,palette.warning,palette.success,palette.danger,palette.ai],borderWidth:0,hoverOffset:7}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false}}}});
new Chart(document.getElementById('stageChart'),{type:'bar',data:{labels:['Data Preparation','AI Draft','Physician Review','Signature','PDF Export','Delivery'],datasets:[{label:'Actual (min)',data:[3.4,.8,9.4,2.4,1.1,1.3],backgroundColor:[palette.ai,palette.success,palette.warning,palette.ai,palette.ai,palette.ai],borderRadius:6},{label:'SLA (min)',data:[5,2,8,3,2,2],backgroundColor:'#CBD5E1',borderRadius:6}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{beginAtZero:true,grid:{color:'#EEF2F7'}},y:{grid:{display:false}}},plugins:{legend:{position:'bottom'}}}});
new Chart(document.getElementById('tatChart'),{type:'line',data:{labels:['1 Jul','2','3','4','5','6','7','8','9','10','11','12'],datasets:[{label:'Actual TAT',data:[19,17,23,16,18,21,17,15,19,18,22,18],borderColor:palette.ai,tension:.35},{label:'SLA Target',data:Array(12).fill(20),borderColor:palette.danger,borderDash:[6,6],pointRadius:0},{label:'Previous Period',data:[22,21,20,23,19,24,20,22,21,19,23,21],borderColor:palette.muted,tension:.35}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{color:'#EEF2F7'}},x:{grid:{display:false}}},plugins:{legend:{position:'bottom'}}}});
new Chart(document.getElementById('claimChart'),{type:'doughnut',data:{labels:['Ready','Needs Review','Not Ready'],datasets:[{data:[110,18,0],backgroundColor:[palette.success,palette.warning,palette.danger],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:(c)=>`${c.label}: ${c.raw} certificates`}}}}});
new Chart(document.getElementById('missingChart'),{type:'bar',data:{labels:['Signature Missing','Clinical Statement','Diagnosis Missing','ICD-10 Mismatch','Rest Unsupported','Visit Date','Claim Ref','Supporting Doc'],datasets:[{label:'Cases',data:[12,9,7,6,5,4,3,2],backgroundColor:[palette.danger,palette.warning,palette.warning,palette.warning,palette.ai,palette.ai,palette.ai,palette.ai],borderRadius:6}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,onClick:()=>{document.getElementById('worklistSection').scrollIntoView();toast('Worklist filtered by missing evidence');},scales:{x:{beginAtZero:true,grid:{color:'#EEF2F7'}},y:{grid:{display:false}}},plugins:{legend:{display:false}}}});
new Chart(document.getElementById('ruleChart'),{type:'bar',data:{labels:['Clinical Completeness','Diagnosis & ICD','Certificate Integrity','Payer Alignment','Signature Compliance','Claim Evidence'],datasets:[{label:'Passed',data:[110,106,118,103,112,109],backgroundColor:palette.success},{label:'Warning',data:[13,16,7,19,10,14],backgroundColor:palette.warning},{label:'Failed',data:[5,6,3,6,6,5],backgroundColor:palette.danger}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{stacked:true,grid:{color:'#EEF2F7'}},y:{stacked:true,grid:{display:false}}},plugins:{legend:{position:'bottom'}}}});
new Chart(document.getElementById('voidChart'),{type:'bar',data:{labels:['W1','W2','W3','W4','W5','W6'],datasets:[{label:'Voided',data:[2.2,2.5,2.1,3.2,2.8,3.0],backgroundColor:palette.danger,borderRadius:5},{label:'Reissued',data:[1.8,2.0,2.4,2.7,3.0,3.4],backgroundColor:palette.ai,borderRadius:5},{label:'Corrected before signing',data:[4.4,4.0,3.7,3.5,3.1,2.8],backgroundColor:palette.warning,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{color:'#EEF2F7'}},x:{grid:{display:false}}},plugins:{legend:{position:'bottom'}}}});
new Chart(document.getElementById('typeChart'),{type:'bar',data:{labels:['Sick Leave','Insurance Claim','Fitness to Work','Referral','Travel / Fitness','Other'],datasets:[{data:[52,31,18,11,9,7],backgroundColor:palette.ai,borderRadius:6}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{beginAtZero:true,grid:{color:'#EEF2F7'}},y:{grid:{display:false}}},plugins:{legend:{display:false}}}});
new Chart(document.getElementById('diagnosisChart'),{type:'bar',data:{labels:['Upper Respiratory Infection','Gastroenteritis','Migraine','Musculoskeletal Pain','Influenza','Allergic Condition','Minor Injury','Other'],datasets:[{label:'Certificates',data:[29,25,24,16,12,9,7,6],backgroundColor:palette.primary,borderRadius:6}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{beginAtZero:true,grid:{color:'#EEF2F7'}},y:{grid:{display:false}}},plugins:{legend:{display:false}}}});
let economicChart;
const createEconomicChart=()=>{if(economicChart)return;economicChart=new Chart(document.getElementById('economicChart'),{type:'bar',data:{labels:['Processing Time (min)','Cost / Certificate (index)','Rework Rate (%)'],datasets:[{label:'Manual',data:[32,78,11],backgroundColor:palette.muted,borderRadius:6},{label:'AI Assisted',data:[18,48,4],backgroundColor:palette.ai,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{color:'#EEF2F7'}},x:{grid:{display:false}}},plugins:{legend:{position:'bottom'}}}});};

const riskRows=['Missing Signature','ICD Mismatch','Date Inconsistency','Duplicate Certificate','Unsupported Rest Days','Patient Data Mismatch','Unauthorized Modification','Signature Validation Failure'];
const riskValues=[[7,3,2,0],[6,4,1,0],[5,3,1,0],[2,1,1,1],[4,3,2,0],[3,2,1,0],[0,1,1,0],[1,0,0,1]];
const heat=document.getElementById('riskHeatmap');
heat.innerHTML='<div></div>'+['Low','Medium','High','Critical'].map(x=>`<div class="heat-head">${x}</div>`).join('');
riskRows.forEach((row,i)=>{heat.insertAdjacentHTML('beforeend',`<div class="heat-label">${row}</div>`);riskValues[i].forEach((v,j)=>{const cls=['low','medium','high','critical'][j];heat.insertAdjacentHTML('beforeend',`<button class="heat-cell ${cls}" data-risk="${['Low','Medium','High','Critical'][j]}" aria-label="${row}, ${v} cases, ${['Low','Medium','High','Critical'][j]} risk">${v}<small>cases</small></button>`);});});
heat.addEventListener('click',e=>{const b=e.target.closest('.heat-cell');if(!b)return;document.getElementById('riskFilter').value=b.dataset.risk;applyWorklistFilters();document.getElementById('worklistSection').scrollIntoView();toast(`${b.dataset.risk} risk filter applied`);});

const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], times=['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const demand=document.getElementById('demandGrid');demand.innerHTML='<div></div>'+days.map(d=>`<div class="demand-head">${d}</div>`).join('');
times.forEach((t,ri)=>{demand.insertAdjacentHTML('beforeend',`<div class="demand-head">${t}</div>`);days.forEach((d,di)=>{const val=[3,5,8,7,4,2,1][di]+((ri===1||ri===2)?4:0)+(ri%3);const level=Math.min(5,Math.max(1,Math.ceil(val/3)));demand.insertAdjacentHTML('beforeend',`<div class="d${level}" title="${d} ${t}: ${val} requests">${val}</div>`);});});

const worklist=[
 {risk:'Critical',certificate:'MC-20260712-0007',patient:'Narin S.',hn:'HN-000412',date:'12 Jul 2026',type:'Insurance Claim',physician:'Dr. Anan T.',status:'Ready to Sign',claim:'Not Ready',alert:'Signed document hash validation failed',reviewer:'P. Wipa',aging:'42 min'},
 {risk:'High',certificate:'MC-20260712-0005',patient:'Suda P.',hn:'HN-000388',date:'12 Jul 2026',type:'Sick Leave',physician:'Dr. Suda P.',status:'Ready to Sign',claim:'Needs Review',alert:'Physician signature missing',reviewer:'Unassigned',aging:'38 min'},
 {risk:'High',certificate:'MC-20260712-0003',patient:'Anan T.',hn:'HN-000351',date:'12 Jul 2026',type:'Insurance Claim',physician:'Dr. Anan T.',status:'Draft',claim:'Needs Review',alert:'ICD does not match diagnosis',reviewer:'K. Nicha',aging:'31 min'},
 {risk:'Medium',certificate:'MC-20260712-0002',patient:'Mali R.',hn:'HN-000329',date:'12 Jul 2026',type:'Fitness to Work',physician:'Dr. Suda P.',status:'Draft',claim:'Ready',alert:'Rest period exceeds guideline',reviewer:'Unassigned',aging:'24 min'},
 {risk:'Medium',certificate:'MC-20260711-0018',patient:'Preecha K.',hn:'HN-000274',date:'11 Jul 2026',type:'Sick Leave',physician:'Dr. Anan T.',status:'Signed',claim:'Needs Review',alert:'Claim evidence incomplete',reviewer:'P. Wipa',aging:'3 h'},
 {risk:'Low',certificate:'MC-20260711-0016',patient:'Kanya M.',hn:'HN-000261',date:'11 Jul 2026',type:'Referral',physician:'Dr. Narin S.',status:'Signed',claim:'Ready',alert:'Supporting document pending',reviewer:'K. Nicha',aging:'4 h'},
 {risk:'High',certificate:'MC-20260711-0014',patient:'Somchai K.',hn:'HN-000238',date:'11 Jul 2026',type:'Insurance Claim',physician:'Dr. Anan T.',status:'Voided',claim:'Not Ready',alert:'Duplicate certificate detected',reviewer:'P. Wipa',aging:'5 h'},
 {risk:'Medium',certificate:'MC-20260711-0012',patient:'Lalita C.',hn:'HN-000221',date:'11 Jul 2026',type:'Sick Leave',physician:'Dr. Suda P.',status:'Ready to Sign',claim:'Needs Review',alert:'Patient information mismatch',reviewer:'Unassigned',aging:'6 h'},
 {risk:'Low',certificate:'MC-20260710-0009',patient:'Chaiwat B.',hn:'HN-000198',date:'10 Jul 2026',type:'Fitness to Work',physician:'Dr. Narin S.',status:'Signed',claim:'Ready',alert:'Clinical statement reviewed',reviewer:'K. Nicha',aging:'1 d'},
 {risk:'Medium',certificate:'MC-20260710-0007',patient:'Siri N.',hn:'HN-000177',date:'10 Jul 2026',type:'Insurance Claim',physician:'Dr. Anan T.',status:'Draft',claim:'Needs Review',alert:'Visit date inconsistency',reviewer:'Unassigned',aging:'1 d'},
 {risk:'High',certificate:'MC-20260710-0004',patient:'Thanakorn W.',hn:'HN-000145',date:'10 Jul 2026',type:'Sick Leave',physician:'Dr. Suda P.',status:'Ready to Sign',claim:'Needs Review',alert:'Unauthorized modification blocked',reviewer:'P. Wipa',aging:'1 d'},
 {risk:'Low',certificate:'MC-20260709-0019',patient:'Praew A.',hn:'HN-000119',date:'09 Jul 2026',type:'Travel / Fitness',physician:'Dr. Narin S.',status:'Signed',claim:'Ready',alert:'No open alert',reviewer:'K. Nicha',aging:'2 d'}
];
let currentPage=1, pageSize=6, filtered=[...worklist], sortAsc=true;
const statusClass=v=>v==='Signed'||v==='Ready'?'s-success':v==='Not Ready'||v==='Critical'?'s-danger':v==='Needs Review'||v==='Ready to Sign'||v==='High'?'s-warning':v==='Draft'||v==='Medium'?'s-info':'s-neutral';
function renderWorklist(){
  const body=document.getElementById('worklistBody');body.innerHTML='';
  const start=(currentPage-1)*pageSize,end=Math.min(start+pageSize,filtered.length);
  filtered.slice(start,end).forEach((r,i)=>body.insertAdjacentHTML('beforeend',`<tr>
    <td><input type="checkbox" class="row-check"></td><td><span class="status ${statusClass(r.risk)}">${r.risk}</span></td><td><b>${r.certificate}</b></td><td>${r.patient}</td><td>${r.hn}</td><td>${r.date}</td><td>${r.type}</td><td>${r.physician}</td><td><span class="status ${statusClass(r.status)}">${r.status}</span></td><td><span class="status ${statusClass(r.claim)}">${r.claim}</span></td><td>${r.alert}</td><td>${r.reviewer}</td><td>${r.aging}</td><td><div class="table-actions"><button class="btn btn-ghost open-row" style="min-height:34px;padding:0 10px">Open</button><button class="btn btn-ghost resolve-row" style="min-height:34px;padding:0 10px">Resolve</button></div></td></tr>`));
  document.getElementById('pageInfo').textContent=filtered.length?`Showing ${start+1}–${end} of ${filtered.length} records`:'No certificates match the selected filters.';
}
function applyWorklistFilters(){
  const q=(document.getElementById('tableSearch').value||document.getElementById('worklistSearchTop').value||'').toLowerCase();
  const risk=document.getElementById('riskFilter').value,status=document.getElementById('statusFilter').value,claim=document.getElementById('claimFilter').value;
  filtered=worklist.filter(r=>(!q||Object.values(r).join(' ').toLowerCase().includes(q))&&(!risk||r.risk===risk)&&(!status||r.status===status)&&(!claim||r.claim===claim));
  currentPage=1;renderWorklist();
}
renderWorklist();
document.getElementById('tableSearch').addEventListener('input',applyWorklistFilters);
document.getElementById('applyFilters').onclick=()=>{applyWorklistFilters();toast('Filter applied successfully');};
document.getElementById('resetFilters').onclick=()=>{document.querySelectorAll('.filter-input').forEach(el=>el.selectedIndex!==undefined?el.selectedIndex=0:el.value='');document.getElementById('tableSearch').value='';filtered=[...worklist];currentPage=1;renderWorklist();toast('Filters reset');};
document.getElementById('saveView').onclick=()=>toast('Dashboard view saved');
document.getElementById('prevPage').onclick=()=>{if(currentPage>1){currentPage--;renderWorklist();}};
document.getElementById('nextPage').onclick=()=>{if(currentPage*pageSize<filtered.length){currentPage++;renderWorklist();}};
document.querySelectorAll('.sort').forEach(btn=>btn.onclick=()=>{const k=btn.dataset.sort;filtered.sort((a,b)=>sortAsc?String(a[k]).localeCompare(String(b[k])):String(b[k]).localeCompare(String(a[k])));sortAsc=!sortAsc;renderWorklist();});
document.getElementById('selectAll').onchange=e=>document.querySelectorAll('.row-check').forEach(c=>c.checked=e.target.checked);
document.getElementById('bulkAssign').onclick=()=>toast('Certificate assigned to reviewer');
document.getElementById('exportSelected').onclick=()=>toast('Selected certificates prepared for export');
document.getElementById('worklistBody').addEventListener('click',e=>{if(e.target.closest('.open-row'))openWorkspace();if(e.target.closest('.resolve-row')){e.target.closest('tr').style.opacity='.45';toast('Certificate marked as resolved');}});

document.querySelectorAll('.kpi').forEach(k=>k.addEventListener('click',()=>{
  const f=k.dataset.kpiFilter;
  if(f==='awaiting')document.getElementById('statusFilter').value='Ready to Sign';
  if(f==='signed')document.getElementById('statusFilter').value='Signed';
  if(f==='claim')document.getElementById('claimFilter').value='Ready';
  if(f==='sla')document.getElementById('riskFilter').value='High';
  applyWorklistFilters();document.getElementById('worklistSection').scrollIntoView();toast('Worklist updated from KPI selection');
}));

document.querySelectorAll('.period-btn').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const d=volumeSets[btn.dataset.period];volumeChart.data.labels=d.labels;
  ['created','signed','voided','reissued'].forEach((k,i)=>volumeChart.data.datasets[i].data=d[k]);
  volumeChart.update();toast(`${btn.textContent} view applied`);
});

const modal=document.getElementById('workspaceModal');
function openWorkspace(){modal.classList.add('open');document.body.style.overflow='hidden';document.getElementById('closeWorkspace').focus();toast('Certificate workspace opened');}
function closeWorkspace(){modal.classList.remove('open');document.body.style.overflow='';}
document.querySelectorAll('[data-open-workspace]').forEach(b=>b.onclick=openWorkspace);
document.getElementById('closeWorkspace').onclick=closeWorkspace;
modal.addEventListener('click',e=>{if(e.target===modal)closeWorkspace();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeWorkspace();});
['generateDraft','saveDraft','submitSignature','previewPdf','exportPdf'].forEach(id=>document.getElementById(id).onclick=()=>{
  const messages={generateDraft:'AI draft generated for physician review',saveDraft:'Draft saved successfully',submitSignature:'Submitted for physician signature',previewPdf:'PDF preview refreshed',exportPdf:'Certificate PDF prepared'};
  toast(messages[id]);
});

const econ=document.getElementById('economicSection');
document.getElementById('economicToggle').onclick=()=>{econ.classList.toggle('open');const open=econ.classList.contains('open');document.getElementById('economicToggle').setAttribute('aria-expanded',open);document.getElementById('economicArrow').textContent=open?'−':'＋';if(open)createEconomicChart();};

const activities=[
 ['AI Draft Generated','Dr. Anan T. · Physician','MC-20260712-0007 · Narin S. · 10:18 ICT','AUD-7F3A'],
 ['Submitted for Signature','Clinic Staff · Bangkok Main','MC-20260712-0005 · Suda P. · 10:12 ICT','AUD-4D11'],
 ['Certificate Signed','Dr. Suda P. · Physician','MC-20260712-0004 · Mali R. · 10:06 ICT','AUD-AB92'],
 ['Claim Evidence Validated','Insurance Review Engine','MC-20260712-0003 · Anan T. · 09:58 ICT','AUD-CC81'],
 ['Compliance Alert Created','Compliance Guard','MC-20260712-0002 · Mali R. · 09:46 ICT','AUD-E214'],
 ['PDF Exported','Clinic Staff · Web Browser','MC-20260712-0001 · Somchai K. · 09:31 ICT','AUD-882A'],
 ['Certificate Reissued','Dr. Narin S. · Physician','MC-20260711-0018 · Preecha K. · 09:20 ICT','AUD-019C'],
 ['Reviewer Assigned','P. Wipa · Claim Reviewer','MC-20260711-0016 · Kanya M. · 09:04 ICT','AUD-74BA']
];
document.getElementById('timeline').innerHTML=activities.map((a,i)=>`<div class="event"><div class="event-icon">${['✦','⇢','✓','◈','!','⇩','↻','☑'][i]}</div><div><h4>${a[0]}</h4><p>${a[1]}</p><p>${a[2]}</p></div><div class="audit-ref">${a[3]}</div></div>`).join('');
document.getElementById('auditBtn').onclick=()=>toast('Full audit trail opened');
document.getElementById('exportBtn').onclick=()=>toast('Dashboard report prepared');
document.getElementById('notifyBtn').onclick=()=>toast('3 unread notifications');
document.getElementById('copilotBtn').onclick=()=>toast('AI Copilot opened with certificate context');

const sidebar=document.getElementById('sidebar'), backdrop=document.getElementById('sidebarBackdrop');
document.getElementById('menuBtn').onclick=()=>{sidebar.classList.add('open');backdrop.classList.add('open');};
backdrop.onclick=()=>{sidebar.classList.remove('open');backdrop.classList.remove('open');};
document.querySelectorAll('.nav a').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelectorAll('.nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');toast(`${a.textContent.trim()} selected`);});

if(!chartsAvailable){document.querySelectorAll('.chart-wrap').forEach(el=>el.innerHTML='<div class="bottleneck">Unable to load chart library. Data summary remains available.</div>');}
