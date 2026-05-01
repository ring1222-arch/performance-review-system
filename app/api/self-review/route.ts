import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear, ensureReviewForEmployee, shapeReview } from "@/lib/reviews";

export async function GET(){
  const user=await requireUser(); requireRole(user,["employee"]);
  const review=await ensureReviewForEmployee(user.employeeId, activeYear);
  return NextResponse.json(shapeReview(review,false));
}

export async function PUT(req:Request){
  const user=await requireUser(); requireRole(user,["employee"]);
  const body=await req.json();
  const review=await ensureReviewForEmployee(user.employeeId, activeYear);
  if(review.status!=="self_draft") return NextResponse.json({error:"自評已提交，不能修改"},{status:409});
  await prisma.review.update({where:{id:review.id},data:{selfSummary:body.selfSummary ?? ""}});
  for(const item of review.template.items){
    const value=body.self?.[item.key];
    if(!value) continue;
    await prisma.reviewItemScore.upsert({
      where:{reviewId_templateItemId_reviewerType:{reviewId:review.id,templateItemId:item.id,reviewerType:"self"}},
      update:{score:Number(value.score)||null,comment:value.comment||""},
      create:{id:`${review.id}-${item.key}-self`,reviewId:review.id,templateItemId:item.id,reviewerType:"self",score:Number(value.score)||null,comment:value.comment||""}
    });
  }
  const updated=await prisma.review.findUniqueOrThrow({where:{id:review.id},include:{employee:true,template:{include:{items:{orderBy:{sortOrder:"asc"}}},},scores:{include:{templateItem:true}}}});
  return NextResponse.json(shapeReview(updated,false));
}
