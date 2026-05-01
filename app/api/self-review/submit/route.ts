import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear, ensureReviewForEmployee } from "@/lib/reviews";
export async function POST(){
  const user=await requireUser(); requireRole(user,["employee"]);
  const review=await ensureReviewForEmployee(user.employeeId,activeYear);
  if(review.status!=="self_draft") return NextResponse.json({error:"Already submitted"},{status:409});
  await prisma.review.update({where:{id:review.id},data:{status:"self_submitted",selfSubmittedAt:new Date()}});
  return NextResponse.json({ok:true});
}
