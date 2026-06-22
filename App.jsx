import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, Sparkles, TrendingUp, Star, Copy, Check,
  Plus, Trash2, ChevronLeft, ChevronRight, Loader2,
  Users, Phone, LogOut, Lock, BarChart2, Target,
  CheckSquare, MessageSquare, Radio, Instagram, Facebook,
} from "lucide-react";
import { supabase } from "./supabaseClient.js";

const TREATMENTS = [
  "Acne & Acne-Scar Therapy","Skin Brightening Facial","Anti-Ageing Treatment",
  "Laser Hair Removal","PRP Hair Therapy","Hair Fall Treatment",
  "Dandruff & Scalp Care","Bridal Skin & Hair Package",
];
const POST_TEMPLATES = {
  Offer:(t)=>`✨ This Week at The Cutique ✨\nGet a special offer on our ${t}. Visit The Cutique Skin and Hair Clinic in Kondotty — limited slots this week. Book now! 📍 Kondotty`,
  "Service Highlight":(t)=>`Curious about ${t}? At The Cutique Skin and Hair Clinic, Kondotty, our specialists tailor every treatment to you. Free consultation available — drop by or call to know more.`,
  "Trust / Result":(t)=>`Real care, real results. 💛 From ${t.toLowerCase()} to everyday skin & hair health, Kondotty trusts The Cutique. Book your free consultation today.`,
  Reminder:(t)=>`Don't wait till it's urgent — your skin & hair deserve regular care. Ask us about ${t.toLowerCase()} at The Cutique Skin and Hair Clinic this month.`,
};
const QA_BANK = [
  {q:"What treatments does The Cutique offer?",a:"We offer a full range of skin and hair treatments including acne and acne-scar therapy, skin brightening facials, anti-ageing treatments, laser hair removal, PRP hair therapy, hair fall treatment, dandruff/scalp care, and bridal skin & hair packages."},
  {q:"Do I need an appointment, or are walk-ins welcome?",a:"Walk-ins are welcome, but we recommend booking ahead to avoid waiting, especially for laser or PRP therapy. Call us to book."},
  {q:"What are your clinic timings?",a:"We're open Monday to Saturday, 10 AM to 7 PM. Call ahead to confirm on holidays."},
  {q:"Is parking available near the clinic?",a:"Yes, parking is available near the clinic."},
  {q:"Do you offer free consultations?",a:"Yes — we offer a free initial consultation for most treatments so our specialists can recommend the right plan for you."},
  {q:"Is The Cutique hygienic and safe for treatments like laser and PRP?",a:"Absolutely. We follow strict hygiene protocols and use modern, sterilized equipment for every treatment."},
];
const COMPETITOR_SEED = [
  {name:"Medrima SkinCare",area:"Malappuram",rating:4.7,reviewCount:101,phone:"+91 70346 46646"},
  {name:"Zelesta Skin & Hair Care Clinic",area:"Malappuram",rating:5.0,reviewCount:21,phone:"+91 83049 20618"},
  {name:"Aestra Skin Hair Aesthetic",area:"Malappuram (Perinthalmanna)",rating:4.7,reviewCount:2337,phone:"+91 99475 49050"},
  {name:"Amanza Skin Clinic",area:"Malappuram (Perinthalmanna)",rating:4.9,reviewCount:1059,phone:"+91 90488 00010"},
  {name:"Cutis International Cosmetic Clinics",area:"Kozhikode",rating:4.8,reviewCount:1593,phone:"+91 79942 33344"},
  {name:"Nahas Skin Clinic",area:"Kozhikode",rating:4.7,reviewCount:1208,phone:"+91 88915 13010"},
  {name:"Hair O Craft",area:"Kozhikode",rating:4.8,reviewCount:984,phone:"+91 75938 51089"},
  {name:"Dr. Lasi's Skin and Hair Clinic",area:"Kozhikode",rating:4.6,reviewCount:587,phone:"+91 81398 82226"},
  {name:"Prime Skin Hair and Laser Clinic",area:"Kozhikode",rating:4.7,reviewCount:410,phone:"+91 97469 49999"},
  {name:"Dr. Neha's Skin Clinic",area:"Kozhikode",rating:4.7,reviewCount:210,phone:"+91 88918 28048"},
  {name:"Criniere Dermis Skin And Hair Clinic",area:"Kozhikode",rating:4.9,reviewCount:174,phone:"+91 81119 99150"},
  {name:"Charmam Skin Clinic",area:"Kozhikode",rating:4.9,reviewCount:98,phone:"+91 62820 19996"},
];
const ADMIN_EMAILS = ["adarshkvenuraj@gmail.com"];

function uid(){return Math.random().toString(36).slice(2,10);}
function startOfWeek(d){const date=new Date(d);const day=date.getDay();date.setDate(date.getDate()-day);date.setHours(0,0,0,0);return date;}
function fmtDate(d){return d.toLocaleDateString(undefined,{month:"short",day:"numeric"});}
function currentMonth(){return new Date().toISOString().slice(0,7);}
function monthLabel(m){const[y,mo]=m.split("-");return new Date(y,mo-1).toLocaleString(undefined,{month:"long",year:"numeric"});}

// Row mappers
function calRowToEntry(r){return{id:r.id,weekKey:r.week_key,day:r.day,title:r.title,category:r.category,done:r.done};}
function entryToCalRow(e){return{id:e.id,week_key:e.weekKey,day:e.day,title:e.title,category:e.category,done:e.done};}
function logRowToLog(r){return{id:r.id,date:r.date,keyword:r.keyword,rank:r.rank,reviewCount:r.review_count,avgRating:r.avg_rating};}
function logToLogRow(l){return{id:l.id,date:l.date,keyword:l.keyword,rank:l.rank,review_count:l.reviewCount,avg_rating:l.avgRating};}
function compRowToComp(r){return{id:r.id,name:r.name,area:r.area,rating:r.rating,reviewCount:r.review_count,phone:r.phone,history:r.history||[]};}
function compToCompRow(c){return{id:c.id,name:c.name,area:c.area,rating:c.rating,review_count:c.reviewCount,phone:c.phone,history:c.history||[]};}

/* ── Progress Bar ── */
function ProgressBar({value,target,color}){
  const pct=target>0?Math.min(100,Math.round((value/target)*100)):0;
  return(
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{width:`${pct}%`,background:color||"var(--clay)"}}/>
      </div>
      <span className="progress-pct">{pct}%</span>
    </div>
  );
}

