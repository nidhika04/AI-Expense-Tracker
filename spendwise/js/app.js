// ═══════════════════════════════════════════
//  SpendWise — app.js
//  All dashboard logic in ONE file.
//  No backend needed — localStorage is used.
// ═══════════════════════════════════════════

// ── Category data ──
const EXP_CATS = ['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Housing','Savings','Other'];
const INC_CATS = ['Salary','Freelance','Business','Investment','Gift','Other Income'];
const CAT_ICO  = {
  Food:'🍔',Travel:'✈️',Shopping:'🛍️',Bills:'⚡',Entertainment:'🎬',
  Health:'💊',Education:'📚',Housing:'🏠',Savings:'💰',Other:'📌',
  Salary:'💼',Freelance:'💻',Business:'📈',Investment:'📊',Gift:'🎁','Other Income':'💵'
};
//colors

const CAT_CLR = {
  Food:'#ffb86bb0',Travel:'#ffd93d',Shopping:'#6bcb77',Bills:'#4d96ff',
  Entertainment:'#c77dff',Health:'#06d6a0',Education:'#f4a261',Housing:'#e76f51',
  Savings:'#2ec46a',Other:'#adb5bd',Salary:'#06d6a0',Freelance:'#4d96ff',
  Business:'#c77dff',Investment:'#ffd93d',Gift:'#ff6b6b','Other Income':'#6bcb77'
};

// ── State ──
let txns    = [];
let addType = 'expense';
let editType= 'expense';
let editId  = null;
let pieCI=null, barCI=null, trendCI=null, repPieCI=null;

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  const user = JSON.parse(localStorage.getItem('sw_user') || 'null');
  if (!user) { window.location.href = '../index.html'; return; }

  // Show user info
  document.getElementById('uName').textContent  = user.name  || 'User';
  document.getElementById('uEmail').textContent = user.email || '';
  const ava = document.getElementById('ava');
  if (user.avatar) {
    ava.innerHTML = `<img src="${user.avatar}" alt="avatar"/>`;
  } else {
    ava.textContent = (user.name || 'U')[0].toUpperCase();
  }

  // Dark mode
  if (localStorage.getItem('sw_dark') === 'true') {
    document.body.classList.add('dark');
    document.getElementById('dkIco').className = 'fas fa-sun';
  }

  // Load transactions
  loadTxns();

  // Set today in date field
  document.getElementById('fDate').valueAsDate = new Date();

  // Populate category dropdowns
  fillCats('fCat','expense');
  fillCats('eCat','expense');
  fillFilterCats();

  // Render dashboard
  renderAll();
});

// ── Load transactions from localStorage ──
function loadTxns() {
  const user  = JSON.parse(localStorage.getItem('sw_user') || '{}');
  const key   = 'sw_txns_' + (user.email || 'guest');
  txns = JSON.parse(localStorage.getItem(key) || '[]');
}

// ── Save transactions to localStorage ──
function saveTxns() {
  const user = JSON.parse(localStorage.getItem('sw_user') || '{}');
  const key  = 'sw_txns_' + (user.email || 'guest');
  localStorage.setItem(key, JSON.stringify(txns));
}

// ═══════════════════════════════════════════
//  RENDER ALL DASHBOARD
// ═══════════════════════════════════════════
function renderAll() {
  updateCards();
  renderList('recentList', txns.slice(0,5), false);
  renderList('allList', txns, true);
  drawCharts();
}

// ── Summary cards ──
function updateCards() {
  const inc = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const exp = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  document.getElementById('cInc').textContent = '₹'+inc.toFixed(2);
  document.getElementById('cExp').textContent = '₹'+exp.toFixed(2);
  document.getElementById('cBal').textContent = '₹'+(inc-exp).toFixed(2);
}

