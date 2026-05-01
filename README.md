# 年度績效考核平台 MVP

這是一套可直接啟動的 Next.js + Prisma MVP，支援：

- 員工工號登入
- 密碼先採用 Excel 原始密碼（PASSWORD_MODE=plain）
- 員工只看自己的自評
- 主管只看直屬組員
- Admin 可看全公司彙整與匯出
- 部門 + 年度 + 版本化考核模板

## 目前已套用的規則

- 登入帳號：員工工號
- 評核主管：直屬主管
- Admin：LC0372 曾湘玲
- 年度：啟用 ACTIVE_REVIEW_YEAR，預設 2026
- 密碼：A 方案，開發階段直接使用 Excel 密碼

## 快速啟動

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run import:users -- data/權限帳號表_系統整理版.xlsx
npm run dev
```

開啟：

```text
http://localhost:3000
```

## 測試

```bash
npm run test
```

測試內容包含：

- 用主管姓名轉出 manager_id
- 自動判斷 manager 角色
- 指定 LC0372 為 admin

## 重要安全提醒

目前 `PASSWORD_MODE=plain` 是依照你的選擇用於開發與初版測試。正式上線前建議改成：

- 密碼雜湊
- 首次登入強制改密碼
- HTTPS
- JWT_SECRET 換成高強度密鑰

## 主要資料表

- User：帳號、部門、角色、主管關係
- ReviewTemplate：部門年度模板
- ReviewTemplateItem：模板項目
- Review：員工年度考核主檔
- ReviewItemScore：自評與主管評核分數/評語

## API

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/me
- GET /api/self-review
- PUT /api/self-review
- POST /api/self-review/submit
- GET /api/team
- GET /api/team-reviews/:employeeId
- PUT /api/team-reviews/:employeeId
- POST /api/team-reviews/:employeeId/submit
- GET /api/admin/reviews
- GET /api/admin/export
