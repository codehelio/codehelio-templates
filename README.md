# CodeHelio templates page

```bash
npm install
npm run dev     # http://localhost:3000
```

- Add/edit templates in `lib/templates.ts` (set each `demoUrl`).
- Apply popup + unique client code: `lib/apply.ts`.
- Applications are received in `app/api/apply/route.ts` (currently console.log; add email/DB there).