// ═══════════════════════════════════════════
//  TRANSACTION LIST
// ═══════════════════════════════════════════
function renderList(id, list, showAct) {
  const el = document.getElementById(id);
  if (!list.length) {
    el.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i><p>No transactions yet. Add one!</p></div>`;
    return;
  }
  el.innerHTML = list.map((t,i) => `
    <div class="ti" style="animation-delay:${i*.04}s">
      <div class="tii ${t.type}">${CAT_ICO[t.category]||'💳'}</div>
      <div class="ti-info">
        <div class="ti-cat">${t.category}</div>
        <div class="ti-note">${t.note||'No note'}</div>
      </div>
      <div class="ti-date">${fmtDate(t.date)}</div>
      <div class="ti-amt ${t.type}">${t.type==='income'?'+':'-'}₹${t.amount.toFixed(2)}</div>
      ${showAct?`
      <div class="ti-act">
        <button class="be" onclick="openEdit('${t.id}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="bd" onclick="delTxn('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`:''}
    </div>
  `).join('');
}

// ── Date formatter ──
function fmtDate(ds) {
  return new Date(ds).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

// ═══════════════════════════════════════════
//   TRANSACTION ADD
// ═══════════════════════════════════════════
function setType(t) {
  addType = t;
  document.getElementById('ttExp').classList.toggle('active', t==='expense');
  document.getElementById('ttInc').classList.toggle('active', t==='income');
  fillCats('fCat', t);
}

function fillCats(selId, type) {
  const cats = type==='expense' ? EXP_CATS : INC_CATS;
  document.getElementById(selId).innerHTML =
    `<option value="">Select category</option>` +
    cats.map(c=>`<option value="${c}">${CAT_ICO[c]||''} ${c}</option>`).join('');
}

function fillFilterCats() {
  const all = [...EXP_CATS,...INC_CATS];
  document.getElementById('fCatF').innerHTML =
    `<option value="">All Categories</option>` +
    all.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function addTxn() {
  const amt  = parseFloat(document.getElementById('fAmt').value);
  const cat  = document.getElementById('fCat').value;
  const date = document.getElementById('fDate').value;
  const note = document.getElementById('fNote').value.trim();

  if (!amt || amt<=0) return showFMsg('Please enter a valid amount.','error');
  if (!cat)           return showFMsg('Please select a category.','error');
  if (!date)          return showFMsg('Please select a date.','error');

  const t = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    type: addType, amount: amt, category: cat, date, note,
    createdAt: new Date().toISOString()
  };
  txns.unshift(t);
  saveTxns();

  //  form reset
  document.getElementById('fAmt').value  = '';
  document.getElementById('fNote').value = '';
  document.getElementById('fDate').valueAsDate = new Date();
  fillCats('fCat', addType);

  showFMsg('Transaction saved!','success');
  renderAll();
  setTimeout(()=>go('dashboard'), 1100);
}

function showFMsg(msg, type) {
  const el = document.getElementById('fMsg');
  el.textContent = msg; el.className = 'fmsg '+type;
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'), 2800);
}

// ═══════════════════════════════════════════
//   TRANSACTION EDIT
// ═══════════════════════════════════════════
function openEdit(id) {
  const t = txns.find(x=>x.id===id);
  if (!t) return;
  editId   = id;
  editType = t.type;
  document.getElementById('eAmt').value  = t.amount;
  document.getElementById('eNote').value = t.note||'';
  document.getElementById('eDate').value = t.date;
  document.getElementById('etExp').classList.toggle('active', t.type==='expense');
  document.getElementById('etInc').classList.toggle('active', t.type==='income');
  fillCats('eCat', t.type);
  document.getElementById('eCat').value = t.category;
  document.getElementById('editModal').classList.add('open');
}

function setEType(t) {
  editType = t;
  document.getElementById('etExp').classList.toggle('active',t==='expense');
  document.getElementById('etInc').classList.toggle('active',t==='income');
  fillCats('eCat',t);
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editId = null;
}

function saveEdit() {
  if (!editId) return;
  const idx = txns.findIndex(x=>x.id===editId);
  if (idx===-1) return;

  const amt  = parseFloat(document.getElementById('eAmt').value);
  const cat  = document.getElementById('eCat').value;
  const date = document.getElementById('eDate').value;
  const note = document.getElementById('eNote').value.trim();

  if (!amt||amt<=0||!cat||!date) { showToast('Fill all fields!','error'); return; }

  txns[idx] = { ...txns[idx], type:editType, amount:amt, category:cat, date, note };
  saveTxns();
  closeModal();
  renderAll();
  showToast('Transaction updated!','success');
}

// ── DELETE ──
function delTxn(id) {
  if (!confirm('Delete this transaction?')) return;
  txns = txns.filter(t=>t.id!==id);
  saveTxns();
  renderAll();
  showToast('Transaction deleted.','info');
}

// ═══════════════════════════════════════════
//   SEARCH & FILTER
// ═══════════════════════════════════════════
function renderFiltered() {
  const srch = document.getElementById('srch').value.toLowerCase();
  const type = document.getElementById('fType').value;
  const cat  = document.getElementById('fCatF').value;
  const from = document.getElementById('fFrom').value;
  const to   = document.getElementById('fTo').value;

  const res = txns.filter(t=>{
    if (type && t.type!==type)      return false;
    if (cat  && t.category!==cat)   return false;
    if (srch && !t.category.toLowerCase().includes(srch) && !(t.note||'').toLowerCase().includes(srch)) return false;
    if (from && t.date<from)         return false;
    if (to   && t.date>to)           return false;
    return true;
  });
  renderList('allList', res, true);
}

function clearF() {
  ['srch','fFrom','fTo'].forEach(id=>document.getElementById(id).value='');
  ['fType','fCatF'].forEach(id=>document.getElementById(id).value='');
  renderList('allList', txns, true);
}

// ═══════════════════════════════════════════
//  CHARTS (Chart.js)
// ═══════════════════════════════════════════
function drawCharts() {
  drawPie(); drawBar();
}

function thm() {
  const d = document.body.classList.contains('dark');
  return { txt: d?'#a7a9be':'#6b6880', grid: d?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)', bg: d?'#1a1828':'#fff' };
}

function drawPie() {
  const exps = txns.filter(t=>t.type==='expense');
  const totals = {};
  exps.forEach(t=>{ totals[t.category]=(totals[t.category]||0)+t.amount; });
  const labels = Object.keys(totals);
  const vals   = Object.values(totals);
  const colors = labels.map(l=>CAT_CLR[l]||'#adb5bd');
  if (pieCI) pieCI.destroy();
  const t = thm();
  pieCI = new Chart(document.getElementById('pieChart').getContext('2d'),{
    type:'doughnut',
    data:{ labels, datasets:[{ data:vals, backgroundColor:colors, borderColor:t.bg, borderWidth:3, hoverOffset:8 }] },
    options:{ responsive:true, plugins:{
      legend:{ position:'bottom', labels:{ color:t.txt, font:{family:'DM Sans',size:11}, boxWidth:12, padding:12 }},
      tooltip:{ callbacks:{ label:c=>` ₹${c.parsed.toFixed(2)} (${c.label})` }}
    }}
  });
}

function drawBar() {
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const inc=new Array(12).fill(0), exp=new Array(12).fill(0);
  const yr = new Date().getFullYear();
  txns.forEach(t=>{
    const d=new Date(t.date);
    if(d.getFullYear()!==yr) return;
    const m=d.getMonth();
    if(t.type==='income') inc[m]+=t.amount; else exp[m]+=t.amount;
  });
  if (barCI) barCI.destroy();
  const t = thm();
  barCI = new Chart(document.getElementById('barChart').getContext('2d'),{
    type:'bar',
    data:{ labels:months, datasets:[
      { label:'Income', data:inc, backgroundColor:'rgba(6,214,160,.8)', borderRadius:6, borderSkipped:false },
      { label:'Expense', data:exp, backgroundColor:'rgba(239,35,60,.8)', borderRadius:6, borderSkipped:false }
    ]},
    options:{ responsive:true, plugins:{
      legend:{ labels:{ color:t.txt, font:{family:'DM Sans',size:11}, boxWidth:12 }},
      tooltip:{ callbacks:{ label:c=>` ₹${c.parsed.y.toFixed(2)}` }}
    },
    scales:{
      x:{ grid:{color:t.grid}, ticks:{color:t.txt} },
      y:{ grid:{color:t.grid}, ticks:{color:t.txt, callback:v=>`₹${v}` }}
    }}
  });
}

function loadReportCharts() {
  drawTrend(); drawRepPie();
}

function drawTrend() {
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const inc=new Array(12).fill(0), exp=new Array(12).fill(0);
  const yr = new Date().getFullYear();
  txns.forEach(t=>{
    const d=new Date(t.date);
    if(d.getFullYear()!==yr) return;
    const m=d.getMonth();
    if(t.type==='income') inc[m]+=t.amount; else exp[m]+=t.amount;
  });
  if (trendCI) trendCI.destroy();
  const t = thm();
  trendCI = new Chart(document.getElementById('trendChart').getContext('2d'),{
    type:'line',
    data:{ labels:months, datasets:[
      { label:'Income', data:inc, borderColor:'#06d6a0', backgroundColor:'rgba(6,214,160,.1)', tension:.4, fill:true, pointBackgroundColor:'#06d6a0', pointRadius:4 },
      { label:'Expense', data:exp, borderColor:'#ef233c', backgroundColor:'rgba(239,35,60,.1)', tension:.4, fill:true, pointBackgroundColor:'#ef233c', pointRadius:4 }
    ]},
    options:{ responsive:true, plugins:{
      legend:{ labels:{ color:t.txt, font:{family:'DM Sans',size:11}, boxWidth:12 }}
    },
    scales:{
      x:{ grid:{color:t.grid}, ticks:{color:t.txt} },
      y:{ grid:{color:t.grid}, ticks:{color:t.txt, callback:v=>`₹${v}`} }
    }}
  });
}

function drawRepPie() {
  const exps = txns.filter(t=>t.type==='expense');
  const totals = {};
  exps.forEach(t=>{ totals[t.category]=(totals[t.category]||0)+t.amount; });
  const labels=Object.keys(totals), vals=Object.values(totals), colors=labels.map(l=>CAT_CLR[l]||'#adb5bd');
  if (repPieCI) repPieCI.destroy();
  const t = thm();
  repPieCI = new Chart(document.getElementById('repPie').getContext('2d'),{
    type:'pie',
    data:{ labels, datasets:[{ data:vals, backgroundColor:colors, borderColor:t.bg, borderWidth:2 }] },
    options:{ responsive:true, plugins:{
      legend:{ position:'right', labels:{ color:t.txt, font:{family:'DM Sans',size:11}, boxWidth:14 }},
      tooltip:{ callbacks:{ label:c=>` ₹${c.parsed.toFixed(2)}` }}
    }}
  });
}

// ═══════════════════════════════════════════
//  AI INSIGHTS
// ═══════════════════════════════════════════
function loadAI() {
  const grid = document.getElementById('insGrid');
  const now  = new Date();
  const msStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const msEnd   = new Date(now.getFullYear(), now.getMonth()+1, 0);
  const pmStart = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const pmEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

  const curExp  = txns.filter(t=>t.type==='expense' && new Date(t.date)>=msStart && new Date(t.date)<=msEnd);
  const prevExp = txns.filter(t=>t.type==='expense' && new Date(t.date)>=pmStart  && new Date(t.date)<=pmEnd);
  const curInc  = txns.filter(t=>t.type==='income'  && new Date(t.date)>=msStart && new Date(t.date)<=msEnd);

  const totCurExp  = curExp.reduce((s,t)=>s+t.amount,0);
  const totPrevExp = prevExp.reduce((s,t)=>s+t.amount,0);
  const totCurInc  = curInc.reduce((s,t)=>s+t.amount,0);

  const catTotals={}, prevCatTotals={};
  curExp.forEach(t=>{  catTotals[t.category]    =(catTotals[t.category]||0)+t.amount; });
  prevExp.forEach(t=>{ prevCatTotals[t.category]=(prevCatTotals[t.category]||0)+t.amount; });

  const insights=[];

  if (!txns.length) {
    grid.innerHTML=`<div class="ins-card info"><div class="ins-t">👋 Welcome!</div><div class="ins-m">Add some transactions to get personalized AI insights about your spending habits.</div></div>`;
    return;
  }

  // Spending spike
  if (totPrevExp>0 && totCurExp>totPrevExp*1.2) {
    const pct=Math.round(((totCurExp-totPrevExp)/totPrevExp)*100);
    insights.push({ type:'warning', icon:'⚠️', title:'Spending Spike!', msg:`Your spending is up ${pct}% vs last month. Current: ₹${totCurExp.toFixed(0)}, Last month: ₹${totPrevExp.toFixed(0)}.` });
  }

  // Category spikes
  Object.keys(catTotals).forEach(cat=>{
    const cur=catTotals[cat], prev=prevCatTotals[cat]||0;
    if (prev>0 && cur>prev*1.3) {
      const pct=Math.round(((cur-prev)/prev)*100);
      insights.push({ type:'warning', icon:'📈', title:`High ${cat} Spending`, msg:`You spent ${pct}% more on ${cat} this month (₹${cur.toFixed(0)} vs ₹${prev.toFixed(0)} last month).` });
    }
  });

  // Top category
  if (Object.keys(catTotals).length) {
    const top=Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
    insights.push({ type:'info', icon:'🏷️', title:'Top Spending Category', msg:`Your biggest expense this month is ${top[0]} at ₹${top[1].toFixed(0)}.` });
  }

  // Savings rate
  if (totCurInc>0) {
    const rate=((totCurInc-totCurExp)/totCurInc)*100;
    if (rate<20) {
      insights.push({ type:'warning', icon:'💰', title:'Low Savings Rate', msg:`You're saving only ${rate.toFixed(0)}% of income this month. Aim for at least 20%.` });
    } else {
      insights.push({ type:'success', icon:'🎉', title:'Great Savings!', msg:`You're saving ${rate.toFixed(0)}% of your income this month. Keep it up!` });
    }
  }

  // Good spending
  if (totPrevExp>0 && totCurExp<=totPrevExp) {
    insights.push({ type:'success', icon:'✅', title:'Spending Under Control', msg:`Your spending this month (₹${totCurExp.toFixed(0)}) is within last month's (₹${totPrevExp.toFixed(0)}). Well done!` });
  }

  // No insights
  if (!insights.length) {
    insights.push({ type:'info', icon:'📊', title:'Keep Tracking!', msg:'Add more transactions this month to unlock personalized spending insights and predictions.' });
  }

  grid.innerHTML = insights.map((ins,i)=>`
    <div class="ins-card ${ins.type}" style="animation-delay:${i*.08}s">
      <div class="ins-t">${ins.icon} ${ins.title}</div>
      <div class="ins-m">${ins.msg}</div>
    </div>`).join('');

  // Tips
  const tips=['📅 Review subscriptions monthly to cancel unused ones.','🛍️ Use a 24-hour rule before non-essential purchases.','📊 Track every expense — small ones add up fast!','🎯 Set a monthly budget for each category.','💡 Try cooking at home more to reduce food expenses.'];
  document.getElementById('tipsList').innerHTML = tips.map(t=>`<li>${t}</li>`).join('');
  document.getElementById('tipsBox').style.display='block';

  // Prediction
  const days=now.getDate(), daysInMonth=msEnd.getDate();
  if (days>=5 && totCurExp>0) {
    const pred=(totCurExp/days)*daysInMonth;
    document.getElementById('predTxt').innerHTML=`
      At your current spending pace, you'll spend approx <strong>₹${pred.toFixed(0)}</strong> this month.<br><br>
      Current expenses: ₹${totCurExp.toFixed(0)} &nbsp;|&nbsp; Current income: ₹${totCurInc.toFixed(0)}<br>
      Projected savings: ₹${(totCurInc-pred).toFixed(0)}
    `;
    document.getElementById('predBox').style.display='block';
  }
}

