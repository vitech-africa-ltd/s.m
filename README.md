# VITECH School Management System

Complete School Management ERP / SaaS — students, teachers, attendance, grades, fees, communication and school operations from one platform.

## Deploy on Vercel

The repository already contains `vercel.json` and `.nvmrc`, so a standard import works. If you see the Vercel error page, check these project settings in the Vercel dashboard (**Project → Settings → General / Build**):

| Setting | Value |
|---|---|
| Framework Preset | **Vite** |
| Root Directory | *(empty)* |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | **20.x** (set automatically by `.nvmrc`) |

Then click **Deployments → ⋯ → Redeploy** (uncheck "Use existing Build Cache" the first time).

## Accounts (demo)

Password for every demo account: `demo1234`

- `admin@vitech.academy` (2FA code: `123456`)
- `teacher@vitech.academy`, `student@vitech.academy`, `parent@vitech.academy`, `finance@vitech.academy`, `super@vitech.school` …

## Local development

```bash
npm install
npm run dev
```
