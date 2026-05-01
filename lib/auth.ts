import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
export type SessionUser = { employeeId: string; username: string; name: string; role: "employee" | "manager" | "admin"; department: string };

export async function createToken(user: SessionUser) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get("pr_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSessionUser();
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user || !user.isActive) throw new Response("Unauthorized", { status: 401 });
  return session;
}

export function requireRole(user: SessionUser, roles: SessionUser["role"][]) {
  if (!roles.includes(user.role)) throw new Response("Forbidden", { status: 403 });
}