// ═══════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════
function go(name) {
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nl').forEach(l=>l.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');

  const titles={dashboard:'Dashboard',add:'Add Transaction',txns:'Transactions',reports:'Reports',ai:'AI Insights'};
  document.getElementById('ptitle').textContent = titles[name]||'Dashboard';

  document.querySelectorAll('.nl').forEach(l=>{
    const oc=l.getAttribute('onclick')||'';
    if(oc.includes(`'${name}'`)) l.classList.add('active');
  });

  if(name==='ai')      loadAI();
  if(name==='reports') loadReportCharts();
  if(window.innerWidth<=768) closeSidebar();
}

// ═══════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ═══════════════════════════════════════════
//  DARK MODE
// ═══════════════════════════════════════════
function toggleDark() {
  document.body.classList.toggle('dark');
  const d=document.body.classList.contains('dark');
  localStorage.setItem('sw_dark', d);
  document.getElementById('dkIco').className=d?'fas fa-sun':'fas fa-moon';
  setTimeout(drawCharts,100);
}

// ═══════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════
function toggleExpMenu() {
  document.getElementById('expMenu').classList.toggle('open');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.exp-wrap')) document.getElementById('expMenu')?.classList.remove('open');
});

function exportCSV() {
  if(!txns.length) return showToast('No transactions to export!','error');
  const hdr=['Date','Type','Category','Amount (INR)','Note'];
  const rows=txns.map(t=>[
    new Date(t.date).toLocaleDateString('en-IN'),
    t.type, t.category, t.amount.toFixed(2),
    `"${(t.note||'').replace(/"/g,'""')}"`
  ]);
  const csv=[hdr,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download=`spendwise_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('CSV exported!','success');
  document.getElementById('expMenu').classList.remove('open');
}

function exportPDF() {
  if(!txns.length) return showToast('No transactions to export!','error');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  const user=JSON.parse(localStorage.getItem('sw_user')||'{}');
  const today=new Date().toLocaleDateString('en-IN');

  doc.setFontSize(20); doc.setTextColor(108,71,255);
  doc.text('SpendWise — Transaction Report',14,22);
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`Generated: ${today}`,14,30);
  doc.text(`User: ${user.name||''} (${user.email||''})`,14,36);

  const inc=txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const exp=txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  doc.setFontSize(11); doc.setTextColor(0);
  doc.text(`Income: Rs.${inc.toFixed(2)}`,14,46);
  doc.text(`Expense: Rs.${exp.toFixed(2)}`,80,46);
  doc.text(`Balance: Rs.${(inc-exp).toFixed(2)}`,155,46);
  doc.setDrawColor(200); doc.line(14,50,196,50);

  let y=60;
  doc.setFontSize(9); doc.setTextColor(108,71,255); doc.setFont(undefined,'bold');
  doc.text('Date',14,y); doc.text('Type',50,y); doc.text('Category',76,y); doc.text('Note',116,y); doc.text('Amount',168,y,{align:'right'});
  doc.setFont(undefined,'normal');

  txns.forEach((t,i)=>{
    if(y>270){doc.addPage();y=20;}
    if(i%2===0){doc.setFillColor(245,244,255);doc.rect(13,y-5,183,8,'F');}
    const dStr=new Date(t.date).toLocaleDateString('en-IN');
    const aStr=`${t.type==='income'?'+':'-'} Rs.${t.amount.toFixed(2)}`;
    doc.setTextColor(50);
    doc.text(dStr,14,y); doc.text(t.type==='income'?'Income':'Expense',50,y);
    doc.text(t.category,76,y); doc.text((t.note||'—').substring(0,22),116,y);
    doc.setTextColor(t.type==='income'?[0,140,100]:[200,30,30]);
    doc.text(aStr,168,y,{align:'right'});
    y+=8;
  });

  doc.setFontSize(8); doc.setTextColor(150);
  doc.text('Generated by SpendWise — AI Expense Tracker',105,285,{align:'center'});
  doc.save(`spendwise_report_${new Date().toISOString().split('T')[0]}.pdf`);
  showToast('PDF exported!','success');
  document.getElementById('expMenu').classList.remove('open');
}

// ═══════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════
function logout() {
  if(!confirm('Are you sure you want to logout?')) return;
  localStorage.removeItem('sw_user');
  window.location.href='../index.html';
}

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
function showToast(msg, type='info') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className=`toast ${type} show`;
  setTimeout(()=>t.classList.remove('show'),3000);
}
