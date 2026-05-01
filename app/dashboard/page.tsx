"use client";
import { useEffect, useState } from "react";

type User={employeeId:string;name:string;role:string;department:string};

export default function Dashboard(){
  const [user,setUser]=useState<User|null>(null); const [data,setData]=useState<any>(null); const [team,setTeam]=useState<any[]>([]); const [selected,setSelected]=useState<string>("");
  useEffect(()=>{fetch("/api/me").then(r=>r.ok?r.json():location.assign("/")).then(u=>{if(u){setUser(u); if(u.role==="employee") loadSelf(); if(u.role==="manager") loadTeam(); if(u.role==="admin") loadAdmin();}})},[]);
  async function loadSelf(){setData(await (await fetch("/api/self-review")).json());}
  async function loadTeam(){const t=await (await fetch("/api/team")).json(); setTeam(t); if(t[0]) loadTeamReview(t[0].employeeId);}
  async function loadTeamReview(id:string){setSelected(id); setData(await (await fetch(`/api/team-reviews/${id}`)).json());}
  async function loadAdmin(){setData(await (await fetch("/api/admin/reviews")).json());}
  async function logout(){await fetch("/api/auth/logout",{method:"POST"}); location.href="/";}
  if(!user) return <main className="layout">載入中...</main>;
  return <main className="layout grid"><div className="row" style={{justifyContent:"space-between"}}><div><h1>年度績效考核平台</h1><div className="muted">{user.name}｜{user.role}｜{user.department}</div></div><button className="btn" onClick={logout}>登出</button></div>{user.role==="employee"&&data&&<SelfReview data={data} reload={loadSelf}/>} {user.role==="manager"&&<Manager team={team} selected={selected} choose={loadTeamReview} data={data}/>} {user.role==="admin"&&Array.isArray(data)&&<Admin reviews={data}/>}</main>
}

function scoreInputs(template:any,self:any,setSelf:any){return template.items.map((item:any)=><div className="card" key={item.id}><b>{item.label}</b><div className="muted">權重 {item.weight}%</div><input className="input" type="number" min="1" max="5" value={self[item.key]?.score||""} onChange={e=>setSelf({...self,[item.key]:{...self[item.key],score:e.target.value}})}/><textarea className="input" value={self[item.key]?.comment||""} onChange={e=>setSelf({...self,[item.key]:{...self[item.key],comment:e.target.value}})} /></div>)}
function SelfReview({data,reload}:{data:any;reload:()=>void}){const [self,setSelf]=useState(data.self);const [summary,setSummary]=useState(data.selfSummary||"");async function save(){await fetch("/api/self-review",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({self,selfSummary:summary})});reload()}async function submit(){await save();await fetch("/api/self-review/submit",{method:"POST"});reload()}return <section className="grid"><div className="card"><h2>我的自評</h2><span className="badge">{data.status}</span></div>{scoreInputs(data.template,self,setSelf)}<div className="card"><b>整體自評總結</b><textarea className="input" value={summary} onChange={e=>setSummary(e.target.value)}/><div className="row"><button className="btn" onClick={save} disabled={data.status!=="self_draft"}>儲存草稿</button><button className="btn" onClick={submit} disabled={data.status!=="self_draft"}>提交自評</button></div></div></section>}
function Manager({team,selected,choose,data}:any){return <section className="sidebar"><div className="card"><h2>整組組員</h2>{team.map((m:any)=><button className="input" key={m.employeeId} onClick={()=>choose(m.employeeId)} style={{marginBottom:8,textAlign:"left",background:selected===m.employeeId?"#f1f5f9":"white"}}>{m.name}<div className="muted">{m.employeeId}</div></button>)}</div><div className="card"><h2>主管評核</h2>{data?<pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(data,null,2)}</pre>:"請選擇組員"}</div></section>}
function Admin({reviews}:any){return <section className="card"><div className="row" style={{justifyContent:"space-between"}}><h2>全公司彙整</h2><a className="btn" href="/api/admin/export">匯出 CSV</a></div><table className="table"><thead><tr><th>部門</th><th>工號</th><th>姓名</th><th>狀態</th></tr></thead><tbody>{reviews.map((r:any)=><tr key={r.id}><td>{r.employee.department}</td><td>{r.employee.employeeId}</td><td>{r.employee.name}</td><td>{r.status}</td></tr>)}</tbody></table></section>}
