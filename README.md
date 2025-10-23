# CourseSphere — Front‑end

Aplicação web para gestão colaborativa de cursos e aulas. Feita em React (Vite + TS) com uma API mock (json‑server).

- Demo (deploy): https://coursesphere-frontend.vercel.app/login
- Documento do desafio: `docs/desafio-frontend.md`

## Sumário
- Visão geral e funcionalidades
- Estrutura do projeto
- Como rodar localmente (API + Web)
- Variáveis de ambiente e build
- Fluxos adicionais implementados (convites etc.)
- Design System (toasts, popups, navbar, formulários)
- Dicas de deploy (Vercel)

## Visão geral e funcionalidades
Atende às regras e telas descritas no desafio, com alguns aprimoramentos.

- Autenticação (login e cadastro)
- Dashboard com cards de cursos e botão “Criar curso”
- Detalhes do curso: descrição, período, lista de instrutores, grade de aulas
- Aulas: paginação, busca por título, filtro por status, ações de editar/excluir
- Formulários de criar/editar curso e aula com validações via Zod
- Permissões: criador do curso gerencia curso/instrutores; criador da aula pode editar/excluir a própria aula
- Convites de instrutor: criador convida, convidado aceita (fluxo descrito abaixo)

Extras implementados
- UI modernizada (cards “glass”, gradientes, navbar minimalista)
- Toasts de feedback (sucesso/erro/info)
- Popup de confirmação para ações críticas (excluir, sair, sair sem salvar)
- Inputs com ícones, datas com calendário clicável (FA + showPicker)

## Estrutura

```
api/                # json-server (CommonJS)
apps/web/           # Front-end Vite + React + TS
  src/
    app/            # router
    auth/           # contexto de auth
    components/     # ui, form, media, layout, feedback
    features/       # courses, lessons
    pages/          # login, register, invitations
    lib/axios.ts    # cliente HTTP c/ VITE_API_URL
    env.d.ts        # tipos do Vite
  index.html
  vercel.json       # rewrites SPA (deploy)
```

## Como rodar localmente
Pré‑requisitos: Node 18+ e npm.

1) API (json‑server)
```
cd api
npm i
npm run start   # sobe em http://localhost:3333
```

2) Web (Vite)
```
cd ../apps/web
npm i
cp .env.example .env   # VITE_API_URL=http://localhost:3333
npm run dev            # http://localhost:5173
```

Credenciais de exemplo (api/db.json)
- Email: `ana@curso.com`  Senha: `123456`
- Email: `bruno@curso.com`  Senha: `123456`
- Email: `admin@curso.com`  Senha: `123456`

## Variáveis de ambiente e build

- `VITE_API_URL`: URL da API (ex.: http://localhost:3333). Em produção, usei https://coursesphere-api-ao7j.onrender.com

Build local (gera `dist/`):
```
cd apps/web
npm run build
```

## Fluxos adicionais implementados

### Convites de instrutor
- Tela “Convites” (rota protegida) lista convites pendentes para o email logado.
- O criador do curso envia convites na seção “Gerenciamento do curso”.
- O convidado precisa aceitar o convite (para evitar manipular diretamente instrutores sugeridos).
- API externa `randomuser.me` usada para “Sugerir instrutor” (gera um usuário de teste quando necessário).

### Cadastro
- Formulário com validação (nome, email único, senha mínima).
- Erros do backend exibidos inline nos inputs (sem alert).

### Popups de confirmação
- Ações críticas (excluir curso/aula, remover instrutor, sair, sair sem salvar) usam um modal consistente com a UI, sem bloquear navegação.

## Design System aplicado
- Navbar com logo à esquerda, ícones à direita (convites, usuário, sair).
- Cards e formulários com “glass/gradient”, ícones de ação e estados.
- Toasts modernos (ícone, barra de progresso) e modal de confirmação com overlay.
- Campos de data com ícone de calendário clicável (abre o picker nativo).

## Endpoints relevantes (mock)
- `POST /login` → retorna `{ token, user }`
- `POST /register` → valida e cria novo usuário
- `GET /courses`, `GET /courses/:id`
- `GET/POST/PATCH/DELETE /lessons`
- `POST /invitations` (criar), `POST /invitations/:id/accept`, `POST /invitations/:id/decline`

