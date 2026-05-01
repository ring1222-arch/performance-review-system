import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear, ensureReviewForEmployee, shapeReview } from "@/lib/reviews";

async function assertMember(managerId:string, employeeId:string){
  const member=await prisma.user.findFirst({where:{employeeId,managerId,isActive:true}});
  if(!member) throw new Response("Forbidden",{status:403});
}

export async function GET(_:Request,{params}:{params:{employeeId:string}}){
  const user=await requireUser(); requireRole(user,["manager"]); await assertMember(user.employeeId,params.employeeId);
  const review=await ensureReviewForEmployee(params.employeeId,activeYear);
  return NextResponse.json(shapeReview(review,true));
}

export async function PUT(req:Request,{params}:{params:{employeeId:string}}){
  const user=await requireUser(); requireRole(user,["manager"]); await assertMember(user.employeeId,params.employeeId);
  const body=await req.json();
  const review=await ensureReviewForEmployee(params.employeeId,activeYear);
  if(review.status==="self_draft") return NextResponse.json({error:"員工尚未提交自評"},{status:409});
  if(review.status==="completed") return NextResponse.json({error:"主管評核已完成，不能修改"},{status:409});
  await prisma.review.update({where:{id:review.id},data:{status:"manager_reviewing",managerSummary:body.managerSummary ?? ""}});
  for(const item of review.template.items){
    const value=body.manager?.[item.key];
    if(!value) continue;
    await prisma.reviewItemScore.upsert({
      where:{reviewId_templateItemId_reviewerType:{reviewId:review.id,templateItemId:item.id,reviewerType:"manager"}},
      update:{score:Number(value.score)||null,comment:value.comment||""},
      create:{id:`${review.id}-${item.key}-manager`,reviewId:review.id,templateItemId:item.id,reviewerType:"manager",score:Number(value.score)||null,comment:value.comment||""}
    });
  }
  return NextResponse.json({ok:true});
}
