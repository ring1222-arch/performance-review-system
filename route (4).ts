import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = process.env.PASSWORD_MODE === "plain" ? user.password === password : await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = await createToken({ employeeId: user.employeeId, username: user.username, name: user.name, role: user.role, department: user.department });
  const res = NextResponse.json({ ok: true, user: { employeeId: user.employeeId, name: user.name, role: user.role } });
  res.cookies.set("pr_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}
