const STORAGE_KEY = "modern-study-planner-v1";
const PRESETS_KEY = "modern-study-planner-presets-v1";
const THEME_KEY = "modern-study-planner-theme";
const BG_IMAGE_KEY = "modern-study-planner-bg-image";

const defaultData = {
  title: "",
  subtitle: "",
  studentName: "",
  planner: "",
  period: "",
  quote: "",
  fixedRoutines: [
    {title:"روتین فلسفه", text:""},
    {title:"روتین فنون", text:""},
    {title:"روتین ریاضی", text:""},
    {title:"روتین عربی", text:""}
  ],
  days: [
    {date:"", day:"شنبه", parts:["",""], routines:["",""]},
    {date:"", day:"یکشنبه", parts:["","",""], routines:["",""]},
    {date:"", day:"دوشنبه", parts:["","",""], routines:["",""]},
    {date:"", day:"سه‌شنبه", parts:["",""], routines:["",""]},
    {date:"", day:"چهارشنبه", parts:["","","",""], routines:["",""]},
    {date:"", day:"پنجشنبه", parts:["","",""], routines:["",""]},
    {date:"", day:"جمعه", parts:["",""], routines:["",""]}
  ],
  tips: ["","","","",""],
  notes: ""
};

const motivationalQuotes = [
  "هدف بزرگ، تلاش پیوسته، نتیجه درخشان",
  "هر روز یک قدم رو به پیش، کنکور رو شکست بدم",
  "ریاضی روشن است، فلسفه عمیق است، عربی زیبا است",
  "تمرکز من، کسب‌وکار من، موفقیت من",
  "کنکور فرصتی برای نشان دادن توانایی‌ام است",
  "هر سؤال حل نشده، تجربه‌ای برای فردا است",
  "آرامش، تمرکز، استمرار = موفقیت",
  "بهترین زمان برای مطالعه، الآن است",
  "خود من قادر به انجام هر کاری هستم",
  "کنکور رقابتی است، اما من تیم خودم هستم"
];

const themes = {
  default: {
    name: "کلاسیک",
    headerGrad: "linear-gradient(135deg,#101d30,#223957)",
    blockBg: "#1b2c44",
    accent: "#c99b4a",
    accentLight: "#e5c37d"
  },
  blue: {
    name: "آبی",
    headerGrad: "linear-gradient(135deg,#0f3460,#16213e)",
    blockBg: "#0f3460",
    accent: "#00b4d8",
    accentLight: "#48cae4"
  },
  green: {
    name: "سبز",
    headerGrad: "linear-gradient(135deg,#1a4d2e,#2d6a4f)",
    blockBg: "#1a4d2e",
    accent: "#52b788",
    accentLight: "#74c69d"
  },
  orange: {
    name: "نارنجی",
    headerGrad: "linear-gradient(135deg,#cc5500,#ff7f00)",
    blockBg: "#cc5500",
    accent: "#ff9e1b",
    accentLight: "#ffc857"
  },
  pink: {
    name: "صورتی",
    headerGrad: "linear-gradient(135deg,#c2185b,#e91e63)",
    blockBg: "#c2185b",
    accent: "#f06292",
    accentLight: "#f48fb1"
  },
  purple: {
    name: "بنفش",
    headerGrad: "linear-gradient(135deg,#4a148c,#7b1fa2)",
    blockBg: "#4a148c",
    accent: "#ba68c8",
    accentLight: "#ce93d8"
  }
};

let data = loadData();
let currentTheme = localStorage.getItem(THEME_KEY) || "default";
let zoom = 0.75;

function clone(x){ return JSON.parse(JSON.stringify(x)); }

function loadData(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultData); }
  catch(e){ return clone(defaultData); }
}

function loadPresets(){
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; }
  catch(e){ return []; }
}

