import assert from "node:assert/strict";

type User = { employeeId: string; name: string; directManagerName?: string; managerId?: string; role?: string };
const raw: User[] = [
  { employeeId: "LC001", name: "員工A", directManagerName: "主管B" },
  { employeeId: "LC002", name: "主管B", directManagerName: "總管C" },
  { employeeId: "LC0372", name: "曾湘玲" },
];
function deriveUsers(rows: User[], adminIds = new Set(["LC0372"])) {
  const nameToId = new Map(rows.map((r) => [r.name, r.employeeId]));
  const managerIds = new Set<string>();
  const withManagerId = rows.map((r) => {
    const managerId = r.directManagerName ? nameToId.get(r.directManagerName) : undefined;
    if (managerId) managerIds.add(managerId);
    return { ...r, managerId };
  });
  return withManagerId.map((r) => ({ ...r, role: adminIds.has(r.employeeId) ? "admin" : managerIds.has(r.employeeId) ? "manager" : "employee" }));
}
const users = deriveUsers(raw);
assert.equal(users.find((u) => u.employeeId === "LC001")?.managerId, "LC002");
assert.equal(users.find((u) => u.employeeId === "LC002")?.role, "manager");
assert.equal(users.find((u) => u.employeeId === "LC0372")?.role, "admin");
console.log("All rule tests passed");
