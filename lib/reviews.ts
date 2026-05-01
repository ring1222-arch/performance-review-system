import { prisma } from "./prisma";

export const activeYear = Number(process.env.ACTIVE_REVIEW_YEAR || 2026);

export async function ensureReviewForEmployee(employeeId: string, year = activeYear) {
  const employee = await prisma.user.findUnique({ where: { employeeId } });
  if (!employee) throw new Error("Employee not found");
  let template = await prisma.reviewTemplate.findFirst({ where: { year, department: employee.department }, include: { items: true }, orderBy: { version: "desc" } });
  if (!template) template = await prisma.reviewTemplate.findFirst({ where: { year }, include: { items: true }, orderBy: { version: "desc" } });
  if (!template) throw new Error(`No review template for ${employee.department} ${year}`);
  return prisma.review.upsert({
    where: { year_employeeId: { year, employeeId } },
    update: {},
    create: { id: `${year}-${employeeId}`, year, employeeId, templateId: template.id },
    include: { employee: true, template: { include: { items: { orderBy: { sortOrder: "asc" } } } }, scores: { include: { templateItem: true } } },
  });
}

export function shapeReview(review: any, includeManager = false) {
  const self: Record<string, any> = {};
  const manager: Record<string, any> = {};
  for (const item of review.template.items) {
    const selfScore = review.scores.find((s: any) => s.templateItemId === item.id && s.reviewerType === "self");
    const managerScore = review.scores.find((s: any) => s.templateItemId === item.id && s.reviewerType === "manager");
    self[item.key] = { score: selfScore?.score ?? "", comment: selfScore?.comment ?? "" };
    if (includeManager) manager[item.key] = { score: managerScore?.score ?? "", comment: managerScore?.comment ?? "" };
  }
  return {
    id: review.id,
    year: review.year,
    status: review.status,
    employee: review.employee,
    template: review.template,
    self,
    selfSummary: review.selfSummary ?? "",
    ...(includeManager ? { manager, managerSummary: review.managerSummary ?? "" } : {}),
  };
}