function savePresets(presets){
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function presetSnapshot(){
  return clone(data);
}

function formatPresetDate(ts){
  try{
    return new Date(ts).toLocaleString("fa-IR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
  }catch(e){ return ""; }
}

function renderPresets(){
  const box=document.getElementById("presetsList");
  if(!box) return;
  const presets=loadPresets();
  if(!presets.length){
    box.innerHTML=`<div class="preset-empty">هنوز قالبی ذخیره نشده است.<br>از «ذخیره قالب فعلی» برای ساخت اولین پریست استفاده کن.</div>`;
    return;
  }
  const activeName=localStorage.getItem("modern-study-planner-active-preset") || "";
  box.innerHTML=presets.map((p,i)=>`
    <div class="preset-card ${p.name===activeName?'active':''}">
      <div class="preset-card-head">
        <div>
          <div class="preset-name">${esc(p.name)}</div>
          <div class="preset-meta">ذخیره‌شده در ${esc(formatPresetDate(p.updatedAt))}</div>
        </div>
        ${p.name===activeName ? '<span class="eyebrow">ACTIVE</span>' : ''}
      </div>
      <div class="preset-buttons">
        <button class="preset-load" onclick="loadPreset(${i})">استفاده از قالب</button>
        <button class="preset-rename" onclick="renamePreset(${i})">تغییر نام</button>
        <button class="preset-delete" onclick="deletePreset(${i})">حذف</button>
      </div>
    </div>
  `).join("");
}

function createPreset(){
  const input=document.getElementById("presetName");
  const name=(input.value||"").trim();
  if(!name){ toast("نام قالب را وارد کن"); input.focus(); return; }
  const presets=loadPresets();
  const existing=presets.findIndex(p=>p.name===name);
  const item={name,updatedAt:Date.now(),data:presetSnapshot()};
  if(existing>=0){
    if(!confirm("قالبی با این نام وجود دارد. جایگزین شود؟")) return;
    presets[existing]=item;
  }else{
    presets.unshift(item);
  }
  savePresets(presets);
  localStorage.setItem("modern-study-planner-active-preset",name);
  input.value="";
  renderPresets();
  toast(existing>=0 ? "قالب به‌روزرسانی شد" : "قالب ذخیره شد");
}

window.loadPreset=function(i){
  const presets=loadPresets();
  if(!presets || presets.length === 0) return;
  const p=presets[i];
  if(!p || !p.data) return;
  if(!confirm(`قالب «${p.name}» روی فرم فعلی اعمال شود؟`)) return;
  
  data=clone(p.data);
  saveData(false);
  localStorage.setItem("modern-study-planner-active-preset", p.name);
  
  setTimeout(()=>{
    bindGeneral();
    rerenderEditors();
    renderPreview();
    renderPresets();
    toast("قالب اعمال شد");
  }, 100);
};

window.renamePreset=function(i){
  const presets=loadPresets(), p=presets[i];
  if(!p) return;
  const name=prompt("نام جدید قالب:",p.name);
  if(name===null) return;
  const clean=name.trim();
  if(!clean) return;
  if(presets.some((x,j)=>j!==i && x.name===clean)){toast("این نام قبلاً استفاده شده است");return;}
  const old=p.name;
  p.name=clean;p.updatedAt=Date.now();
  savePresets(presets);
  if(localStorage.getItem("modern-study-planner-active-preset")===old)
    localStorage.setItem("modern-study-planner-active-preset",clean);
  renderPresets();
  toast("نام قالب تغییر کرد");
};

window.deletePreset=function(i){
  const presets=loadPresets(), p=presets[i];
  if(!p) return;
  if(!confirm(`قالب «${p.name}» حذف شود؟`)) return;
  presets.splice(i,1);
  savePresets(presets);
  if(localStorage.getItem("modern-study-planner-active-preset")===p.name)
    localStorage.removeItem("modern-study-planner-active-preset");
  renderPresets();
  toast("قالب حذف شد");
};

function exportAllPresets(){
  const presets=loadPresets();
  if(!presets.length){toast("قالبی برای خروجی وجود ندارد");return;}
  const blob=new Blob([JSON.stringify(presets,null,2)],{type:"application/json;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="program-planner-presets.json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function importPresets(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const incoming=JSON.parse(reader.result);
      if(!Array.isArray(incoming)) throw new Error();
      const current=loadPresets();
      let added=0, updated=0;
      incoming.forEach(p=>{
        if(!p || !p.name || !p.data) return;
        const idx=current.findIndex(x=>x.name===p.name);
        const clean={name:String(p.name),updatedAt:p.updatedAt||Date.now(),data:p.data};
        if(idx>=0){current[idx]=clean;updated++}else{current.unshift(clean);added++}
      });
      savePresets(current);
      renderPresets();
      toast(`${added} قالب اضافه و ${updated} قالب به‌روزرسانی شد`);
    }catch(e){toast("فایل قالب معتبر نیست")}
  };
  reader.readAsText(file,"utf-8");
}

function clearAllPresets(){
  const presets=loadPresets();
  if(!presets.length){toast("قالبی وجود ندارد");return;}
  if(!confirm("همه قالب‌های ذخیره‌شده حذف شوند؟")) return;
  localStorage.removeItem(PRESETS_KEY);
  localStorage.removeItem("modern-study-planner-active-preset");
  renderPresets();
  toast("همه قالب‌ها حذف شدند");
}

function saveData(show=true){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const active=localStorage.getItem("modern-study-planner-active-preset");
  if(active){
    const presets=loadPresets();
    const idx=presets.findIndex(p=>p.name===active);
    if(idx>=0){
      presets[idx].data=clone(data);
      presets[idx].updatedAt=Date.now();
      savePresets(presets);
    }
  }
  if(show) toast("اطلاعات ذخیره شد");
}

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function toast(msg){
  const el=document.getElementById("toast"); 
  if(!el) return;
  el.textContent=msg; 
  el.classList.add("show");
  clearTimeout(window.__toast); 
  window.__toast=setTimeout(()=>el.classList.remove("show"),1800);
}

function bindGeneral(){
  document.querySelectorAll("[data-bind]").forEach(el=>{
    const key=el.dataset.bind;
    if(key in data) el.value=data[key] ?? "";
    el.addEventListener("input",()=>{
      data[key]=el.value; renderPreview(); saveData(false);
    });
  });
}

function renderFixedEditor(){
  const box=document.getElementById("fixedRoutines");
  if(!box) return;
  box.innerHTML=data.fixedRoutines.map((r,i)=>`
    <div class="item-card">
      <div class="item-head"><span class="item-label">روتین ${i+1}</span><button class="danger" onclick="removeFixed(${i})">حذف</button></div>
      <input value="${esc(r.title)}" placeholder="عنوان روتین" oninput="data.fixedRoutines[${i}].title=this.value;renderPreview();saveData(false)">
      <textarea rows="2" placeholder="توضیحات روتین" oninput="data.fixedRoutines[${i}].text=this.value;renderPreview();saveData(false)">${esc(r.text)}</textarea>
    </div>`).join("");
}

function renderTipsEditor(){
  const box=document.getElementById("tipsEditor");
  if(!box) return;
  box.innerHTML=data.tips.map((t,i)=>`
    <div class="item-card">
      <div class="item-head"><span class="item-label">نکته ${i+1}</span><button class="danger" onclick="removeTip(${i})">حذف</button></div>
      <textarea rows="3" oninput="data.tips[${i}]=this.value;renderPreview();saveData(false)">${esc(t)}</textarea>
    </div>`).join("");
}

function renderDaysEditor(){
  const box=document.getElementById("daysEditor");
  if(!box) return;
  box.innerHTML=data.days.map((d,i)=>`
    <div class="day-editor">
      <div class="day-head">
        <input value="${esc(d.date)}" placeholder="تاریخ" oninput="data.days[${i}].date=this.value;renderPreview();saveData(false)">
        <input value="${esc(d.day)}" placeholder="روز هفته" oninput="data.days[${i}].day=this.value;renderPreview();saveData(false)">
        <button class="danger" onclick="removeDay(${i})">حذف روز</button>
      </div>
      <div class="day-body">
        ${d.parts.map((p,j)=>`
          <div class="part-row">
            <div class="part-tag">پارت ${j+1}</div>
            <textarea rows="3" oninput="data.days[${i}].parts[${j}]=this.value;renderPreview();saveData(false)">${esc(p)}</textarea>
            <button class="danger" onclick="removePart(${i},${j})">×</button>
          </div>`).join("")}
        <button class="mini-btn" onclick="addPart(${i})">＋ افزودن پارت</button>
        <div class="section-title">روتین‌های همین روز</div>
        ${(d.routines||[]).map((r,j)=>`
          <div class="part-row">
            <div class="part-tag">روتین</div>
            <textarea rows="2" oninput="data.days[${i}].routines[${j}]=this.value;renderPreview();saveData(false)">${esc(r)}</textarea>
            <button class="danger" onclick="removeDayRoutine(${i},${j})">×</button>
          </div>`).join("")}
        <button class="mini-btn" onclick="addDayRoutine(${i})">＋ افزودن روتین روز</button>
      </div>
    </div>`).join("");
}

function renderPreview(){
  const set=(id,val)=>{
    const el=document.getElementById(id);
    if(el) el.textContent=val||"";
  };
  set("outTitle",data.title); 
  set("outSubtitle",data.subtitle); 
  set("outStudentName",data.studentName);
  set("outPlanner",data.planner);
  set("outPeriod",data.period); 
  set("outQuote",data.quote);
  
  const outFixedRoutines=document.getElementById("outFixedRoutines");
  if(outFixedRoutines){
    outFixedRoutines.innerHTML=data.fixedRoutines.map(r=>`
      <div class="routine-card"><b>${esc(r.title)}</b><p>${esc(r.text)}</p></div>`).join("");
  }
  
  const outDays=document.getElementById("outDays");
  if(outDays){
    outDays.innerHTML=data.days.map(d=>`
      <div class="day-card">
        <div class="day-card-head"><strong>${esc(d.day)}</strong><span>${esc(d.date)}</span></div>
        <div class="parts">
          ${d.parts.map((p,i)=>`<div class="part"><div class="part-num">پارت ${i+1}</div><div class="part-text">${esc(p)}</div></div>`).join("")}
        </div>
        ${d.routines?.length ? `<div class="day-routines"><b>روتین‌ها:</b> ${d.routines.map(esc).join("  •  ")}</div>`:""}
      </div>`).join("");
  }
  
  const outTips=document.getElementById("outTips");
  if(outTips){
    outTips.innerHTML=data.tips.map((t,i)=>`
      <div class="tip"><span class="tip-num">${i+1}</span><span>${esc(t)}</span></div>`).join("");
  }
  
  const outNotes=document.getElementById("outNotes");
  if(outNotes) outNotes.textContent=data.notes||"";
}

function rerenderEditors(){ 
  renderFixedEditor(); 
  renderDaysEditor(); 
  renderTipsEditor(); 
  renderPreview(); 
}

window.removeFixed=function(i){data.fixedRoutines.splice(i,1);rerenderEditors();saveData(false)}
window.addDay=function(){data.days.push({date:"",day:"",parts:[""],routines:[]});rerenderEditors();saveData(false)}
window.removeDay=function(i){data.days.splice(i,1);rerenderEditors();saveData(false)}
window.addPart=function(i){data.days[i].parts.push("");rerenderEditors();saveData(false)}
window.removePart=function(i,j){data.days[i].parts.splice(j,1);if(!data.days[i].parts.length)data.days[i].parts.push("");rerenderEditors();saveData(false)}
window.addDayRoutine=function(i){data.days[i].routines.push("");rerenderEditors();saveData(false)}
window.removeDayRoutine=function(i,j){data.days[i].routines.splice(j,1);rerenderEditors();saveData(false)}
window.removeTip=function(i){data.tips.splice(i,1);rerenderEditors();saveData(false)}

// Theme Functions
function setTheme(themeName){
  currentTheme=themeName;
  localStorage.setItem(THEME_KEY,themeName);
  applyThemeStyles();
  renderThemeButtons();
  renderPreview();
  toast(`تم ${themes[themeName].name} اعمال شد`);
}

function applyThemeStyles(){
  const theme=themes[currentTheme];
  const root=document.documentElement;
  root.style.setProperty('--theme-header-grad',theme.headerGrad);
  root.style.setProperty('--theme-block-bg',theme.blockBg);
  root.style.setProperty('--theme-accent',theme.accent);
  root.style.setProperty('--theme-accent-light',theme.accentLight);
}

function renderThemeButtons(){
  const container=document.getElementById("themeButtons");
  if(!container) return;
  container.innerHTML=Object.entries(themes).map(([key,theme])=>`
    <button class="theme-btn ${currentTheme===key?'active':''}" onclick="setTheme('${key}')" title="${theme.name}">
      <span style="background:${theme.accent}"></span>
      ${theme.name}
    </button>
  `).join("");
}

function handleBackgroundUpload(e){
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    localStorage.setItem(BG_IMAGE_KEY,reader.result);
    applyBackgroundImage();
    renderPreview();
    toast("پس‌زمینه به‌روزرسانی شد");
  };
  reader.readAsDataURL(file);
}

function applyBackgroundImage(){
  const bgImage=localStorage.getItem(BG_IMAGE_KEY);
  const paper=document.getElementById("paper");
  if(bgImage && paper){
    paper.style.backgroundImage=`url('${bgImage}')`;
    paper.style.backgroundSize="cover";
    paper.style.backgroundAttachment="fixed";
  }
}

function clearBackgroundImage(){
  if(!confirm("پس‌زمینه پاک شود؟")) return;
  localStorage.removeItem(BG_IMAGE_KEY);
  const paper=document.getElementById("paper");
  if(paper){
    paper.style.backgroundImage="none";
  }
  renderPreview();
  toast("پس‌زمینه حذف شد");
}

// Motivational Quote Selector
function renderQuoteSelector(){
  const container=document.getElementById("quoteSelector");
  if(!container) return;
  container.innerHTML=`
    <div class="quote-list">
      ${motivationalQuotes.map((q,i)=>`
        <button class="quote-option" onclick="selectQuote(${i})" title="${q}">
          ${q.substring(0,50)}...
        </button>
      `).join("")}
    </div>
  `;
}

function selectQuote(index){
  data.quote=motivationalQuotes[index];
  const quoteInput=document.querySelector("[data-bind='quote']");
  if(quoteInput) quoteInput.value=data.quote;
  renderPreview();
  saveData(false);
  toast("جمله انگیزشی انتخاب شد");
}

// PDF & Image Export with proper styling
async function exportToPDF(){
  saveData(false);
  toast("در حال تهیه PDF...");
  
  const paper=document.getElementById("paper");
  if(!paper) return;
  
  const theme=themes[currentTheme];
  const bgImage=localStorage.getItem(BG_IMAGE_KEY);
  
  // Clone the paper element
  const clone=paper.cloneNode(true);
  clone.style.width="794px";
  clone.style.minHeight="1123px";
  clone.style.transform="scale(1)";
  clone.style.boxShadow="none";
  
  // Apply background
  clone.style.background="#fff";
  if(bgImage){
    clone.style.backgroundImage=`url('${bgImage}')`;
    clone.style.backgroundSize="cover";
    clone.style.backgroundAttachment="scroll";
  }
  
  // Apply theme colors
  applyThemeToElement(clone, theme);
  
  // Create temporary container
  const tempContainer=document.createElement("div");
  tempContainer.style.position="absolute";
  tempContainer.style.left="-9999px";
  tempContainer.style.top="-9999px";
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);
  
  // Wait for rendering
  await new Promise(r=>setTimeout(r, 500));
  
  // Use html2canvas for PDF
  const script=document.createElement("script");
  script.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.head.appendChild(script);
  
  script.onload=async()=>{
    const canvas=await html2canvas(clone, {
      scale:2,
      backgroundColor:"#fff",
      logging:false,
      useCORS:true,
      allowTaint:true
    });
    
    // Load jsPDF
    const script2=document.createElement("script");
    script2.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script2);
    
    script2.onload=()=>{
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({
        orientation:"portrait",
        unit:"mm",
        format:"a4"
      });
      
      const imgData=canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`برنامه_${data.title||"مطالعه"}.pdf`);
      
      document.body.removeChild(tempContainer);
      toast("PDF با موفقیت دانلود شد");
    };
  };
}

