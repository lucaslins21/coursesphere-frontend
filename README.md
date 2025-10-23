# CourseSphere — v2 Plus
- API CommonJS (`json-server@0.17.4`)
- Web com **paginação** nas aulas e **CourseForm** (criar/editar) com validação `end_date > start_date`.

## Rodar
# 1) API
cd api
npm i
npm run start

# 2) Web
cd ../apps/web
npm i
cp .env.example .env
npm run dev


## Observação (Windows / acentuação)
- Se ao visualizar arquivos no terminal aparecerem caracteres estranhos (�, ??), é apenas a codificação do console.
- O projeto está salvo em UTF‑8. Para ver corretamente no PowerShell:
  - Execute: `chcp 65001`
  - E opcionalmente: `$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
- Em editores (VS Code, etc.), garanta que a codificação esteja como `UTF-8`.





