const $=s=>document.querySelector(s),KEY="esevaiPro.v2",PK="esevaiPro.prices",EK="esevaiPro.expenses",PIN="esevaiPro.adminPin",XP="Xerox & Print",GV="Government";
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,8),dstr=t=>new Date(t).toLocaleDateString("en-CA"),today=()=>dstr(Date.now()),ic=()=>window.lucide&&lucide.createIcons();
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const sum=(a,f)=>a.reduce((n,x)=>n+f(x),0),due=b=>b.total-b.paid,hash=s=>btoa(unescape(encodeURIComponent("es:"+s)));
let db,prices,exps,range="week",pq="",cd=null,cm=new Date().getMonth(),cy=new Date().getFullYear(),cyy=cy;
function reload(){db=load(KEY,{bills:[],apps:[],services:[]});prices=load(PK,null);if(!prices){prices=db.services||[];if(prices.length)savP()}exps=load(EK,[]);if(!Array.isArray(db.tpl)||!db.tpl.length)db.tpl=TPL()}
const savP=()=>localStorage.setItem(PK,JSON.stringify(prices)),savE=()=>localStorage.setItem(EK,JSON.stringify(exps));
const TPL=()=>[
 {name:"Income Certificate",docs:["Aadhaar card","Ration / Smart card","Passport photo","Income self-declaration","Mobile no. linked to Aadhaar"],gov:0,fee:100,days:15,renew:12},
 {name:"Community Certificate",docs:["Aadhaar card","Ration / Smart card","Father's community certificate","School TC / marksheet","Passport photo"],gov:0,fee:100,days:15,renew:0},
 {name:"Nativity Certificate",docs:["Aadhaar card","Ration / Smart card","School TC / 10th marksheet","Passport photo"],gov:0,fee:100,days:15,renew:0},
 {name:"Legal Heir Certificate",docs:["Death certificate","Aadhaar of all heirs","Ration / Smart card","Applicant photo","Relationship proof"],gov:0,fee:150,days:30,renew:0},
 {name:"Aadhaar Update",docs:["Aadhaar card","Proof of change (address / DOB / name)","Mobile number"],gov:50,fee:30,days:7,renew:0},
 {name:"PAN Card",docs:["Aadhaar card","Passport photo","Signature","Mobile number"],gov:0,fee:150,days:15,renew:0},
 {name:"Voter ID",docs:["Aadhaar card","Passport photo","Age proof","Address proof"],gov:0,fee:100,days:30,renew:0},
 {name:"Ration Card",docs:["Aadhaar of all members","Address proof","Passport photo","Gas connection proof"],gov:0,fee:100,days:30,renew:0},
 {name:"Patta / Chitta",docs:["Survey no. / old patta copy","Aadhaar card","Land document copy"],gov:0,fee:100,days:7,renew:0}];
const RN=[["No reminder",0],["After 6 months",6],["After 1 year",12],["After 2 years",24],["After 3 years",36],["After 5 years",60]];
const savT=()=>{const cur=load(KEY,{});cur.tpl=db.tpl;localStorage.setItem(KEY,JSON.stringify(cur))};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2500)};
const emp=(i,t,s)=>`<div class="empty"><i data-lucide="${i}"></i><b>${t}</b>${s}</div>`;
const tbl=(h,rows,e)=>rows.length?`<div class="tw"><table><thead><tr>${h.map(x=>`<th class="${x[0]==="#"?"n":""}">${x.replace("#","")}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`:e;
const closeM=()=>$("#modal").classList.remove("open");
function form(title,sub,fields,ok,fn){
  $("#mform").innerHTML=`<h2>${title}</h2><p class="sub">${sub}</p><div class="fg">${fields.map(f=>`<label class="${f.full?"full":""}">${f.l}${f.t==="area"?`<textarea name="${f.k}" rows="${f.r||4}">${esc(f.v??"")}</textarea>`:f.t==="select"?`<select name="${f.k}">${f.o.map(o=>`<option ${o===f.v?"selected":""}>${esc(o)}</option>`).join("")}</select>`:`<input name="${f.k}" type="${f.t||"text"}" value="${esc(f.v??"")}" ${f.req?"required":""} ${f.t==="number"?'min="0" step="any"':""}>`}</label>`).join("")}</div><div class="ma"><button type="button" class="btn" id="mc">Cancel</button><button class="btn pri">${ok}</button></div>`;
  $("#modal").classList.add("open");$("#mc").onclick=closeM;$("#mform").onsubmit=e=>{e.preventDefault();fn(Object.fromEntries(new FormData(e.target)));closeM()};
}
const inR=d=>range==="today"?d===today():range==="week"?d>=dstr(Date.now()-6*864e5):range==="month"?d.startsWith(today().slice(0,7)):true;
const RL={today:"Today",week:"Last 7 days",month:"This month",all:"All time"};
function dl(n,c,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click()}