async function exportToImage(){
  saveData(false);
  toast("در حال تهیه عکس...");
  
  const paper=document.getElementById("paper");
  if(!paper) return;
  
  const theme=themes[currentTheme];
  const bgImage=localStorage.getItem(BG_IMAGE_KEY);
  
  // Clone the paper element
  const clone=paper.cloneNode(true);
  clone.style.width="794px";
  clone.style.minHeight="1123px";
  clone.style.transform="scale(1)";
  clone.style.boxShadow="none";
  clone.style.borderRadius="0";
  
  // Apply background
  clone.style.background="#fff";
  if(bgImage){
    clone.style.backgroundImage=`url('${bgImage}')`;
    clone.style.backgroundSize="cover";
    clone.style.backgroundAttachment="scroll";
  }
  
  // Apply theme colors
  applyThemeToElement(clone, theme);
  
  // Create temporary container
  const tempContainer=document.createElement("div");
  tempContainer.style.position="absolute";
  tempContainer.style.left="-9999px";
  tempContainer.style.top="-9999px";
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);
  
  // Wait for rendering
  await new Promise(r=>setTimeout(r, 500));
  
  // Load html2canvas
  const script=document.createElement("script");
  script.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.head.appendChild(script);
  
  script.onload=async()=>{
    const canvas=await html2canvas(clone, {
      scale:2,
      backgroundColor:"#fff",
      logging:false,
      useCORS:true,
      allowTaint:true
    });
    
    // Download as image
    const link=document.createElement("a");
    link.href=canvas.toDataURL("image/png");
    link.download=`برنامه_${data.title||"مطالعه"}.png`;
    link.click();
    
    document.body.removeChild(tempContainer);
    toast("عکس با موفقیت دانلود شد");
  };
}

