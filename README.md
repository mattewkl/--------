# Заметки

SPA-тетрадь на Nuxt 4: список заметок и редактор с todo, undo/redo и черновиками в `localStorage`.

## Локально

Нужны Node.js 22+ и npm.

```bash
npm install
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run typecheck
npm run build
```

## Docker

```bash
docker compose up --build
```

После сборки интерфейс доступен на [http://localhost:3000](http://localhost:3000).

Данные живут в `localStorage` браузера, не в контейнере.
