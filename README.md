# Dcapital

Онлайн сургалт байршуулж, худалдаж авах платформ — iOS Gen Z style.

## Асаах

```bash
npm install
npm run dev
```

Frontend + API хамт асна. Дараа нь [http://localhost:5173](http://localhost:5173) нээнэ.

`.env` файлд `MONGODB_URI` тавина (жишээ: `.env.example`).

## Vercel deploy

1. GitHub руу push хийнэ
2. Vercel → Project → **Settings → Environment Variables**:
   - `MONGODB_URI` = Atlas connection string
   - `JWT_SECRET` = урт нууц тэмдэгт
   - `ADMIN_PHONE` / `ADMIN_PASSWORD` (заавал биш)
3. Atlas → **Network Access** → `0.0.0.0/0` (Allow from anywhere)
4. Redeploy

SPA refresh 404 болон `/api` API энэ `vercel.json`-оор шийдэгдэнэ.

## Бүтэц

- `/` — нүүр + сургалтын жагсаалт
- `/surgalt/:slug` — хичээлийн жагсаалт, видео, худалдан авалт
- `/admin` — админ панел (сургалт, ангилал, төлбөр)
- `/api/*` — Express API (локал :4000, Vercel serverless)
