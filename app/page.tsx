"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  async function login(e:React.FormEvent){
    e.preventDefault(); setError("");
    const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
    if(res.ok) location.href="/dashboard"; else setError("登入失敗，請確認工號與密碼");
  }
  return <main className="layout" style={{maxWidth:480}}><div className="card"><h1>年度績效考核平台</h1><p className="muted">請使用員工工號登入。</p><form onSubmit={login} className="grid"><input className="input" placeholder="員工工號" value={username} onChange={e=>setUsername(e.target.value)}/><input className="input" placeholder="密碼" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<div style={{color:"#dc2626"}}>{error}</div>}<button className="btn">登入</button></form></div></main>
}