function applyThemeToElement(element, theme){
  // Apply theme colors to all elements
  const styleSheet=document.createElement("style");
  styleSheet.textContent=`
    .paper-header { background: ${theme.headerGrad} !important; }
    .block-heading { border-bottom-color: ${theme.blockBg} !important; }
    .block-number { background: ${theme.blockBg} !important; }
    .block-heading small { color: ${theme.accent} !important; }
    .routine-card { border-right-color: ${theme.accent} !important; }
    .day-card-head { background: ${theme.blockBg} !important; }
    .student-info { border-left-color: ${theme.accent} !important; }
    .student-info b { color: ${theme.accent} !important; }
    .quote-icon { color: ${theme.accent} !important; }
    .kicker { color: ${theme.accentLight} !important; }
    .planner-badge { border-right-color: ${theme.accentLight} !important; }
    .day-routines b { color: ${theme.accent} !important; }
    .tip-num { background: rgba(0,0,0,0.1); color: ${theme.accent} !important; }
    .notes-title { color: ${theme.accent} !important; }
  `;
  element.appendChild(styleSheet);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function(){
  const addFixedRoutineBtn=document.getElementById("addFixedRoutine");
  if(addFixedRoutineBtn) addFixedRoutineBtn.onclick=()=>{data.fixedRoutines.push({title:"روتین جدید",text:""});rerenderEditors()}
  
  const addDayBtn=document.getElementById("addDay");
  if(addDayBtn) addDayBtn.onclick=window.addDay;
  
  const addTipBtn=document.getElementById("addTip");
  if(addTipBtn) addTipBtn.onclick=()=>{data.tips.push("");rerenderEditors()}
  
  const saveBtn=document.getElementById("saveBtn");
  if(saveBtn) saveBtn.onclick=()=>saveData(true);
  
  const resetBtn=document.getElementById("resetBtn");
  if(resetBtn) resetBtn.onclick=()=>{
    if(confirm("همه اطلاعات به قالب اولیه برگردد؟")){data=clone(defaultData);saveData(false);bindGeneral();rerenderEditors();toast("قالب اولیه بازگردانی شد")}
  };
  
  const printBtn=document.getElementById("printBtn");
  if(printBtn) printBtn.onclick=exportToPDF;
  
  const imageBtn=document.getElementById("imageBtn");
  if(imageBtn) imageBtn.onclick=exportToImage;
  
  const mobilePreviewBtn=document.getElementById("mobilePreviewBtn");
  if(mobilePreviewBtn) mobilePreviewBtn.onclick=()=>{
    const panel=document.querySelector(".preview-panel");
    if(panel){
      panel.style.display="block";
      panel.scrollIntoView({behavior:"smooth"});
    }
  };

  document.querySelectorAll(".tab").forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll(".tab,.tab-content").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      const tabId="tab-"+btn.dataset.tab;
      const tabContent=document.getElementById(tabId);
      if(tabContent) tabContent.classList.add("active");
    };
  });

  const zoomInBtn=document.getElementById("zoomIn");
  if(zoomInBtn) zoomInBtn.onclick=()=>{zoom=Math.min(1,zoom+.05);applyZoom()}
  
  const zoomOutBtn=document.getElementById("zoomOut");
  if(zoomOutBtn) zoomOutBtn.onclick=()=>{zoom=Math.max(.5,zoom-.05);applyZoom()}

  const savePresetBtn=document.getElementById("savePresetBtn");
  if(savePresetBtn) savePresetBtn.onclick=createPreset;
  
  const exportAllPresetsBtn=document.getElementById("exportAllPresetsBtn");
  if(exportAllPresetsBtn) exportAllPresetsBtn.onclick=exportAllPresets;
  
  const clearPresetsBtn=document.getElementById("clearPresetsBtn");
  if(clearPresetsBtn) clearPresetsBtn.onclick=clearAllPresets;
  
  const importPresetBtn=document.getElementById("importPresetBtn");
  if(importPresetBtn) importPresetBtn.onclick=()=>document.getElementById("presetFile").click();
  
  const presetFile=document.getElementById("presetFile");
  if(presetFile) presetFile.addEventListener("change",e=>{
    importPresets(e.target.files[0]);
    e.target.value="";
  });

  const bgUploadBtn=document.getElementById("bgImageUpload");
  if(bgUploadBtn) bgUploadBtn.addEventListener("change",handleBackgroundUpload);

  const clearBgBtn=document.getElementById("clearBgBtn");
  if(clearBgBtn) clearBgBtn.onclick=clearBackgroundImage;

  bindGeneral();
  rerenderEditors();
  renderPresets();
  renderThemeButtons();
  renderQuoteSelector();
  applyZoom();
  applyThemeStyles();
  applyBackgroundImage();
});

function applyZoom(){
  const paper=document.getElementById("paper");
  if(!paper) return;
  paper.style.transform=`scale(${zoom})`;
  const zoomValue=document.getElementById("zoomValue");
  if(zoomValue) zoomValue.textContent=Math.round(zoom*100)+"%";
}