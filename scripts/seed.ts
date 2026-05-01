import { prisma } from "../lib/prisma";

const templates = [
  { id: "default-2026-v1", year: 2026, department: "商標組", version: 1, name: "商標組 2026 年考核模板", items: [
    { key: "goal", label: "工作目標達成度", weight: 40, sortOrder: 1 },
    { key: "quality", label: "案件品質與正確性", weight: 25, sortOrder: 2 },
    { key: "teamwork", label: "團隊合作", weight: 20, sortOrder: 3 },
    { key: "growth", label: "成長學習", weight: 15, sortOrder: 4 },
  ]},
  { id: "general-2026-v1", year: 2026, department: "管理處", version: 1, name: "管理處 2026 年考核模板", items: [
    { key: "execution", label: "執行力", weight: 35, sortOrder: 1 },
    { key: "service", label: "內部服務品質", weight: 25, sortOrder: 2 },
    { key: "accuracy", label: "作業正確性", weight: 20, sortOrder: 3 },
    { key: "growth", label: "成長學習", weight: 20, sortOrder: 4 },
  ]},
];

async function main() {
  await prisma.user.upsert({ where: { employeeId: "LC0372" }, update: {}, create: { employeeId: "LC0372", username: "LC0372", password: "demo", name: "曾湘玲", department: "管理處", role: "admin", isActive: true } });
  for (const t of templates) {
    await prisma.reviewTemplate.upsert({ where: { id: t.id }, update: { name: t.name }, create: { id: t.id, year: t.year, department: t.department, version: t.version, name: t.name } });
    for (const item of t.items) {
      await prisma.reviewTemplateItem.upsert({
        where: { templateId_key: { templateId: t.id, key: item.key } },
        update: item,
        create: { id: `${t.id}-${item.key}`, templateId: t.id, ...item },
      });
    }
  }
}
main().finally(async () => prisma.$disconnect());
