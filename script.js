// --- Navigation ---
const sections = ["signin","signup","viewer","upload","assistant"];
const nav = document.getElementById('nav');

function show(id){
  sections.forEach(s=>{
    document.getElementById(s).hidden = (s!==id);
    const btn = nav.querySelector(`[data-target="${s}"]`);
    if(btn) btn.classList.toggle('active', s===id);
  });
  // Focus first input for better UX
  const first = document.querySelector(`#${id} input, #${id} textarea, #${id} select`);
  if(first) first.focus();
  // Seed table when opening viewer first time
  if(id==='viewer' && !window.__seeded) seedReports();
}
nav.addEventListener('click', (e)=>{
  if(e.target.matches('[data-target]')) show(e.target.dataset.target);
});

// Default section
show('signin');
document.getElementById('year').textContent = new Date().getFullYear();

// --- Fake Auth (demo only) ---
function fakeSignIn(ev){
  ev.preventDefault();
  const s = document.getElementById('signinStatus');
  s.textContent = 'Verifying…'; s.className = 'status';
  setTimeout(()=>{
    s.textContent = 'Signed in (demo). Redirecting to Report Viewer…'; s.className='status ok';
    show('viewer');
  }, 700);
}
function fakeSignUp(ev){
  ev.preventDefault();
  const f = ev.target; const s = document.getElementById('signupStatus');
  const pw = f.password.value, cf = f.confirm.value, terms = document.getElementById('termsChk').checked;
  if(pw!==cf){ s.textContent='Passwords do not match.'; s.className='status err'; return; }
  if(!terms){ s.textContent='Please accept Terms & Privacy.'; s.className='status err'; return; }
  s.textContent='Creating account…'; s.className='status';
  setTimeout(()=>{ s.textContent='Account created (demo). You can now sign in.'; s.className='status ok'; show('signin'); }, 900);
}

// --- Reports Table (demo data) ---
const reportTable = document.getElementById('reportTable').querySelector('tbody');
const countInfo = document.getElementById('countInfo');
const SAMPLE = [
  {id:'RPT-1001', patient:'Alex Roy', type:'CBC',  date:'2025-08-10', status:'Ready'},
  {id:'RPT-1002', patient:'N. Sharma', type:'XRAY', date:'2025-08-12', status:'Reviewed'},
  {id:'RPT-1003', patient:'M. Rao',   type:'LFT',  date:'2025-08-18', status:'Pending'},
  {id:'RPT-1004', patient:'J. Das',   type:'MRI',  date:'2025-08-20', status:'Ready'},
  {id:'RPT-1005', patient:'S. Khan',  type:'KFT',  date:'2025-08-22', status:'Ready'}
];
function seedReports(){
  if(window.__seeded) { renderRows(window.__rows||SAMPLE); return; }
  window.__rows = SAMPLE.slice();
  window.__seeded = true; renderRows(window.__rows);
}
function renderRows(rows){
  reportTable.innerHTML = rows.map(r=>
    `<tr><td>${r.id}</td><td>${r.patient}</td><td>${r.type}</td><td>${r.date}</td><td>${r.status}</td></tr>`
  ).join('');
  countInfo.textContent = `${rows.length} report${rows.length!==1?'s':''}`;
}
function filterTable(){
  const q = (document.getElementById('search').value||'').toLowerCase();
  const t = (document.getElementById('filterType').value||'').toLowerCase();
  const rows = (window.__rows||[]).filter(r=>{
    const textMatch = `${r.id} ${r.patient} ${r.type}`.toLowerCase().includes(q);
    const typeMatch = !t || r.type.toLowerCase()===t;
    return textMatch && typeMatch;
  });
  renderRows(rows);
}

// --- Upload (demo only) ---
function fakeUpload(ev){
  ev.preventDefault();
  const s = document.getElementById('uploadStatus');
  const f = ev.target;
  const file = f.file.files[0];
  if(!file){ s.textContent='Select a file to upload.'; s.className='status err'; return; }
  s.textContent = 'Uploading… (demo)'; s.className='status';
  setTimeout(()=>{
    const newRow = { id: 'RPT-' + (1000 + Math.floor(Math.random()*9000)), patient: f.patient.value, type: f.rtype.value, date: f.rdate.value, status:'Pending' };
    window.__rows = [newRow].concat(window.__rows||[]);
    renderRows(window.__rows);
    s.textContent = `Uploaded ${file.name} • Added report ${newRow.id}`; s.className='status ok';
    f.reset();
  }, 900);
}

// --- AI Assistant (local demo) ---
const chat = document.getElementById('chat');
function addMsg(text, who='bot'){
  const div = document.createElement('div');
  div.className = `msg ${who==='me'?'me':'bot'}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function send(){
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  addMsg(text,'me');
  input.value='';
  setTimeout(()=>{
    let reply = 'I am a demo assistant. For medical advice, please consult a clinician.';
    if(/cbc/i.test(text)) reply = 'CBC (Complete Blood Count) measures RBC, WBC, platelets, hemoglobin, and more.';
    else if(/blood pressure|bp/i.test(text)) reply = 'Typical adult BP is around 120/80 mmHg. Consult your doctor for personal targets.';
    else if(/fast(ing)? blood sugar|fbs/i.test(text)) reply = 'For FBS tests: 8–12 hours of fasting (water allowed) is standard.';
    else if(/report|upload/i.test(text)) reply = 'Upload a PDF/image via the Upload section; it will appear in the Report Viewer (demo).';
    addMsg(reply,'bot');
  }, 600);
}
function quick(text){ document.getElementById('chatInput').value = text; send(); }
