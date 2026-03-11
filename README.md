# Fast PDR Tools | Sistema de Chamados

Sistema interno de chamados construído com Next.js 14, Supabase, Tailwind CSS, shadcn/ui, TypeScript, Zod, React Hook Form e Zustand.

## Setup em 5 passos

1. Instale as dependências:
   `npm install`

2. Crie um projeto no Supabase e copie `.env.example` para `.env.local`:
   `copy .env.example .env.local`

3. Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`.

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
- `npm run lint`
- `npm run typecheck`
- `npm run build`
