import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear, shapeReview } from "@/lib/reviews";
export async function GET(){
  const user=await requireUser(); requireRole(user,["admin"]);
  const reviews=await prisma.review.findMany({where:{year:activeYear},include:{employee:true,template:{include:{items:{orderBy:{sortOrder:"asc"}}}},scores:{include:{templateItem:true}}},orderBy:{employeeId:"asc"}});
  return NextResponse.json(reviews.map(r=>shapeReview(r,true)));
}
