import { readFile, utils } from "xlsx";
import { prisma } from "../lib/prisma";

const filePath = process.argv[2] || "data/權限帳號表_系統整理版.xlsx";
const adminIds = new Set(["LC0372"]);

function str(v: unknown) { return String(v ?? "").trim(); }

async function main() {
  const wb = readFile(filePath);
  const ws = wb.Sheets["users_系統匯入版"] || wb.Sheets[wb.SheetNames[0]];
  const rows = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  for (const row of rows) {
    const employeeId = str(row.employee_id || row["員工工號"]);
    if (!employeeId) continue;
    const role = adminIds.has(employeeId) ? "admin" : str(row.role || "employee");
    await prisma.user.upsert({
      where: { employeeId },
      update: {
        username: str(row.username || employeeId),
        password: str(row.initial_password || row["密碼"] || row.password),
        name: str(row.name || row["姓名"] || row["員工姓名"]),
        department: str(row.department || row["部門名稱"]),
        managerId: str(row.manager_id || row["直屬主管工號"]) || null,
        role: role as any,
        isActive: str(row.is_active || "true") !== "false",
      },
      create: {
        employeeId,
        username: str(row.username || employeeId),
        password: str(row.initial_password || row["密碼"] || row.password),
        name: str(row.name || row["姓名"] || row["員工姓名"]),
        department: str(row.department || row["部門名稱"]),
        managerId: str(row.manager_id || row["直屬主管工號"]) || null,
        role: role as any,
        isActive: str(row.is_active || "true") !== "false",
      },
    });
  }
  console.log(`Imported ${rows.length} rows from ${filePath}`);
}

main().finally(async () => prisma.$disconnect());
