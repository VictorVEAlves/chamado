# Fast PDR Tools | Sistema de Chamados

Sistema interno de chamados construído com Next.js 14, Supabase, Tailwind CSS, shadcn/ui, TypeScript, Zod, React Hook Form e Zustand.

## Setup em 5 passos

1. Instale as dependências:
   `npm install`

2. Crie um projeto no Supabase e copie `.env.example` para `.env.local`:
   `copy .env.example .env.local`

3. Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`.
   Para integrar tickets de marketing ao ClickUp, configure tambem `NEXT_PUBLIC_APP_URL`, `CLICKUP_API_TOKEN` e `CLICKUP_MARKETING_LIST_ID`.
   Em producao, `NEXT_PUBLIC_APP_URL` deve apontar para o dominio publico do sistema.

4. Execute todo o conteúdo de [`schema.sql`](/C:/Users/marke/Desktop/sistemas/chamado/schema.sql) no SQL Editor do Supabase.

5. Cadastre o primeiro usuário em `/register`, promova-o manualmente para admin e então rode:
   `npm run dev`

## Promover o primeiro admin

Depois do primeiro cadastro, execute:

```sql
update profiles
set role = 'admin'
where id = '<UUID_DO_USUARIO>';
```

## Scripts

- `npm run dev`
- `npm run dev:turbo`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run perf:measure`
- `npm run perf:warm`

## Diagnostico de lentidao local

No ambiente `npm run dev`, a primeira navegacao pode ficar mais lenta por compilacao sob demanda do Next.js. Isso nao deve ser usado como referencia de performance final.

Use:

- `npm run dev:turbo` para comparar a experiencia local com Turbopack.
- `npm run perf:warm` para aquecer as rotas mais comuns antes de testar manualmente.
- `npm run perf:measure` para medir a primeira e a segunda resposta das rotas padrao.
- `node scripts/measure-routes.mjs http://localhost:3000 /login /register` para medir rotas especificas.

Para medir rotas protegidas autenticadas, passe o cookie da sessao:

```powershell
$env:PERF_COOKIE = "sb-access-token=...; sb-refresh-token=..."
npm run perf:measure
```

Para validar performance real, use `npm run build` seguido de `npm run start` e compare os tempos com o ambiente de desenvolvimento.

## Integracao ClickUp

Tickets criados com `department = marketing` tentam criar automaticamente uma task no ClickUp da lista configurada.

- A integracao e best-effort: falha no ClickUp nao bloqueia a criacao do chamado.
- Ela vale apenas para novos tickets de marketing.
- Se `CLICKUP_API_TOKEN` ou `CLICKUP_MARKETING_LIST_ID` nao estiverem configurados, o sistema apenas registra um warning no servidor e segue normalmente.
- Em ambiente Vercel, se `NEXT_PUBLIC_APP_URL` estiver ausente ou ainda em `localhost`, o sistema tenta usar o dominio da propria implantacao como fallback.
