# 🧠 Cursor Dev Guide for Smart POS Project

Welcome! This file contains **must-read** development principles and architecture for the Smart POS system powered by Cloudflare, AI, and Gamification.

---

## ✅ Guidelines for ALL Cursor-generated Code

1. **Max 300 lines per chunk**
   - Always write one part per step
   - If the file is long, name it: `ComponentName.jsx – Step 1`, `Step 2`, etc.

2. **Follow folder structure strictly**
   - All admin pages go under: `client/src/pages/admin/<Subfolder>/`
   - Components go into: `client/src/components/`
   - API calls must use services in `client/src/services/`
   - Common styles in `client/src/styles/`

3. **Use these tools by default**
   - React 18 + Tailwind CSS
   - Hooks like: `useAuth`, `usePermissions`, `useAI`, `useGameification`
   - UI components from: `components/ui/`
   - Charts: use `Charts/` from components
   - Forms: use reusable `Forms/` components

---

## 🏗️ Structure Sample

A typical admin page should include:

1. 📦 Layout and sections
2. 📡 API fetch logic from `/services/`
3. 📊 Use `DataTable`, `Charts`, or `Modals` where needed
4. 🔁 Use context from `/context/` if needed
5. 🧩 Extra logic (e.g. calculations) → put into `utils/` or `hooks/`

---

## 🔐 Role-based UI Logic

```js
// Wrap with permission logic
<RoleBasedAccess role="admin">
  <AdminLayout>
    <Component />
  </AdminLayout>
</RoleBasedAccess>
