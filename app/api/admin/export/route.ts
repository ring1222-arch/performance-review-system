import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { activeYear } from "@/lib/reviews";
export async function GET(){
  const user=await requireUser(); requireRole(user,["admin"]);
  const reviews=await prisma.review.findMany({where:{year:activeYear},include:{employee:true,template:{include:{items:{orderBy:{sortOrder:"asc"}}}},scores:{include:{templateItem:true}}},orderBy:{employeeId:"asc"}});
  const rows=["年度,部門,工號,姓名,狀態,自評總結,主管總評"];
  for(const r of reviews){rows.push([r.year,r.employee.department,r.employeeId,r.employee.name,r.status,r.selfSummary||"",r.managerSummary||""].map(v=>`"${String(v).replaceAll('"','""')}"`).join(","));}
  return new Response("\uFEFF"+rows.join("\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=reviews.csv"}});
}
