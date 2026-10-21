const $=s=>document.querySelector(s),KEY="esevaiPro.v2",PK="esevaiPro.prices",EK="esevaiPro.expenses",PIN="esevaiPro.adminPin",XP="Xerox & Print",GV="Government";
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,8),dstr=t=>new Date(t).toLocaleDateString("en-CA"),today=()=>dstr(Date.now()),ic=()=>window.lucide&&lucide.createIcons();
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const sum=(a,f)=>a.reduce((n,x)=>n+f(x),0),due=b=>b.total-b.paid,hash=s=>btoa(unescape(encodeURIComponent("es:"+s)));
let db,prices,exps,range="week",pq="",cd=null,cm=new Date().getMonth(),cy=new Date().getFullYear(),cyy=cy;
function reload(){db=load(KEY,{bills:[],apps:[],services:[]});prices=load(PK,null);if(!prices){prices=db.services||[]}exps=load(EK,[]);if(!Array.isArray(db.tpl)||!db.tpl.length)db.tpl=TPL()}
const savP=()=>{localStorage.setItem(PK,JSON.stringify(prices));cfgPush()},savE=()=>{localStorage.setItem(EK,JSON.stringify(exps));expPush()};
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
const savT=()=>{const cur=load(KEY,{});cur.tpl=db.tpl;localStorage.setItem(KEY,JSON.stringify(cur));cfgPush()};
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
const P={overview:["Overview",overview,["Export bills CSV",exportCsv,"download"]],bills:["All bills",bills,["Export CSV",exportCsv,"download"]],prices:["Price list",pricesPg,["Add service",()=>svcForm(),"plus"]],docs:["Required documents",docsPg,["Add service documents",()=>tplForm(),"plus"]],expenses:["Expenses",expPg,["Add expense",addExp,"plus"]],staff:["Staff logins",staffPg,["Add staff",()=>staffAdd(),"plus"]]};
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
/* ===== SUPABASE: admin login + cloud data + staff manager ===== */
const SB_URL="https://vtcnzhzdwycqmhepsfxt.supabase.co",SB_KEY="sb_publishable_LIM_hs_jBcn0MC9cdIvBYw_Z-VoN2R9";
const AUK="esevaiAdmin.auth",CT="esevaiAdmin.cfgTs",ET="esevaiAdmin.expTs",DT="esevaiAdmin.dirty";
let auth=null;
function loadAuth(){try{auth=JSON.parse(localStorage.getItem(AUK))}catch{auth=null}}
function setSession(j){auth={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+Math.max(60,(j.expires_in||3600)-60)*1000};localStorage.setItem(AUK,JSON.stringify(auth))}
const sbAuth=(path,body)=>fetch(SB_URL+"/auth/v1/"+path,{method:"POST",headers:{apikey:SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(body)});
const authed=()=>!!auth;
function signOut(){auth=null;localStorage.removeItem(AUK);location.reload()}
async function token(){
  if(!auth)return null;
  if(Date.now()<auth.exp)return auth.access;
  try{
    const r=await sbAuth("token?grant_type=refresh_token",{refresh_token:auth.refresh});
    if(r.status>=400&&r.status<500){signOut();return null}
    if(!r.ok)return null;
    setSession(await r.json());return auth.access
  }catch{return null}
}
async function hdr(){const t=await token();return t?{apikey:SB_KEY,Authorization:"Bearer "+t,"Content-Type":"application/json"}:null}
const dirty=()=>{try{return JSON.parse(localStorage.getItem(DT))||{}}catch{return{}}};
const setDirty=(id,v)=>{const d=dirty();v?d[id]=1:delete d[id];localStorage.setItem(DT,JSON.stringify(d))};
async function upsert(id,data){
  try{
    const h=await hdr();if(!h)throw 0;
    const r=await fetch(SB_URL+"/rest/v1/app_data?on_conflict=id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id,data,updated_at:new Date().toISOString()})});
    if(!r.ok)throw 0;setDirty(id,0)
  }catch{setDirty(id,1)}
}
let cfgT=null,expT=null;
function cfgPush(){const ts=Date.now();localStorage.setItem(CT,ts);setDirty("allfa-config",1);clearTimeout(cfgT);cfgT=setTimeout(()=>{cfgT=null;upsert("allfa-config",{prices,tpl:db.tpl,_ts:ts})},600)}
function expPush(){const ts=Date.now();localStorage.setItem(ET,ts);setDirty("allfa-expenses",1);clearTimeout(expT);expT=setTimeout(()=>{expT=null;upsert("allfa-expenses",{list:exps,_ts:ts})},600)}
let pulling=false;
async function cloudPull(){
  if(pulling||!auth||cfgT||expT)return;pulling=true;
  try{
    const h=await hdr();if(!h)return;
    const r=await fetch(SB_URL+"/rest/v1/app_data?id=in.(allfa-main,allfa-config,allfa-expenses)&select=id,data",{headers:h,cache:"no-store"});
    if(!r.ok)throw 0;
    const rows=Object.fromEntries((await r.json()).map(x=>[x.id,x.data||{}]));
    let changed=false,tpl=null;const dd=dirty();
    /* prices + document templates (admin owns these) */
    const c=rows["allfa-config"],clts=+localStorage.getItem(CT)||0;
    if(!c){if(prices&&prices.length||(db&&db.tpl&&db.tpl.length)){cfgPush()}}
    else if(dd["allfa-config"]||clts>(+c._ts||0)){upsert("allfa-config",{prices:prices||c.prices,tpl:(db&&db.tpl)||c.tpl,_ts:clts||Date.now()})}
    else if((+c._ts||0)>clts){
      if(Array.isArray(c.prices)){localStorage.setItem(PK,JSON.stringify(c.prices))}
      if(Array.isArray(c.tpl)&&c.tpl.length)tpl=c.tpl;
      localStorage.setItem(CT,+c._ts||0);changed=true
    }
    /* expenses (owner only) */
    const e=rows["allfa-expenses"],elts=+localStorage.getItem(ET)||0;
    if(!e){if(exps&&exps.length)expPush()}
    else if(dd["allfa-expenses"]||elts>(+e._ts||0)){upsert("allfa-expenses",{list:exps,_ts:elts||Date.now()})}
    else if((+e._ts||0)>elts){localStorage.setItem(EK,JSON.stringify(e.list||[]));localStorage.setItem(ET,+e._ts||0);changed=true}
    /* bills / applications written by store staff (read-only here) */
    const m=rows["allfa-main"];
    if(m&&Object.keys(m).length){
      const cur=load(KEY,{}),nm={...m};
      nm.tpl=tpl||(cur.tpl&&cur.tpl.length?cur.tpl:m.tpl);
      const a=JSON.stringify(nm);
      if(a!==localStorage.getItem(KEY)){localStorage.setItem(KEY,a);changed=true}
    }else if(tpl){const cur=load(KEY,{});cur.tpl=tpl;localStorage.setItem(KEY,JSON.stringify(cur))}
    if(changed&&$("#modal").className.indexOf("open")<0)go();
    const t=$("#today");if(t)t.title="Cloud synced"
  }catch{const t=$("#today");if(t)t.title="Offline - will sync later"}
  finally{pulling=false}
}

/* staff manager (talks to the staff-admin Edge Function) */
async function staffApi(action,p={}){
  const h=await hdr();if(!h)throw new Error("Not signed in");
  const r=await fetch(SB_URL+"/functions/v1/staff-admin",{method:"POST",headers:h,body:JSON.stringify({action,...p})});
  let j={};try{j=await r.json()}catch{}
  if(!r.ok)throw new Error(j.error||("Server error "+r.status));return j
}
async function staffPg(){
  $("#view").innerHTML=`<div class="panel"><div class="ph"><div><h2>Staff logins</h2><p>Staff sign in to the store app with these email logins. You can add staff, change passwords and remove access here.</p></div></div><div id="sl2"><div class="empty">Loading…</div></div></div>`;
  try{
    const {users}=await staffApi("list");
    $("#sl2").innerHTML=tbl(["Email","Role","Last login",""],users.map(u=>`<tr><td><b>${esc(u.email)}</b></td><td><span class="tag ${u.role==="admin"?"t-proc":"t-done"}">${esc(u.role)}</span></td><td>${u.last?new Date(u.last).toLocaleString("en-IN"):"–"}</td><td class="n"><button class="btn sm" data-p="${u.id}" data-e="${esc(u.email)}">Change password</button>${u.role==="admin"?"":` <button class="btn sm dng" data-x="${u.id}" data-e="${esc(u.email)}">Remove</button>`}</td></tr>`),emp("users","No staff yet","Use Add staff to create a login."));
    $("#sl2").onclick=e=>{
      const p=e.target.closest("[data-p]"),x=e.target.closest("[data-x]");
      if(p)staffPw(p.dataset.p,p.dataset.e);
      if(x&&confirm("Remove login for "+x.dataset.e+"? They will not be able to sign in again."))staffApi("delete",{id:x.dataset.x}).then(()=>{toast("Staff removed");staffPg()}).catch(er=>toast(er.message))
    };ic()
  }catch(er){$("#sl2").innerHTML=emp("alert-triangle","Staff manager is not ready",esc(er.message)+" - deploy the staff-admin function in Supabase (see setup steps).");ic()}
}
function staffAdd(){form("Add staff","Staff will sign in to the store app with this email and password.",[{k:"email",l:"Email *",t:"email",req:1,full:1},{k:"pw",l:"Password * (min 6 characters)",req:1,full:1}],"Create login",d=>{
  if(!d.pw||d.pw.length<6)return toast("Password needs at least 6 characters");
  staffApi("create",{email:d.email.trim().toLowerCase(),password:d.pw}).then(()=>{toast("Staff login created");if(location.hash==="#staff")staffPg()}).catch(er=>toast(er.message))})}
function staffPw(id,email){form("Change password",esc(email),[{k:"pw",l:"New password * (min 6 characters)",req:1,full:1}],"Update password",d=>{
  if(!d.pw||d.pw.length<6)return toast("Password needs at least 6 characters");
  staffApi("password",{id,password:d.pw}).then(()=>toast("Password updated")).catch(er=>toast(er.message))})}

/* ===== LOGIN (admin accounts only) ===== */
function showLogin(done){
  const L=$("#login");
  document.querySelector(".shell").style.display="none";L.hidden=false;
  L.innerHTML=`<form class="lcard" id="lf" autocomplete="on"><div class="llogo"><img src="allfa-logo.png" alt="Allfa"></div><div><h2>Welcome back</h2><p>Owner login</p></div>
  <div class="lf"><div class="lin"><i data-lucide="mail"></i><input id="le" type="email" placeholder="Admin email" autocomplete="username" required></div>
  <div class="lin"><i data-lucide="lock"></i><input id="lp" type="password" placeholder="Password" autocomplete="current-password" required><button type="button" class="eye" id="ey" aria-label="Show password"><i data-lucide="eye"></i></button></div></div>
  <p class="lerr" id="lx"></p><button class="lgo">Login<i data-lucide="arrow-right"></i></button><div class="lfoot">ALLFA · ADMIN</div></form>`;
  ic();$("#le").focus();
  $("#ey").onclick=()=>{const p=$("#lp"),s=p.type==="password";p.type=s?"text":"password";$("#ey").innerHTML=`<i data-lucide="${s?"eye-off":"eye"}"></i>`;ic()};
  $("#lf").onsubmit=async e=>{
    e.preventDefault();const x=$("#lx"),b=$("#lf .lgo");x.textContent="";b.disabled=true;
    try{
      const r=await sbAuth("token?grant_type=password",{email:$("#le").value.trim().toLowerCase(),password:$("#lp").value}),j=await r.json();
      if(!r.ok||!j.access_token)return x.textContent="Wrong email or password. Try again.";
      if(!j.user||!j.user.app_metadata||j.user.app_metadata.role!=="admin")return x.textContent="This account is not an admin account.";
      setSession(j);L.hidden=true;L.innerHTML="";document.querySelector(".shell").style.display="";done()
    }catch{x.textContent="No internet. Admin login needs internet the first time."}
    finally{b.disabled=false}
  };
}
function init(){
  const nav=document.querySelector("nav");
  if(nav&&!nav.querySelector('[data-page="staff"]'))nav.insertAdjacentHTML("beforeend",'<a data-page="staff" href="#staff"><i data-lucide="users"></i>Staff logins</a>');
  $("#today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#menuBtn").onclick=()=>$("#side").classList.toggle("open");$("#modal").onclick=e=>{if(e.target.id==="modal")closeM()};document.onkeydown=e=>{if(e.key==="Escape")closeM()};
  $("#gq").oninput=()=>{reload();gsearch()};$("#gq").onfocus=()=>{if($("#gq").value)gsearch()};
  $("#gq").onkeydown=e=>{if(e.key==="Enter")gopen(0);if(e.key==="Escape"){$("#gq").value="";gsearch()}};
  $("#gres").onclick=e=>{const r=e.target.closest("[data-n]");if(r)gopen(+r.dataset.n)};
  document.addEventListener("click",e=>{if(!e.target.closest(".gs"))$("#gres").classList.remove("open")});
  $("#lk").onclick=signOut;
  $("#bk").onclick=()=>dl("e-sevai-backup-"+today()+".json",JSON.stringify({[KEY]:load(KEY,{}),[PK]:prices,[EK]:exps}),"application/json");
  $("#rs").onclick=()=>$("#rf").click();
  $("#rf").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!confirm("Replace current data with this backup? This also replaces the cloud data for all devices."))return;
    if(j[KEY]){j[KEY]._ts=Date.now();localStorage.setItem(KEY,JSON.stringify(j[KEY]));upsert("allfa-main",j[KEY])}
    if(j[PK]){localStorage.setItem(PK,JSON.stringify(j[PK]));reload();cfgPush()}
    if(j[EK]){localStorage.setItem(EK,JSON.stringify(j[EK]));reload();expPush()}
    go();toast("Backup restored")}catch{toast("Invalid backup file")}};
  window.onhashchange=go;window.addEventListener("storage",go);window.addEventListener("focus",()=>{if($("#modal").className.indexOf("open")<0)go()});go();
  cloudPull();setInterval(cloudPull,30000);
  addEventListener("online",cloudPull);document.addEventListener("visibilitychange",()=>{if(!document.hidden)cloudPull()});
}
document.addEventListener("DOMContentLoaded",()=>{loadAuth();authed()?init():showLogin(init)});