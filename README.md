# Dcapital

Онлайн сургалт байршуулж, худалдаж авах платформ — iOS Gen Z style.

## Асаах

```bash
npm install
npm run dev
```

Frontend + API хамт асна. Дараа нь [http://localhost:5173](http://localhost:5173) нээнэ.

`.env` файлд `MONGODB_URI` тавина (жишээ: `.env.example`).

## Бүтэц

- `/` — нүүр + сургалтын жагсаалт
- `/surgalt/:slug` — хичээлийн жагсаалт, видео, худалдан авалт
- `/admin` — админ панел (сургалт, ангилал, төлбөр)