/* ── Simple Bar Chart ── */
function BarChart({data,color}){
  const max=Math.max(...data.map(d=>d.value),1);
  return(
    <div className="bar-chart">
      {data.map((d,i)=>(
        <div key={i} className="bar-col">
          <div className="bar-outer">
            <div className="bar-inner" style={{height:`${Math.round((d.value/max)*100)}%`,background:color||"var(--clay)"}}/>
          </div>
          <span className="bar-label">{d.label}</span>
          <span className="bar-val">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================ LOGIN ================================================================ */
function LoginScreen(){
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false);const[error,setError]=useState("");
  async function handleLogin(){
    if(!email.trim()||!password.trim()){setError("Please enter your email and password.");return;}
    setLoading(true);setError("");
    const{error:err}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(err){setError("Incorrect email or password. Please try again.");setLoading(false);}
  }
  return(
    <div className="login-wrap"><style>{CSS}</style>
      <div className="login-card">
        <div className="login-brand"><div className="brand-mark">C</div><div><div className="brand-name">The Cutique</div><div className="brand-sub">GBP Control Panel</div></div></div>
        <h2 className="login-title">Sign in to continue</h2>
        {error&&<div className="login-error">{error}</div>}
        <label className="field"><span>Email</span><input className="text-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></label>
        <label className="field" style={{marginTop:12}}><span>Password</span><input className="text-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></label>
        <button className="primary-btn login-btn" onClick={handleLogin} disabled={loading}>{loading?<Loader2 size={16} className="spin"/>:<Lock size={16}/>}{loading?"Signing in…":"Sign in"}</button>
        <p className="login-hint">Contact your admin if you forgot your password.</p>
      </div>
    </div>
  );
}

/* ================================================================ GLOW STREAK ================================================================ */
function GlowStreak({doneCount,total}){
  const pct=total===0?0:Math.round((doneCount/total)*100);
  return(
    <div className="glow-streak">
      <div className="glow-streak-head"><span className="glow-label">This week's consistency</span><span className="glow-pct">{pct}%</span></div>
      <div className="glow-track"><div className="glow-fill" style={{width:`${pct}%`}}/></div>
      <span className="glow-sub">{doneCount} of {total} planned posts marked done</span>
    </div>
  );
}

/* ================================================================ SIDEBAR ================================================================ */
function Sidebar({tab,setTab,role,email,onLogout}){
  const allItems=[
    {id:"calendar",label:"Content Calendar",icon:Calendar},
    {id:"generator",label:"Content Generator",icon:Sparkles},
    {id:"stats",label:"Business Stats",icon:BarChart2,adminOnly:true},
    {id:"marketing",label:"Marketing Metrics",icon:Radio,adminOnly:true},
    {id:"goals",label:"Monthly Goals",icon:Target,adminOnly:true},
    {id:"tracker",label:"Ranking & Reviews",icon:TrendingUp,adminOnly:true},
    {id:"competitors",label:"Competitors",icon:Users,adminOnly:true},
    {id:"tasks",label:"Staff Tasks",icon:CheckSquare},
    {id:"feedback",label:"Client Feedback",icon:MessageSquare},
  ];
  const items=allItems.filter(i=>!i.adminOnly||role==="admin");
  return(
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">C</div><div className="brand-text"><div className="brand-name">The Cutique</div><div className="brand-sub">GBP Control Panel</div></div></div>
      <nav className="nav">
        {items.map(it=>{const Icon=it.icon;const active=tab===it.id;return(
          <button key={it.id} className={`nav-item ${active?"active":""}`} onClick={()=>setTab(it.id)}><Icon size={16} strokeWidth={2}/><span>{it.label}</span></button>
        );})}
      </nav>
      <div className="sidebar-foot">
        <div className="user-info"><span className="user-email">{email}</span><span className={`role-tag ${role}`}>{role}</span></div>
        <button className="logout-btn" onClick={onLogout}><LogOut size={13}/>Sign out</button>
      </div>
    </aside>
  );
}

/* ================================================================ CALENDAR ================================================================ */
function CalendarTab({entries,onAdd,onToggleDone,onRemove}){
  const[weekStart,setWeekStart]=useState(()=>startOfWeek(new Date()));
  const[newPost,setNewPost]=useState({day:0,title:"",category:"Offer"});
  const weekDays=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return d;}),[weekStart]);
  const weekKey=weekStart.toISOString().slice(0,10);
  const weekEntries=entries.filter(e=>e.weekKey===weekKey);
  function addEntry(){if(!newPost.title.trim())return;onAdd({id:uid(),weekKey,day:newPost.day,title:newPost.title.trim(),category:newPost.category,done:false});setNewPost({day:0,title:"",category:"Offer"});}
  function toggleDone(id){const e=entries.find(x=>x.id===id);if(e)onToggleDone(id,!e.done);}
  const dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Content Calendar</h1><p className="panel-desc">Plan your weekly Google Posts. Consistency keeps your profile active in Google's eyes.</p></div></div>
      <GlowStreak doneCount={weekEntries.filter(e=>e.done).length} total={weekEntries.length}/>
      <div className="week-nav">
        <button className="icon-btn" onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()-7);setWeekStart(d);}}><ChevronLeft size={16}/></button>
        <span className="week-range">{fmtDate(weekDays[0])} – {fmtDate(weekDays[6])}</span>
        <button className="icon-btn" onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()+7);setWeekStart(d);}}><ChevronRight size={16}/></button>
        <button className="link-btn" onClick={()=>setWeekStart(startOfWeek(new Date()))}>This week</button>
      </div>
      <div className="add-row">
        <select value={newPost.day} onChange={e=>setNewPost({...newPost,day:Number(e.target.value)})} className="select">{dayNames.map((d,i)=><option key={d} value={i}>{d} {fmtDate(weekDays[i])}</option>)}</select>
        <select value={newPost.category} onChange={e=>setNewPost({...newPost,category:e.target.value})} className="select">{Object.keys(POST_TEMPLATES).map(c=><option key={c} value={c}>{c}</option>)}</select>
        <input className="text-input" placeholder="What's the post about? e.g. Laser Hair Removal" value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addEntry()}/>
        <button className="primary-btn" onClick={addEntry}><Plus size={15}/>Add</button>
      </div>
      <div className="cal-grid">
        {weekDays.map((d,i)=>{
          const dayEntries=weekEntries.filter(e=>e.day===i);
          const isToday=d.toDateString()===new Date().toDateString();
          return(
            <div key={i} className={`cal-day ${isToday?"today":""}`}>
              <div className="cal-day-head"><span className="cal-day-name">{dayNames[i]}</span><span className="cal-day-num">{d.getDate()}</span></div>
              <div className="cal-day-body">
                {dayEntries.length===0&&<span className="cal-empty">—</span>}
                {dayEntries.map(e=>(
                  <div key={e.id} className={`cal-card ${e.done?"done":""}`}>
                    <button className="cal-check" onClick={()=>toggleDone(e.id)}>{e.done?<Check size={12}/>:null}</button>
                    <div className="cal-card-body"><span className="cal-cat">{e.category}</span><span className="cal-title">{e.title}</span></div>
                    <button className="cal-remove" onClick={()=>onRemove(e.id)}><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ GENERATOR ================================================================ */
function GeneratorTab(){
  const[mode,setMode]=useState("post");const[treatment,setTreatment]=useState(TREATMENTS[0]);
  const[category,setCategory]=useState("Offer");const[copiedId,setCopiedId]=useState(null);
  function copy(text,id){navigator.clipboard?.writeText(text).catch(()=>{});setCopiedId(id);setTimeout(()=>setCopiedId(null),1500);}
  const description=`The Cutique Skin and Hair Clinic in Kondotty offers complete skin and hair care under one roof. Our treatments include acne and acne-scar therapy, skin brightening facials, anti-ageing treatments, laser hair removal, PRP hair therapy, hair fall treatment, dandruff and scalp care, and bridal skin/hair packages. Led by experienced specialists using modern, hygienic techniques, we focus on visible, long-lasting results tailored to each client. Whether you're looking for a quick facial or a full hair restoration plan, The Cutique is your trusted skin and hair clinic in Kondotty. Walk-ins welcome — book your consultation today!`;
  const generatedPost=POST_TEMPLATES[category](treatment);
  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Content Generator</h1><p className="panel-desc">Ready-made copy for your profile description, weekly posts, and Q&A.</p></div></div>
      <div className="seg-control">
        {[{id:"post",label:"Post"},{id:"description",label:"Profile Description"},{id:"qa",label:"Q&A"}].map(m=>(
          <button key={m.id} className={`seg-btn ${mode===m.id?"active":""}`} onClick={()=>setMode(m.id)}>{m.label}</button>
        ))}
      </div>
      {mode==="post"&&(<div className="gen-card">
        <div className="gen-controls">
          <label className="field"><span>Treatment</span><select className="select" value={treatment} onChange={e=>setTreatment(e.target.value)}>{TREATMENTS.map(t=><option key={t}>{t}</option>)}</select></label>
          <label className="field"><span>Post style</span><select className="select" value={category} onChange={e=>setCategory(e.target.value)}>{Object.keys(POST_TEMPLATES).map(c=><option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="output-box"><p>{generatedPost}</p><button className="copy-btn" onClick={()=>copy(generatedPost,"post")}>{copiedId==="post"?<Check size={14}/>:<Copy size={14}/>}{copiedId==="post"?"Copied":"Copy"}</button></div>
        <p className="hint">Tip: pair this post with a fresh photo before publishing.</p>
      </div>)}
      {mode==="description"&&(<div className="gen-card">
        <div className="output-box"><p>{description}</p><button className="copy-btn" onClick={()=>copy(description,"desc")}>{copiedId==="desc"?<Check size={14}/>:<Copy size={14}/>}{copiedId==="desc"?"Copied":"Copy"}</button></div>
        <p className="hint">{description.length} / 750 characters</p>
      </div>)}
      {mode==="qa"&&(<div className="qa-list">{QA_BANK.map((item,i)=>(
        <div className="qa-card" key={i}>
          <div className="qa-q">{item.q}</div><div className="qa-a">{item.a}</div>
          <button className="copy-btn qa-copy" onClick={()=>copy(`${item.q}\n${item.a}`,`qa-${i}`)}>{copiedId===`qa-${i}`?<Check size={13}/>:<Copy size={13}/>}{copiedId===`qa-${i}`?"Copied":"Copy"}</button>
        </div>
      ))}</div>)}
    </div>
  );
}

/* ================================================================ BUSINESS STATS ================================================================ */
function BusinessStatsTab(){
  const[stats,setStats]=useState([]);
  const[bookings,setBookings]=useState([]);
  const[form,setForm]=useState({date:new Date().toISOString().slice(0,10),appointments:"",new_clients:"",revenue:""});
  const[bForm,setBForm]=useState({treatment:TREATMENTS[0],count:"1"});
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const[s,b]=await Promise.all([
        supabase.from("business_stats").select("*").order("date",{ascending:false}).limit(30),
        supabase.from("treatment_bookings").select("*").order("date",{ascending:false}).limit(50),
      ]);
      setStats(s.data||[]);setBookings(b.data||[]);setLoading(false);
    })();
  },[]);

  async function addStat(){
    if(!form.date)return;
    const row={id:uid(),date:form.date,appointments:Number(form.appointments)||0,new_clients:Number(form.new_clients)||0,revenue:Number(form.revenue)||0};
    setStats(p=>[row,...p]);
    await supabase.from("business_stats").insert(row);
    setForm({date:new Date().toISOString().slice(0,10),appointments:"",new_clients:"",revenue:""});
  }
  async function addBooking(){
    if(!bForm.treatment)return;
    const row={id:uid(),date:new Date().toISOString().slice(0,10),treatment:bForm.treatment,count:Number(bForm.count)||1};
    setBookings(p=>[row,...p]);
    await supabase.from("treatment_bookings").insert(row);
  }
  async function removeStat(id){setStats(p=>p.filter(s=>s.id!==id));await supabase.from("business_stats").delete().eq("id",id);}

  const totalRevenue=stats.slice(0,7).reduce((a,s)=>a+Number(s.revenue),0);
  const totalAppts=stats.slice(0,7).reduce((a,s)=>a+Number(s.appointments),0);
  const totalNew=stats.slice(0,7).reduce((a,s)=>a+Number(s.new_clients),0);

  // Treatment popularity
  const treatmentMap={};
  bookings.forEach(b=>{treatmentMap[b.treatment]=(treatmentMap[b.treatment]||0)+Number(b.count);});
  const treatmentData=Object.entries(treatmentMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label:label.split(" ")[0],value}));

  if(loading)return <div className="loading-state"><Loader2 className="spin" size={18}/><span>Loading stats…</span></div>;

  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Business Stats</h1><p className="panel-desc">Track appointments, new clients, revenue, and which treatments are most popular.</p></div></div>

      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Revenue (last 7 entries)</span><span className="stat-value">₹{totalRevenue.toLocaleString()}</span></div>
        <div className="stat-card"><span className="stat-label">Appointments (last 7)</span><span className="stat-value">{totalAppts}</span></div>
        <div className="stat-card"><span className="stat-label">New Clients (last 7)</span><span className="stat-value">{totalNew}</span></div>
      </div>

      {treatmentData.length>0&&(
        <div className="chart-card">
          <div className="chart-title">Treatment Popularity</div>
          <BarChart data={treatmentData} color="var(--sage)"/>
        </div>
      )}

      <div className="section-title">Log Daily Stats</div>
      <div className="add-row">
        <input type="date" className="select" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <input className="select narrow" type="number" min="0" placeholder="Appts" value={form.appointments} onChange={e=>setForm({...form,appointments:e.target.value})}/>
        <input className="select narrow" type="number" min="0" placeholder="New clients" value={form.new_clients} onChange={e=>setForm({...form,new_clients:e.target.value})}/>
        <input className="select narrow" type="number" min="0" placeholder="Revenue ₹" value={form.revenue} onChange={e=>setForm({...form,revenue:e.target.value})}/>
        <button className="primary-btn" onClick={addStat}><Plus size={15}/>Log</button>
      </div>

      <div className="section-title">Log Treatment Booking</div>
      <div className="add-row">
        <select className="select" value={bForm.treatment} onChange={e=>setBForm({...bForm,treatment:e.target.value})}>{TREATMENTS.map(t=><option key={t}>{t}</option>)}</select>
        <input className="select narrow" type="number" min="1" placeholder="Count" value={bForm.count} onChange={e=>setBForm({...bForm,count:e.target.value})}/>
        <button className="primary-btn" onClick={addBooking}><Plus size={15}/>Add</button>
      </div>

      <div className="log-table">
        <div className="log-row log-head" style={{gridTemplateColumns:"100px 80px 90px 100px 28px"}}><span>Date</span><span>Appts</span><span>New Clients</span><span>Revenue ₹</span><span></span></div>
        {stats.length===0&&<div className="empty-state">No stats logged yet. Start logging daily to see trends.</div>}
        {stats.map(s=>(
          <div className="log-row" key={s.id} style={{gridTemplateColumns:"100px 80px 90px 100px 28px"}}>
            <span>{s.date}</span><span>{s.appointments}</span><span>{s.new_clients}</span>
            <span>₹{Number(s.revenue).toLocaleString()}</span>
            <button className="cal-remove" onClick={()=>removeStat(s.id)}><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ MARKETING METRICS ================================================================ */
function MarketingTab(){
  const[metrics,setMetrics]=useState([]);
  const[form,setForm]=useState({date:new Date().toISOString().slice(0,10),impressions:"",clicks:"",whatsapp_enquiries:"",ig_followers:"",ig_engagement:"",fb_followers:"",fb_engagement:""});
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("marketing_metrics").select("*").order("date",{ascending:false}).limit(20).then(({data})=>{setMetrics(data||[]);setLoading(false);});
  },[]);

  async function addMetric(){
    if(!form.date)return;
    const row={id:uid(),date:form.date,impressions:Number(form.impressions)||0,clicks:Number(form.clicks)||0,whatsapp_enquiries:Number(form.whatsapp_enquiries)||0,ig_followers:Number(form.ig_followers)||0,ig_engagement:Number(form.ig_engagement)||0,fb_followers:Number(form.fb_followers)||0,fb_engagement:Number(form.fb_engagement)||0};
    setMetrics(p=>[row,...p]);
    await supabase.from("marketing_metrics").insert(row);
    setForm({date:new Date().toISOString().slice(0,10),impressions:"",clicks:"",whatsapp_enquiries:"",ig_followers:"",ig_engagement:"",fb_followers:"",fb_engagement:""});
  }
  async function removeMetric(id){setMetrics(p=>p.filter(m=>m.id!==id));await supabase.from("marketing_metrics").delete().eq("id",id);}

  const latest=metrics[0];
  if(loading)return <div className="loading-state"><Loader2 className="spin" size={18}/><span>Loading…</span></div>;

  const searchData=metrics.slice(0,6).reverse().map(m=>({label:m.date.slice(5),value:m.impressions}));
  const waData=metrics.slice(0,6).reverse().map(m=>({label:m.date.slice(5),value:m.whatsapp_enquiries}));

  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Marketing Metrics</h1><p className="panel-desc">Track Google Search visibility, WhatsApp enquiries, and social media growth weekly.</p></div></div>

      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Google Impressions</span><span className="stat-value">{latest?.impressions?.toLocaleString()||"—"}</span></div>
        <div className="stat-card"><span className="stat-label">Google Clicks</span><span className="stat-value">{latest?.clicks?.toLocaleString()||"—"}</span></div>
        <div className="stat-card"><span className="stat-label">WhatsApp Enquiries</span><span className="stat-value">{latest?.whatsapp_enquiries||"—"}</span></div>
      </div>

      <div className="metrics-social">
        <div className="social-card">
          <div className="social-head"><Instagram size={16}/> Instagram</div>
          <div className="social-stats">
            <span><b>{latest?.ig_followers?.toLocaleString()||"—"}</b> followers</span>
            <span><b>{latest?.ig_engagement||"—"}</b> engagements</span>
          </div>
        </div>
        <div className="social-card">
          <div className="social-head"><Facebook size={16}/> Facebook</div>
          <div className="social-stats">
            <span><b>{latest?.fb_followers?.toLocaleString()||"—"}</b> followers</span>
            <span><b>{latest?.fb_engagement||"—"}</b> engagements</span>
          </div>
        </div>
      </div>

      {searchData.length>1&&(
        <div className="charts-row">
          <div className="chart-card"><div className="chart-title">Google Impressions trend</div><BarChart data={searchData} color="var(--clay)"/></div>
          <div className="chart-card"><div className="chart-title">WhatsApp Enquiries trend</div><BarChart data={waData} color="var(--sage)"/></div>
        </div>
      )}

      <div className="section-title">Log Weekly Metrics</div>
      <div className="metrics-form">
        <input type="date" className="select" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <div className="metrics-grid">
          <label className="field"><span>🔍 Impressions</span><input className="text-input" type="number" min="0" placeholder="0" value={form.impressions} onChange={e=>setForm({...form,impressions:e.target.value})}/></label>
          <label className="field"><span>🖱 Clicks</span><input className="text-input" type="number" min="0" placeholder="0" value={form.clicks} onChange={e=>setForm({...form,clicks:e.target.value})}/></label>
          <label className="field"><span>💬 WhatsApp Enquiries</span><input className="text-input" type="number" min="0" placeholder="0" value={form.whatsapp_enquiries} onChange={e=>setForm({...form,whatsapp_enquiries:e.target.value})}/></label>
          <label className="field"><span>📸 IG Followers</span><input className="text-input" type="number" min="0" placeholder="0" value={form.ig_followers} onChange={e=>setForm({...form,ig_followers:e.target.value})}/></label>
          <label className="field"><span>❤️ IG Engagements</span><input className="text-input" type="number" min="0" placeholder="0" value={form.ig_engagement} onChange={e=>setForm({...form,ig_engagement:e.target.value})}/></label>
          <label className="field"><span>👥 FB Followers</span><input className="text-input" type="number" min="0" placeholder="0" value={form.fb_followers} onChange={e=>setForm({...form,fb_followers:e.target.value})}/></label>
          <label className="field"><span>👍 FB Engagements</span><input className="text-input" type="number" min="0" placeholder="0" value={form.fb_engagement} onChange={e=>setForm({...form,fb_engagement:e.target.value})}/></label>
        </div>
        <button className="primary-btn" style={{marginTop:12}} onClick={addMetric}><Plus size={15}/>Log Metrics</button>
      </div>
      <p className="hint">Get Google impressions & clicks from <b>Google Search Console → Performance</b> — it's free and shows exactly how many people searched and found your clinic.</p>
    </div>
  );
}

/* ================================================================ GOALS ================================================================ */
function GoalsTab(){
  const[goal,setGoal]=useState(null);
  const[month,setMonth]=useState(currentMonth());
  const[editing,setEditing]=useState(false);
  const[form,setForm]=useState({reviews_target:0,posts_target:0,revenue_target:0,appointments_target:0,reviews_done:0,posts_done:0,revenue_done:0,appointments_done:0});
  const[loading,setLoading]=useState(true);

  useEffect(()=>{loadGoal();},[month]);

  async function loadGoal(){
    setLoading(true);
    const{data}=await supabase.from("monthly_goals").select("*").eq("month",month).maybeSingle();
    setGoal(data||null);
    if(data)setForm(data);
    else setForm({reviews_target:20,posts_target:4,revenue_target:50000,appointments_target:100,reviews_done:0,posts_done:0,revenue_done:0,appointments_done:0});
    setLoading(false);
  }

  async function saveGoal(){
    const row={...form,id:goal?.id||uid(),month};
    if(goal){await supabase.from("monthly_goals").update(row).eq("id",goal.id);}
    else{await supabase.from("monthly_goals").insert(row);}
    setGoal(row);setEditing(false);
  }

  const goalItems=[
    {label:"Google Reviews",done:"reviews_done",target:"reviews_target",color:"var(--clay)",prefix:"",suffix:"reviews"},
    {label:"Google Posts Published",done:"posts_done",target:"posts_target",color:"var(--sage)",prefix:"",suffix:"posts"},
    {label:"Revenue",done:"revenue_done",target:"revenue_target",color:"#8B6DB5",prefix:"₹",suffix:""},
    {label:"Appointments",done:"appointments_done",target:"appointments_target",color:"#5C8FA0",prefix:"",suffix:"appts"},
  ];

  if(loading)return <div className="loading-state"><Loader2 className="spin" size={18}/><span>Loading goals…</span></div>;

  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Monthly Goals</h1><p className="panel-desc">Set targets for reviews, posts, revenue, and appointments. Track progress through the month.</p></div></div>

      <div className="goals-nav">
        <input type="month" className="select" value={month} onChange={e=>setMonth(e.target.value)}/>
        <button className="primary-btn" onClick={()=>setEditing(!editing)}>{editing?"Cancel":"Edit Goals"}</button>
      </div>

      {editing?(
        <div className="goals-edit">
          <div className="metrics-grid">
            {goalItems.map(g=>(
              <div key={g.label} className="goals-edit-group">
                <div className="section-title" style={{marginBottom:8}}>{g.label}</div>
                <label className="field"><span>Target</span><input className="text-input" type="number" min="0" value={form[g.target]} onChange={e=>setForm({...form,[g.target]:Number(e.target.value)})}/></label>
                <label className="field" style={{marginTop:6}}><span>Done so far</span><input className="text-input" type="number" min="0" value={form[g.done]} onChange={e=>setForm({...form,[g.done]:Number(e.target.value)})}/></label>
              </div>
            ))}
          </div>
          <button className="primary-btn" style={{marginTop:16}} onClick={saveGoal}><Check size={15}/>Save Goals</button>
        </div>
      ):(
        <div className="goals-grid">
          {goalItems.map(g=>(
            <div className="goal-card" key={g.label}>
              <div className="goal-label">{g.label}</div>
              <div className="goal-numbers">
                <span className="goal-done">{g.prefix}{(goal?form[g.done]:0).toLocaleString()}{g.suffix}</span>
                <span className="goal-target">/ {g.prefix}{(goal?form[g.target]:0).toLocaleString()}{g.suffix}</span>
              </div>
              <ProgressBar value={goal?form[g.done]:0} target={goal?form[g.target]:1} color={g.color}/>
            </div>
          ))}
        </div>
      )}

      {!goal&&!editing&&<div className="empty-state">No goals set for {monthLabel(month)} yet. Click "Edit Goals" to set your targets.</div>}
      <p className="hint">Update the "Done so far" numbers regularly to keep your progress accurate.</p>
    </div>
  );
}

/* ================================================================ TRACKER ================================================================ */
function TrackerTab({logs,onAdd,onRemove}){
  const[form,setForm]=useState({date:new Date().toISOString().slice(0,10),keyword:"",rank:"",reviewCount:"",avgRating:""});
  function addLog(){if(!form.keyword.trim())return;onAdd({id:uid(),...form,rank:Number(form.rank)||null,reviewCount:Number(form.reviewCount)||null,avgRating:Number(form.avgRating)||null});setForm({...form,keyword:"",rank:"",reviewCount:"",avgRating:""});}
  const latest=logs[0];
  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Ranking & Reviews</h1><p className="panel-desc">Log your search position and review numbers weekly.</p></div></div>
      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Latest rank</span><span className="stat-value">{latest?.rank?`#${latest.rank}`:"—"}</span></div>
        <div className="stat-card"><span className="stat-label">Reviews</span><span className="stat-value">{latest?.reviewCount??"—"}</span></div>
        <div className="stat-card"><span className="stat-label">Avg. rating</span><span className="stat-value">{latest?.avgRating?<span className="rating-inline"><Star size={16} fill="#A8765C" stroke="none"/>{latest.avgRating}</span>:"—"}</span></div>
      </div>
      <div className="add-row tracker-add">
        <input type="date" className="select" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <input className="text-input" placeholder="Keyword (e.g. skin clinic Kondotty)" value={form.keyword} onChange={e=>setForm({...form,keyword:e.target.value})}/>
        <input className="select narrow" type="number" min="1" placeholder="Rank #" value={form.rank} onChange={e=>setForm({...form,rank:e.target.value})}/>
        <input className="select narrow" type="number" min="0" placeholder="Reviews" value={form.reviewCount} onChange={e=>setForm({...form,reviewCount:e.target.value})}/>
        <input className="select narrow" type="number" min="0" max="5" step="0.1" placeholder="Rating" value={form.avgRating} onChange={e=>setForm({...form,avgRating:e.target.value})}/>
        <button className="primary-btn" onClick={addLog}><Plus size={15}/>Log</button>
      </div>
      <div className="log-table">
        <div className="log-row log-head"><span>Date</span><span>Keyword</span><span>Rank</span><span>Reviews</span><span>Rating</span><span></span></div>
        {logs.length===0&&<div className="empty-state">No entries yet. Search your clinic keywords in Google (incognito) and log your position.</div>}
        {logs.map(l=>(
          <div className="log-row" key={l.id}>
            <span>{l.date}</span><span>{l.keyword}</span><span>{l.rank?`#${l.rank}`:"—"}</span>
            <span>{l.reviewCount??"—"}</span><span>{l.avgRating??"—"}</span>
            <button className="cal-remove" onClick={()=>onRemove(l.id)}><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ COMPETITORS ================================================================ */
function CompetitorsTab({competitors,onAdd,onRemove,onUpdate}){
  const[form,setForm]=useState({name:"",area:"Malappuram",rating:"",reviewCount:"",phone:""});
  const[areaFilter,setAreaFilter]=useState("All");const[editingId,setEditingId]=useState(null);
  function addCompetitor(){if(!form.name.trim())return;onAdd({id:uid(),name:form.name.trim(),area:form.area,rating:form.rating?Number(form.rating):null,reviewCount:form.reviewCount?Number(form.reviewCount):null,phone:form.phone.trim(),history:[]});setForm({name:"",area:"Malappuram",rating:"",reviewCount:"",phone:""});}
  function updateSnapshot(id,rating,reviewCount){
    const c=competitors.find(x=>x.id===id);if(!c)return;
    const today=new Date().toISOString().slice(0,10);
    const newRating=rating!==""?Number(rating):c.rating;const newCount=reviewCount!==""?Number(reviewCount):c.reviewCount;
    const history=[...(c.history||[]),{date:today,rating:newRating,reviewCount:newCount}];
    onUpdate(id,{rating:newRating,reviewCount:newCount,history});setEditingId(null);
  }
  const areas=["All",...Array.from(new Set(competitors.map(c=>c.area)))];
  const filtered=areaFilter==="All"?competitors:competitors.filter(c=>c.area===areaFilter);
  const sorted=[...filtered].sort((a,b)=>(b.reviewCount||0)-(a.reviewCount||0));
  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Competitors</h1><p className="panel-desc">Track skin & hair clinics in Malappuram and Kozhikode.</p></div></div>
      <div className="add-row">
        <input className="text-input" placeholder="Clinic name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="text-input narrow-mid" placeholder="Area" value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/>
        <input className="select narrow" type="number" step="0.1" min="0" max="5" placeholder="Rating" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}/>
        <input className="select narrow" type="number" min="0" placeholder="Reviews" value={form.reviewCount} onChange={e=>setForm({...form,reviewCount:e.target.value})}/>
        <input className="text-input narrow-mid" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <button className="primary-btn" onClick={addCompetitor}><Plus size={15}/>Add</button>
      </div>
      <div className="seg-control">{areas.map(a=><button key={a} className={`seg-btn ${areaFilter===a?"active":""}`} onClick={()=>setAreaFilter(a)}>{a}</button>)}</div>
      <div className="comp-grid">
        {sorted.length===0&&<div className="empty-state">No competitors added yet.</div>}
        {sorted.map((c,i)=>(
          <div className="comp-card" key={c.id}>
            <div className="comp-rank">#{i+1}</div>
            <div className="comp-main">
              <div className="comp-name-row"><span className="comp-name">{c.name}</span><span className="comp-area-tag">{c.area}</span></div>
              <div className="comp-stats">
                <span className="comp-stat"><Star size={13} fill="#A8765C" stroke="none"/>{c.rating??"—"}</span>
                <span className="comp-stat">{c.reviewCount??"—"} reviews</span>
                {c.phone&&<span className="comp-stat"><Phone size={12}/>{c.phone}</span>}
              </div>
              {editingId===c.id?(
                <div className="comp-edit-row">
                  <input className="select narrow" type="number" step="0.1" placeholder="New rating" id={`r-${c.id}`}/>
                  <input className="select narrow" type="number" placeholder="New reviews" id={`c-${c.id}`}/>
                  <button className="primary-btn small" onClick={()=>{const r=document.getElementById(`r-${c.id}`).value;const cnt=document.getElementById(`c-${c.id}`).value;updateSnapshot(c.id,r,cnt);}}>Save</button>
                  <button className="link-btn" onClick={()=>setEditingId(null)}>Cancel</button>
                </div>
              ):(
                <button className="link-btn comp-update-btn" onClick={()=>setEditingId(c.id)}>+ Log new snapshot</button>
              )}
              {c.history&&c.history.length>0&&(<div className="comp-history">{c.history.slice(-3).reverse().map((h,idx)=><span key={idx} className="comp-history-item">{h.date}: {h.reviewCount} reviews, {h.rating}★</span>)}</div>)}
            </div>
            <button className="cal-remove comp-remove" onClick={()=>onRemove(c.id)}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ STAFF TASKS ================================================================ */
function StaffTasksTab({role,userEmail}){
  const[tasks,setTasks]=useState([]);
  const[form,setForm]=useState({title:"",frequency:"daily"});
  const[loading,setLoading]=useState(true);
  const weekKey=startOfWeek(new Date()).toISOString().slice(0,10);

  useEffect(()=>{
    supabase.from("staff_tasks").select("*").order("created_at",{ascending:true}).then(({data})=>{setTasks(data||[]);setLoading(false);});
  },[]);

  async function addTask(){
    if(!form.title.trim())return;
    const row={id:uid(),title:form.title.trim(),frequency:form.frequency,created_by:userEmail,done:false,done_by:null,week_key:weekKey};
    setTasks(p=>[...p,row]);
    await supabase.from("staff_tasks").insert(row);
    setForm({title:"",frequency:"daily"});
  }
  async function toggleTask(id,done){
    setTasks(p=>p.map(t=>t.id===id?{...t,done,done_by:done?userEmail:null}:t));
    await supabase.from("staff_tasks").update({done,done_by:done?userEmail:null}).eq("id",id);
  }
  async function removeTask(id){setTasks(p=>p.filter(t=>t.id!==id));await supabase.from("staff_tasks").delete().eq("id",id);}

  const daily=tasks.filter(t=>t.frequency==="daily");
  const weekly=tasks.filter(t=>t.frequency==="weekly");

  if(loading)return <div className="loading-state"><Loader2 className="spin" size={18}/><span>Loading tasks…</span></div>;

  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Staff Tasks</h1><p className="panel-desc">Daily and weekly checklist for the clinic. Admin creates tasks, staff marks them done.</p></div></div>

      {role==="admin"&&(
        <div className="add-row">
          <input className="text-input" placeholder="New task e.g. Post on Instagram" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
          <select className="select" value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option>
          </select>
          <button className="primary-btn" onClick={addTask}><Plus size={15}/>Add Task</button>
        </div>
      )}

      {[{label:"Daily Tasks",items:daily},{label:"Weekly Tasks",items:weekly}].map(group=>(
        <div key={group.label} className="task-group">
          <div className="section-title">{group.label} — {group.items.filter(t=>t.done).length}/{group.items.length} done</div>
          {group.items.length===0&&<div className="empty-state" style={{padding:"12px 0"}}>No {group.label.toLowerCase()} added yet{role==="admin"?" — add one above":"."}.</div>}
          {group.items.map(t=>(
            <div key={t.id} className={`task-card ${t.done?"done":""}`}>
              <button className="task-check" onClick={()=>toggleTask(t.id,!t.done)}>{t.done?<Check size={13}/>:null}</button>
              <span className="task-title">{t.title}</span>
              {t.done&&t.done_by&&<span className="task-by">✓ {t.done_by.split("@")[0]}</span>}
              {role==="admin"&&<button className="cal-remove" onClick={()=>removeTask(t.id)}><Trash2 size={12}/></button>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ================================================================ CLIENT FEEDBACK ================================================================ */
function FeedbackTab({role,userEmail}){
  const[feedbacks,setFeedbacks]=useState([]);
  const[form,setForm]=useState({client_name:"",treatment:TREATMENTS[0],feedback:""});
  const[copiedId,setCopiedId]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("client_feedback").select("*").order("created_at",{ascending:false}).then(({data})=>{setFeedbacks(data||[]);setLoading(false);});
  },[]);

  async function addFeedback(){
    if(!form.feedback.trim())return;
    const row={id:uid(),client_name:form.client_name.trim()||"Anonymous",treatment:form.treatment,feedback:form.feedback.trim(),logged_by:userEmail,used:false};
    setFeedbacks(p=>[row,...p]);
    await supabase.from("client_feedback").insert(row);
    setForm({client_name:"",treatment:TREATMENTS[0],feedback:""});
  }
  async function toggleUsed(id,used){setFeedbacks(p=>p.map(f=>f.id===id?{...f,used}:f));await supabase.from("client_feedback").update({used}).eq("id",id);}
  async function removeFeedback(id){setFeedbacks(p=>p.filter(f=>f.id!==id));await supabase.from("client_feedback").delete().eq("id",id);}
  function copy(text,id){navigator.clipboard?.writeText(text).catch(()=>{});setCopiedId(id);setTimeout(()=>setCopiedId(null),1500);}

  if(loading)return <div className="loading-state"><Loader2 className="spin" size={18}/><span>Loading…</span></div>;

  return(
    <div className="panel">
      <div className="panel-head"><div><h1>Client Feedback</h1><p className="panel-desc">Log positive feedback after appointments. Use them for Google review requests or Instagram captions.</p></div></div>

      <div className="feedback-form">
        <div className="add-row">
          <input className="text-input" placeholder="Client name (optional)" value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/>
          <select className="select" value={form.treatment} onChange={e=>setForm({...form,treatment:e.target.value})}>{TREATMENTS.map(t=><option key={t}>{t}</option>)}</select>
        </div>
        <div className="add-row">
          <textarea className="text-input feedback-textarea" placeholder="What did the client say? e.g. 'My skin looks so much better after just 2 sessions!'" value={form.feedback} onChange={e=>setForm({...form,feedback:e.target.value})} rows={3}/>
          <button className="primary-btn" onClick={addFeedback} style={{alignSelf:"flex-end"}}><Plus size={15}/>Save</button>
        </div>
      </div>

      <div className="section-title">Saved Feedback — {feedbacks.length} total, {feedbacks.filter(f=>!f.used).length} unused</div>
      <div className="feedback-list">
        {feedbacks.length===0&&<div className="empty-state">No feedback logged yet. Ask happy clients what they loved and note it here right away!</div>}
        {feedbacks.map(f=>(
          <div key={f.id} className={`feedback-card ${f.used?"used":""}`}>
            <div className="feedback-head">
              <span className="feedback-name">{f.client_name}</span>
              <span className="comp-area-tag">{f.treatment.split(" ")[0]}</span>
              {f.used&&<span className="used-tag">Used</span>}
            </div>
            <p className="feedback-text">"{f.feedback}"</p>
            <div className="feedback-actions">
              <button className="copy-btn feedback-copy" onClick={()=>copy(f.feedback,f.id)}>{copiedId===f.id?<Check size={13}/>:<Copy size={13}/>}{copiedId===f.id?"Copied":"Copy"}</button>
              <button className="link-btn" onClick={()=>toggleUsed(f.id,!f.used)}>{f.used?"Mark unused":"Mark as used"}</button>
              {role==="admin"&&<button className="cal-remove" style={{marginLeft:"auto"}} onClick={()=>removeFeedback(f.id)}><Trash2 size={13}/></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ APP SHELL ================================================================ */
export default function App(){
  const[session,setSession]=useState(null);const[role,setRole]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);const[tab,setTab]=useState("calendar");
  const[entries,setEntries]=useState([]);const[logs,setLogs]=useState([]);
  const[competitors,setCompetitors]=useState([]);const[dataLoaded,setDataLoaded]=useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session)setRole(ADMIN_EMAILS.includes(session.user.email)?"admin":"staff");
      setAuthLoading(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(session)setRole(ADMIN_EMAILS.includes(session.user.email)?"admin":"staff");
      else setRole(null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session){setDataLoaded(false);return;}
    (async()=>{
      const[calRes,logRes,compRes]=await Promise.all([
        supabase.from("calendar_entries").select("*"),
        supabase.from("ranking_logs").select("*").order("date",{ascending:false}),
        supabase.from("competitors").select("*"),
      ]);
      setEntries((calRes.data||[]).map(calRowToEntry));
      setLogs((logRes.data||[]).map(logRowToLog));
      if(compRes.data&&compRes.data.length>0){setCompetitors(compRes.data.map(compRowToComp));}
      else{const seeded=COMPETITOR_SEED.map(c=>({...c,id:uid(),history:[]}));await supabase.from("competitors").insert(seeded.map(compToCompRow));setCompetitors(seeded);}
      setDataLoaded(true);
    })();
  },[session]);

  async function handleLogout(){await supabase.auth.signOut();setEntries([]);setLogs([]);setCompetitors([]);setDataLoaded(false);}
  async function addCalendarEntry(e){setEntries(p=>[...p,e]);await supabase.from("calendar_entries").insert(entryToCalRow(e));}
  async function toggleCalendarDone(id,done){setEntries(p=>p.map(e=>e.id===id?{...e,done}:e));await supabase.from("calendar_entries").update({done}).eq("id",id);}
  async function removeCalendarEntry(id){setEntries(p=>p.filter(e=>e.id!==id));await supabase.from("calendar_entries").delete().eq("id",id);}
  async function addLogEntry(l){setLogs(p=>[l,...p]);await supabase.from("ranking_logs").insert(logToLogRow(l));}
  async function removeLogEntry(id){setLogs(p=>p.filter(l=>l.id!==id));await supabase.from("ranking_logs").delete().eq("id",id);}
  async function addCompetitorEntry(c){setCompetitors(p=>[c,...p]);await supabase.from("competitors").insert(compToCompRow(c));}
  async function removeCompetitorEntry(id){setCompetitors(p=>p.filter(c=>c.id!==id));await supabase.from("competitors").delete().eq("id",id);}
  async function updateCompetitorEntry(id,updates){
    setCompetitors(p=>p.map(c=>c.id===id?{...c,...updates}:c));
    const row={};if("rating"in updates)row.rating=updates.rating;if("reviewCount"in updates)row.review_count=updates.reviewCount;if("history"in updates)row.history=updates.history;
    await supabase.from("competitors").update(row).eq("id",id);
  }

  if(authLoading)return <div className="app"><style>{CSS}</style><div className="loading-state"><Loader2 className="spin" size={20}/><span>Loading…</span></div></div>;
  if(!session)return <LoginScreen/>;

  return(
    <div className="app">
      <style>{CSS}</style>
      <Sidebar tab={tab} setTab={setTab} role={role} email={session.user.email} onLogout={handleLogout}/>
      <main className="main">
        {!dataLoaded?<div className="loading-state"><Loader2 className="spin" size={20}/><span>Loading your dashboard…</span></div>:(
          <>
            {tab==="calendar"&&<CalendarTab entries={entries} onAdd={addCalendarEntry} onToggleDone={toggleCalendarDone} onRemove={removeCalendarEntry}/>}
            {tab==="generator"&&<GeneratorTab/>}
            {tab==="stats"&&role==="admin"&&<BusinessStatsTab/>}
            {tab==="marketing"&&role==="admin"&&<MarketingTab/>}
            {tab==="goals"&&role==="admin"&&<GoalsTab/>}
            {tab==="tracker"&&role==="admin"&&<TrackerTab logs={logs} onAdd={addLogEntry} onRemove={removeLogEntry}/>}
            {tab==="competitors"&&role==="admin"&&<CompetitorsTab competitors={competitors} onAdd={addCompetitorEntry} onRemove={removeCompetitorEntry} onUpdate={updateCompetitorEntry}/>}
            {tab==="tasks"&&<StaffTasksTab role={role} userEmail={session.user.email}/>}
            {tab==="feedback"&&<FeedbackTab role={role} userEmail={session.user.email}/>}
          </>
        )}
      </main>
    </div>
  );
}

const CSS=`
:root{--bg:#FAF7F2;--ink:#2B2420;--clay:#A8765C;--sage:#5C6F5C;--surface:#FFFFFF;--line:#E8E1D6;--muted:#8B8275;}
*{box-sizing:border-box;}
.app{display:flex;min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;}
.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}
.loading-state{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:14px;padding:40px;}
.login-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;}
.login-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:36px;width:100%;max-width:380px;box-shadow:0 4px 24px rgba(0,0,0,0.06);}
.login-brand{display:flex;align-items:center;gap:12px;margin-bottom:24px;}
.login-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;margin:0 0 18px;}
.login-error{background:#FEF0EE;border:1px solid #F5C6C0;border-radius:8px;padding:10px 12px;font-size:13px;color:#C0392B;margin-bottom:14px;}
.login-btn{width:100%;justify-content:center;margin-top:18px;padding:12px;font-size:14px;}
.login-hint{font-size:11.5px;color:var(--muted);text-align:center;margin-top:14px;}
.sidebar{width:220px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:20px 14px;position:sticky;top:0;height:100vh;overflow-y:auto;}
.brand{display:flex;align-items:center;gap:10px;padding:0 6px 20px;}
.brand-mark{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--clay),#C99477);color:white;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:600;font-size:16px;}
.brand-name{font-family:'Fraunces',serif;font-size:14px;font-weight:600;line-height:1.2;}
.brand-sub{font-size:10px;color:var(--muted);}
.nav{display:flex;flex-direction:column;gap:1px;flex:1;}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 8px;border-radius:8px;background:none;border:none;cursor:pointer;color:var(--ink);font-size:13px;font-family:'Inter',sans-serif;text-align:left;transition:background 0.15s;}
.nav-item:hover{background:#F2ECE2;}
.nav-item.active{background:#F0E6DC;color:var(--clay);font-weight:600;}
.sidebar-foot{padding:10px 6px 0;border-top:1px solid var(--line);margin-top:8px;}
.user-info{display:flex;flex-direction:column;gap:3px;margin-bottom:8px;}
.user-email{font-size:10.5px;color:var(--muted);word-break:break-all;}
.role-tag{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;padding:2px 7px;border-radius:99px;width:fit-content;}
.role-tag.admin{color:var(--clay);background:#F0E6DC;}
.role-tag.staff{color:var(--sage);background:#EEF1EA;}
.logout-btn{display:flex;align-items:center;gap:6px;background:none;border:1px solid var(--line);border-radius:7px;padding:7px 10px;font-size:12px;color:var(--muted);cursor:pointer;width:100%;}
.logout-btn:hover{background:#F2ECE2;color:var(--ink);}
.main{flex:1;padding:32px 40px;max-width:1000px;overflow-x:hidden;}
.panel-head h1{font-family:'Fraunces',serif;font-size:24px;font-weight:600;margin:0 0 6px;letter-spacing:-0.01em;}
.panel-desc{color:var(--muted);font-size:13px;margin:0 0 22px;max-width:560px;line-height:1.5;}
.section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:var(--muted);margin:20px 0 10px;}
.glow-streak{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin-bottom:22px;}
.glow-streak-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.glow-label{font-size:12px;color:var(--muted);font-weight:500;}
.glow-pct{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:var(--clay);}
.glow-track{height:7px;background:#F0EAE0;border-radius:99px;overflow:hidden;}
.glow-fill{height:100%;background:linear-gradient(90deg,var(--sage),var(--clay));border-radius:99px;transition:width 0.4s ease;}
.glow-sub{font-size:11px;color:var(--muted);margin-top:6px;display:block;}
.week-nav{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.icon-btn{width:28px;height:28px;border-radius:7px;border:1px solid var(--line);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);}
.icon-btn:hover{background:#F2ECE2;}
.week-range{font-size:13px;font-weight:600;min-width:120px;}
.link-btn{background:none;border:none;color:var(--clay);font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px;}
.add-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
.select,.text-input{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:8px 10px;font-size:13px;font-family:'Inter',sans-serif;color:var(--ink);}
.select.narrow{width:90px;}
.narrow-mid{width:140px;flex:none;}
.text-input{flex:1;min-width:160px;}
.select:focus,.text-input:focus{outline:2px solid var(--clay);outline-offset:1px;}
.primary-btn{display:flex;align-items:center;gap:6px;background:var(--ink);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}
.primary-btn:hover{background:#46392F;}
.primary-btn:disabled{opacity:0.6;cursor:not-allowed;}
.primary-btn.small{padding:5px 10px;font-size:12px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;}
.cal-day{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px;min-height:140px;}
.cal-day.today{border-color:var(--clay);box-shadow:0 0 0 1px var(--clay);}
.cal-day-head{display:flex;justify-content:space-between;margin-bottom:6px;}
.cal-day-name{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;}
.cal-day-num{font-size:11px;font-weight:600;}
.cal-day-body{display:flex;flex-direction:column;gap:5px;}
.cal-empty{font-size:10px;color:#C9C1B3;}
.cal-card{display:flex;align-items:flex-start;gap:5px;background:#FBF8F3;border:1px solid var(--line);border-radius:7px;padding:5px 6px;}
.cal-card.done{opacity:0.5;}
.cal-check{width:14px;height:14px;border-radius:4px;border:1.5px solid var(--sage);background:var(--surface);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sage);padding:0;}
.cal-card.done .cal-check{background:var(--sage);color:white;}
.cal-card-body{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0;}
.cal-cat{font-size:9px;text-transform:uppercase;letter-spacing:0.03em;color:var(--clay);font-weight:700;}
.cal-title{font-size:11px;line-height:1.3;word-break:break-word;}
.cal-remove{background:none;border:none;color:#C9C1B3;cursor:pointer;padding:1px;flex-shrink:0;}
.cal-remove:hover{color:#B5544A;}
.seg-control{display:flex;gap:3px;background:#F0EAE0;padding:3px;border-radius:9px;width:fit-content;margin-bottom:18px;}
.seg-btn{border:none;background:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;}
.seg-btn.active{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,0.06);}
.gen-card{max-width:620px;}
.gen-controls{display:flex;gap:10px;margin-bottom:14px;}
.field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted);font-weight:600;flex:1;}
.output-box{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;position:relative;line-height:1.6;font-size:13.5px;}
.output-box p{margin:0;padding-right:70px;white-space:pre-line;}
.copy-btn{position:absolute;top:12px;right:12px;display:flex;align-items:center;gap:5px;background:var(--ink);color:white;border:none;border-radius:7px;padding:5px 9px;font-size:11px;font-weight:600;cursor:pointer;}
.hint{font-size:11px;color:var(--muted);margin-top:10px;line-height:1.5;}
.qa-list{display:flex;flex-direction:column;gap:10px;max-width:620px;}
.qa-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;position:relative;}
.qa-q{font-weight:600;font-size:13px;margin-bottom:5px;padding-right:70px;}
.qa-a{font-size:12.5px;color:#574E43;line-height:1.5;padding-right:12px;}
.qa-copy{top:12px;right:12px;}
.stat-row{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.stat-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;flex:1;min-width:120px;}
.stat-label{display:block;font-size:11px;color:var(--muted);font-weight:600;margin-bottom:4px;}
.stat-value{font-family:'Fraunces',serif;font-size:20px;font-weight:600;}
.rating-inline{display:flex;align-items:center;gap:4px;}
.tracker-add{align-items:stretch;}
.log-table{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.log-row{display:grid;grid-template-columns:100px 1fr 70px 80px 70px 28px;gap:8px;align-items:center;padding:9px 14px;font-size:12px;border-bottom:1px solid var(--line);}
.log-row:last-child{border-bottom:none;}
.log-head{background:#FBF8F3;font-weight:700;color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:0.02em;}
.empty-state{padding:20px 16px;color:var(--muted);font-size:13px;line-height:1.5;}
.comp-grid{display:flex;flex-direction:column;gap:8px;margin-top:14px;}
.comp-card{display:flex;align-items:flex-start;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px;position:relative;}
.comp-rank{font-family:'Fraunces',serif;font-weight:600;font-size:14px;color:var(--clay);min-width:26px;padding-top:2px;}
.comp-main{flex:1;min-width:0;}
.comp-name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;}
.comp-name{font-weight:600;font-size:13.5px;}
.comp-area-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.02em;background:#F0EAE0;color:var(--sage);padding:2px 7px;border-radius:99px;}
.comp-stats{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#574E43;margin-bottom:4px;}
.comp-stat{display:flex;align-items:center;gap:4px;}
.comp-update-btn{padding-left:0;font-size:11px;}
.comp-edit-row{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap;}
.comp-history{display:flex;flex-direction:column;gap:2px;margin-top:6px;}
.comp-history-item{font-size:10px;color:var(--muted);}
.comp-remove{position:absolute;top:12px;right:12px;}
.comp-hint{margin-top:16px;max-width:620px;}
.chart-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-bottom:18px;}
.chart-title{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.03em;margin-bottom:14px;}
.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
.bar-chart{display:flex;gap:8px;align-items:flex-end;height:100px;}
.bar-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.bar-outer{width:100%;height:80px;display:flex;align-items:flex-end;}
.bar-inner{width:100%;border-radius:4px 4px 0 0;min-height:4px;transition:height 0.3s ease;}
.bar-label{font-size:9px;color:var(--muted);text-align:center;}
.bar-val{font-size:9px;font-weight:700;color:var(--ink);}
.progress-wrap{display:flex;align-items:center;gap:10px;margin-top:8px;}
.progress-track{flex:1;height:8px;background:#F0EAE0;border-radius:99px;overflow:hidden;}
.progress-fill{height:100%;border-radius:99px;transition:width 0.4s ease;}
.progress-pct{font-size:12px;font-weight:700;min-width:36px;text-align:right;color:var(--ink);}
.goals-nav{display:flex;gap:10px;align-items:center;margin-bottom:20px;}
.goals-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;}
.goal-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;}
.goal-label{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.02em;margin-bottom:8px;}
.goal-numbers{display:flex;align-items:baseline;gap:6px;margin-bottom:2px;}
.goal-done{font-family:'Fraunces',serif;font-size:22px;font-weight:600;}
.goal-target{font-size:12px;color:var(--muted);}
.goals-edit{max-width:700px;}
.goals-edit-group{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px;}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:4px;}
.metrics-form{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;max-width:700px;margin-bottom:16px;}
.metrics-social{display:flex;gap:12px;margin-bottom:18px;}
.social-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 18px;flex:1;}
.social-head{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;margin-bottom:8px;color:var(--ink);}
.social-stats{display:flex;gap:16px;font-size:12.5px;color:#574E43;}
.task-group{margin-bottom:24px;}
.task-card{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:11px 14px;margin-bottom:6px;}
.task-card.done{opacity:0.55;}
.task-check{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--sage);background:var(--surface);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sage);padding:0;}
.task-card.done .task-check{background:var(--sage);color:white;}
.task-title{flex:1;font-size:13.5px;}
.task-by{font-size:11px;color:var(--sage);font-weight:600;}
.feedback-form{margin-bottom:16px;}
.feedback-textarea{resize:vertical;min-height:70px;width:100%;}
.feedback-list{display:flex;flex-direction:column;gap:10px;}
.feedback-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;}
.feedback-card.used{opacity:0.6;}
.feedback-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
.feedback-name{font-weight:700;font-size:13px;}
.used-tag{font-size:10px;font-weight:700;background:#EEF1EA;color:var(--sage);padding:2px 8px;border-radius:99px;text-transform:uppercase;}
.feedback-text{font-size:13.5px;color:#574E43;line-height:1.6;margin:0 0 10px;font-style:italic;}
.feedback-actions{display:flex;align-items:center;gap:8px;}
.feedback-copy{position:relative;top:auto;right:auto;}
@media(max-width:860px){
  .app{flex-direction:column;}
  .sidebar{width:100%;height:auto;position:relative;padding:12px 14px;}
  .nav{flex-direction:row;flex-wrap:wrap;}
  .main{padding:18px;}
  .cal-grid{grid-template-columns:repeat(2,1fr);}
  .log-row{grid-template-columns:80px 1fr 50px 60px 50px 24px;font-size:11px;}
  .goals-grid{grid-template-columns:1fr;}
  .charts-row{grid-template-columns:1fr;}
}
`;
