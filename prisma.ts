import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
export async function GET(){
  const user=await requireUser(); requireRole(user,["manager"]);
  const members=await prisma.user.findMany({where:{managerId:user.employeeId,isActive:true},select:{employeeId:true,name:true,department:true,role:true},orderBy:{employeeId:"asc"}});
  return NextResponse.json(members);
}
