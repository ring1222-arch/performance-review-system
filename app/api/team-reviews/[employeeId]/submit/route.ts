import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear, ensureReviewForEmployee } from "@/lib/reviews";
export async function POST(_:Request,{params}:{params:{employeeId:string}}){
  const user=await requireUser(); requireRole(user,["manager"]);
  const member=await prisma.user.findFirst({where:{employeeId:params.employeeId,managerId:user.employeeId,isActive:true}});
  if(!member) return NextResponse.json({error:"Forbidden"},{status:403});
  const review=await ensureReviewForEmployee(params.employeeId,activeYear);
  if(review.status==="self_draft") return NextResponse.json({error:"員工尚未提交自評"},{status:409});
  await prisma.review.update({where:{id:review.id},data:{status:"completed",managerSubmittedAt:new Date()}});
  return NextResponse.json({ok:true});
}