const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
function overview(){
  const bl=db.bills.filter(b=>inR(b.date)),ex=exps.filter(e=>inR(e.date));
  const coll=sum(db.bills,b=>sum(b.pays||[],p=>inR(p.d)?p.a:0)),rev=sum(bl,b=>sum(b.items.filter(i=>i.cat!=="Fee"),i=>i.qty*i.price)-(b.discount||0)),cost=sum(ex,e=>e.amt);
  const n=range==="month"?new Date().getDate():range==="all"?30:7,days=[...Array(n)].map((_,i)=>{const d=dstr(Date.now()-(n-1-i)*864e5);return{d,v:sum(db.bills,b=>sum(b.pays||[],p=>p.d===d?p.a:0))}}),mx=Math.max(...days.map(x=>x.v),1);
  const agg={};bl.forEach(b=>b.items.forEach(i=>{if(i.cat==="Fee")return;const a=agg[i.name]||(agg[i.name]={q:0,r:0});a.q+=i.qty;a.r+=i.qty*i.price}));
  const top=Object.entries(agg).sort((a,b)=>b[1].r-a[1].r).slice(0,6),tm=top[0]?top[0][1].r:1;
  const st={};bl.forEach(b=>{const k=b.by||"Staff",s=st[k]||(st[k]={n:0,t:0,p:0});s.n++;s.t+=b.total;s.p+=b.paid});
  const dues=db.bills.filter(b=>due(b)>0);
  const T=today(),cc=f=>sum(db.bills,b=>sum(b.pays||[],p=>f(p.d)?p.a:0)),Y=new Date().getFullYear(),dd=cd||T;
  const minY=Math.min(Y,...db.bills.flatMap(b=>(b.pays||[]).map(p=>+p.d.slice(0,4))).filter(Boolean)),yrs=[];for(let y=Y;y>=minY;y--)yrs.push(y);
  const MN=[...Array(12)].map((_,i)=>new Date(2000,i,1).toLocaleDateString("en-IN",{month:"long"})),pm=String(cm+1).padStart(2,"0");
  const ysel=(id,v)=>`<select id="${id}">${yrs.map(y=>`<option ${y===v?"selected":""}>${y}</option>`).join("")}</select>`;
  const cols=[["calendar-days","Daily collection",cc(d=>d===dd),`<input type="date" id="cd" value="${dd}" max="${T}">`],["calendar-range","Monthly collection",cc(d=>d.startsWith(cy+"-"+pm)),`<select id="cm">${MN.map((m,i)=>`<option value="${i}" ${i===cm?"selected":""}>${m}</option>`).join("")}</select>${ysel("cy",cy)}`],["calendar-check","Yearly collection",cc(d=>d.startsWith(String(cyy))),ysel("cyy",cyy)]];
  $("#view").innerHTML=`<div class="ph hero"><div><h2 class="greet">${greet()}, Abdulla</h2><p>Here is how your shop is doing · ${RL[range].toLowerCase()}.</p></div><select id="rg" style="width:auto">${Object.entries(RL).map(([k,v])=>`<option value="${k}" ${k===range?"selected":""}>${v}</option>`).join("")}</select></div>
  <div class="stats"><div class="stat"><p>Money collected</p><h3>${money(coll)}</h3><small>${bl.length} bills in period</small></div><div class="stat"><p>Shop service revenue</p><h3>${money(rev)}</h3><small>Excludes official fees</small></div><div class="stat"><p>Expenses</p><h3>${money(cost)}</h3><small>${ex.length} entries</small></div><div class="stat"><p>Estimated profit</p><h3>${money(rev-cost)}</h3><small>Revenue − expenses</small></div></div>
  <div class="cols">${cols.map(c=>`<div class="col"><span class="ci"><i data-lucide="${c[0]}"></i></span><div><small>${c[1]}</small><h3>${money(c[2])}</h3><div class="cf">${c[3]}</div></div></div>`).join("")}</div>
  <div class="grid2"><div class="panel"><div class="ph"><div><h2>Daily collections</h2></div></div><div class="bars">${days.map((x,i)=>`<div class="bar ${i===n-1?"today":""}"><b>${n<=7&&x.v?money(x.v):""}</b><i style="height:${x.v/mx*78}%" title="${x.d}: ${money(x.v)}"></i>${n<=7?new Date(x.d+"T00:00").toLocaleDateString("en-IN",{weekday:"short"}):""}</div>`).join("")}</div></div>
  <div class="panel"><div class="ph"><div><h2>Top services</h2><p>By revenue</p></div></div>${top.length?top.map(([k,a])=>`<div class="row"><div style="flex:1"><div style="display:flex;justify-content:space-between"><span>${esc(k)} <small>×${a.q}</small></span><b>${money(a.r)}</b></div><div class="tr"><i style="width:${a.r/tm*100}%"></i></div></div></div>`).join(""):emp("bar-chart-3","No sales","Nothing billed in this period.")}</div></div>
  <div class="grid2"><div class="panel"><div class="ph"><div><h2>Staff activity</h2></div></div>${tbl(["Staff","#Bills","#Billed","#Received"],Object.entries(st).map(([k,s])=>`<tr><td><b>${esc(k)}</b></td><td class="n">${s.n}</td><td class="n">${money(s.t)}</td><td class="n">${money(s.p)}</td></tr>`),emp("users","No activity","Bills show the staff who made them."))}</div>
  <div class="panel"><div class="ph"><div><h2>Unpaid balances</h2><p>${money(sum(dues,due))} across ${dues.length} bills</p></div></div>${tbl(["Customer","Bill","#Due"],dues.slice(0,6).map(b=>`<tr><td>${esc(b.customer||"Walk-in")}</td><td>${b.id}</td><td class="n"><span class="tag t-due">${money(due(b))}</span></td></tr>`),emp("check-circle-2","No dues","Everything is paid."))}</div></div>`;
  $("#rg").onchange=e=>{range=e.target.value;overview();ic()};
  $("#cd").onchange=e=>{cd=e.target.value||null;overview();ic()};
  $("#cm").onchange=e=>{cm=+e.target.value;overview();ic()};$("#cy").onchange=e=>{cy=+e.target.value;overview();ic()};
  $("#cyy").onchange=e=>{cyy=+e.target.value;overview();ic()};
}
function bills(){
  $("#view").innerHTML=`<div class="panel"><div class="ph"><div><h2>All bills</h2></div><input id="bs" placeholder="Search bill / name / staff" style="width:230px"></div><div id="bl"></div></div>`;
  const d=()=>{const q=$("#bs").value.toLowerCase();$("#bl").innerHTML=tbl(["Bill","Date","Customer","Staff","Items","#Total","#Paid","#Due"],db.bills.filter(b=>(b.id+b.customer+b.phone+(b.by||"")).toLowerCase().includes(q)).slice(0,200).map(b=>`<tr><td><b>${b.id}</b></td><td>${b.date}</td><td>${esc(b.customer||"Walk-in")}</td><td>${esc(b.by||"–")}</td><td>${esc(b.items.map(i=>i.name+" ×"+i.qty).join(", ").slice(0,40))}</td><td class="n">${money(b.total)}</td><td class="n">${money(b.paid)}</td><td class="n">${due(b)>0?`<span class="tag t-due">${money(due(b))}</span>`:"–"}</td></tr>`),emp("receipt","No bills yet","Bills from the store app appear here (same browser/domain)."))};
  d();$("#bs").oninput=d;
}
function exportCsv(){const r=[["Bill","Date","Customer","Phone","Staff","Items","Total","Paid","Due"],...db.bills.map(b=>[b.id,b.date,b.customer,b.phone,b.by||"",b.items.map(i=>i.name+" x"+i.qty).join("; "),b.total,b.paid,due(b)])];dl("e-sevai-bills.csv","\ufeff"+r.map(x=>x.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n"),"text/csv")}
function svcForm(s){form(s?"Edit service":"Add service","Staff will see this price on Quick bill.",[{k:"name",l:"Service name *",req:1,v:s&&s.name,full:1},{k:"cat",l:"Category",t:"select",o:[XP,GV],v:s&&s.cat},{k:"price",l:"Price (₹) *",t:"number",req:1,v:s&&s.price}],"Save",d=>{d.price=+d.price;s?Object.assign(s,d):prices.push({id:uid(),...d});savP();go();toast("Price list updated")})}
function pricesPg(){
  $("#view").innerHTML=`<div class="panel"><div class="ph"><div><h2>Price list</h2><p>Changes reach the store app immediately.</p></div></div><div id="sl"></div></div>`;
  $("#sl").innerHTML=tbl(["Service","Category","#Price",""],prices.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.cat)}</td><td class="n">${money(s.price)}</td><td class="n"><button class="btn sm" data-e="${s.id}">Edit</button> <button class="btn sm dng" data-x="${s.id}">Delete</button></td></tr>`),emp("tags","No services yet","Add your xerox, print and certificate prices."));
  $("#sl").onclick=e=>{const a=e.target.closest("[data-e]"),x=e.target.closest("[data-x]");if(a)svcForm(prices.find(s=>s.id===a.dataset.e));if(x&&confirm("Delete this service?")){prices=prices.filter(s=>s.id!==x.dataset.x);savP();pricesPg();ic()}};
}
function tplForm(i){
  const t=i==null?{name:"",docs:[],gov:0,fee:0,days:7,renew:0}:db.tpl[i];
  form(i==null?"Add service documents":"Edit documents",t.name||"Store staff will see this checklist when creating an application.",[
    {k:"name",l:"Service name *",req:1,v:t.name,full:1},
    {k:"docs",l:"Required documents (one per line)",t:"area",r:6,v:t.docs.join("\n"),full:1},
    {k:"gov",l:"Official fee (₹)",t:"number",v:t.gov},
    {k:"fee",l:"Service charge (₹)",t:"number",v:t.fee},
    {k:"days",l:"Usual processing days",t:"number",v:t.days},
    {k:"renew",l:"Renewal reminder",t:"select",o:RN.map(r=>r[0]),v:(RN.find(r=>r[1]===t.renew)||RN[0])[0]}
  ],"Save",d=>{
    const n={name:d.name.trim(),docs:d.docs.split("\n").map(x=>x.trim()).filter(Boolean),gov:+d.gov||0,fee:+d.fee||0,days:+d.days||0,renew:RN.find(r=>r[0]===d.renew)[1]};
    i==null?db.tpl.push(n):db.tpl[i]=n;savT();go();toast("Documents updated")});
}
function docsPg(){
  $("#view").innerHTML=`<div class="panel"><div class="ph"><div><h2>Required documents</h2><p>Checklist, fees and processing time for each service. New applications in the store app use this list. Existing applications keep their own checklist.</p></div></div><div id="dl2"></div></div>`;
  $("#dl2").innerHTML=tbl(["Service","Documents","#Official","#Charge","#Days",""],db.tpl.map((t,i)=>`<tr><td><b>${esc(t.name)}</b></td><td style="white-space:normal;min-width:260px"><small style="color:var(--mut)">${t.docs.length?t.docs.map(esc).join(" · "):"–"}</small></td><td class="n">${money(t.gov)}</td><td class="n">${money(t.fee)}</td><td class="n">${t.days}</td><td class="n"><button class="btn sm" data-e="${i}">Edit</button> <button class="btn sm dng" data-x="${i}">Delete</button></td></tr>`),emp("files","No services yet","Add a service and its required documents."));
  $("#dl2").onclick=e=>{const a=e.target.closest("[data-e]"),x=e.target.closest("[data-x]");if(a)tplForm(+a.dataset.e);if(x&&confirm("Delete this service and its document list?")){db.tpl.splice(+x.dataset.x,1);savT();docsPg();ic()}};
}
function addExp(){form("Add expense","Paper, toner, rent and more.",[{k:"date",l:"Date",t:"date",v:today()},{k:"cat",l:"Category",t:"select",o:["Paper & toner","Rent","Electricity","Internet","Salary","Other"]},{k:"note",l:"Note",full:1},{k:"amt",l:"Amount (₹) *",t:"number",req:1}],"Save expense",d=>{exps.unshift({id:uid(),date:d.date||today(),cat:d.cat,note:d.note,amt:+d.amt});savE();go()})}
function expPg(){
  $("#view").innerHTML=`<div class="panel" id="el"></div>`;
  $("#el").innerHTML=tbl(["Date","Category","Note","#Amount",""],exps.map(e=>`<tr><td>${e.date}</td><td>${esc(e.cat)}</td><td>${esc(e.note||"–")}</td><td class="n"><b>${money(e.amt)}</b></td><td class="n"><button class="btn sm dng" data-x="${e.id}">Delete</button></td></tr>`),emp("wallet","No expenses","Add costs to see your real profit."));
  $("#el").onclick=e=>{const x=e.target.closest("[data-x]");if(x&&confirm("Delete this expense?")){exps=exps.filter(y=>y.id!==x.dataset.x);savE();expPg();ic()}};
}
const P={overview:["Overview",overview,["Export bills CSV",exportCsv,"download"]],bills:["All bills",bills,["Export CSV",exportCsv,"download"]],prices:["Price list",pricesPg,["Add service",()=>svcForm(),"plus"]],docs:["Required documents",docsPg,["Add service documents",()=>tplForm(),"plus"]],expenses:["Expenses",expPg,["Add expense",addExp,"plus"]]};
function go(){
  reload();const k=location.hash.slice(1),p=P[k]?k:"overview",[t,fn,b]=P[p];
  document.querySelectorAll("nav a[data-page]").forEach(a=>a.classList.toggle("on",a.dataset.page===p));
  $("#title").textContent=t;$("#topNew").innerHTML=`<i data-lucide="${b[2]}"></i>${b[0]}`;$("#topNew").onclick=b[1];
  $("#side").classList.remove("open");fn();if(pq&&$("#bs")){$("#bs").value=pq;$("#bs").oninput()}pq="";ic();
}
let gl=[];
function gsearch(){
  const q=$("#gq").value.toLowerCase().trim(),g=$("#gres");gl=[];
  if(!q){g.classList.remove("open");return}
  db.bills.filter(b=>(b.id+b.customer+b.phone+(b.by||"")+b.items.map(i=>i.name).join(" ")).toLowerCase().includes(q)).slice(0,5).forEach(b=>gl.push({i:"receipt",t:b.id+" · "+(b.customer||"Walk-in"),s:b.date+" · "+money(b.total),h:"bills",q:b.id}));
  (db.apps||[]).filter(a=>(a.customer+a.phone+a.service+a.id).toLowerCase().includes(q)).slice(0,3).forEach(a=>gl.push({i:"files",t:a.customer+" – "+a.service,s:"Application · "+a.status,h:"bills",q:a.customer}));
  prices.filter(s=>s.name.toLowerCase().includes(q)).slice(0,4).forEach(s=>gl.push({i:"tags",t:s.name,s:s.cat+" · "+money(s.price),h:"prices"}));
  exps.filter(e=>(e.cat+(e.note||"")).toLowerCase().includes(q)).slice(0,3).forEach(e=>gl.push({i:"wallet",t:e.cat+(e.note?" – "+e.note:""),s:e.date+" · "+money(e.amt),h:"expenses"}));
  g.innerHTML=gl.length?gl.map((r,n)=>`<div class="gr ${n?"":"f"}" data-n="${n}"><i data-lucide="${r.i}"></i><div><b>${esc(r.t)}</b><small>${esc(r.s)}</small></div></div>`).join(""):'<div class="gn">No results found</div>';
  g.classList.add("open");ic();
}
function gopen(n){const r=gl[n];if(!r)return;pq=r.q||"";$("#gq").value="";$("#gres").classList.remove("open");location.hash=r.h;go()}
const AK="esevaiPro.adminAcct",SK="esAdmin",RK="esAdminKeep";
async function hp(p){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("es:"+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch{return hash(p)}}
const authed=()=>sessionStorage.getItem(SK)||localStorage.getItem(RK);
function showLogin(done){
  const acct=load(AK,null),first=!acct,L=$("#login");
  document.querySelector(".shell").style.display="none";L.hidden=false;
  L.innerHTML=`<form class="lcard" id="lf" autocomplete="on"><div class="llogo"><img src="allfa-logo.png" alt="Allfa"></div><div><h2>${first?"Create admin account":"Welcome back"}</h2><p>${first?"Set up your owner login":"Sign in to continue"}</p></div>
  <div class="lf"><div class="lin"><i data-lucide="mail"></i><input id="le" type="email" placeholder="Gmail / Email" autocomplete="username" required></div>
  <div class="lin"><i data-lucide="lock"></i><input id="lp" type="password" placeholder="Password" autocomplete="${first?"new-password":"current-password"}" minlength="6" required><button type="button" class="eye" id="ey" aria-label="Show password"><i data-lucide="eye"></i></button></div>
  ${first?`<div class="lin"><i data-lucide="lock-keyhole"></i><input id="lp2" type="password" placeholder="Confirm password" autocomplete="new-password" required></div>`:""}
  <div class="lrow"><label class="lchk"><input type="checkbox" id="lr">Remember me</label></div></div>
  <p class="lerr" id="lx"></p><button class="lgo">${first?"Create account":"Login"}<i data-lucide="arrow-right"></i></button><div class="lfoot">ALLFA · ADMIN</div></form>`;
  ic();$("#le").focus();
  $("#ey").onclick=()=>{const p=$("#lp"),s=p.type==="password";p.type=s?"text":"password";$("#ey").innerHTML=`<i data-lucide="${s?"eye-off":"eye"}"></i>`;ic()};
  $("#lf").onsubmit=async e=>{
    e.preventDefault();const em=$("#le").value.trim().toLowerCase(),pw=$("#lp").value,x=$("#lx");x.textContent="";
    if(first){if(pw.length<6)return x.textContent="Password needs at least 6 characters.";if(pw!==$("#lp2").value)return x.textContent="Passwords do not match.";
      localStorage.setItem(AK,JSON.stringify({email:em,hash:await hp(pw)}))}
    else if(em!==acct.email||await hp(pw)!==acct.hash)return x.textContent="Wrong email or password. Try again.";
    ($("#lr").checked?localStorage:sessionStorage).setItem($("#lr").checked?RK:SK,1);
    L.hidden=true;L.innerHTML="";document.querySelector(".shell").style.display="";done();
  };
}
function init(){
  $("#today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#menuBtn").onclick=()=>$("#side").classList.toggle("open");$("#modal").onclick=e=>{if(e.target.id==="modal")closeM()};document.onkeydown=e=>{if(e.key==="Escape")closeM()};
  $("#gq").oninput=()=>{reload();gsearch()};$("#gq").onfocus=()=>{if($("#gq").value)gsearch()};
  $("#gq").onkeydown=e=>{if(e.key==="Enter")gopen(0);if(e.key==="Escape"){$("#gq").value="";gsearch()}};
  $("#gres").onclick=e=>{const r=e.target.closest("[data-n]");if(r)gopen(+r.dataset.n)};
  document.addEventListener("click",e=>{if(!e.target.closest(".gs"))$("#gres").classList.remove("open")});
  $("#lk").onclick=()=>{sessionStorage.removeItem(SK);localStorage.removeItem(RK);location.reload()};
  $("#bk").onclick=()=>dl("e-sevai-backup-"+today()+".json",JSON.stringify({[KEY]:load(KEY,{}),[PK]:prices,[EK]:exps}),"application/json");
  $("#rs").onclick=()=>$("#rf").click();
  $("#rf").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!confirm("Replace current data with this backup?"))return;for(const k of[KEY,PK,EK])if(j[k])localStorage.setItem(k,JSON.stringify(j[k]));go();toast("Backup restored")}catch{toast("Invalid backup file")}};
  window.onhashchange=go;window.addEventListener("storage",go);window.addEventListener("focus",()=>{if($("#modal").className.indexOf("open")<0)go()});go();
}
document.addEventListener("DOMContentLoaded",()=>authed()?init():showLogin(init));