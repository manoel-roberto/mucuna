# PLAN-merge-deploy-mucuna

Plano para a mesclagem dos branches e implantação no ambiente de produção ("Custo Zero" - Supabase, Vercel, Render).

## Contexto e Objetivo
Finalizar a transição para a marca Mucunã e o novo sistema de RBAC/CRUD, garantindo que o ambiente de produção reflita o estado atual do desenvolvimento sem interrupções.

---

## 🛠️ Fase 1: Verificação de Pré-Deploy (Local)

### 1.1 Verificação de Tipagem e Build
- **API (Render)**: Rodar `npm run build` em `apps/api`.
- **Web (Vercel)**: Rodar `npm run build` em `apps/web`.
- **Objetivo**: Garantir que as mudanças de schema e RBAC não quebrem a compilação.

### 1.2 Auditoria de Segurança e Env Vars
- Comparar o `.env` atual com as configurações nos painéis da Vercel e Render.
- Verificar se novas variáveis foram introduzidas (ex: `SUPER_ADMIN_PASSWORD`, novas roles, etc.).

---

## 💾 Fase 2: Banco de Dados (Supabase)

### 2.1 Migração de Schema
- Executar `npx prisma migrate deploy` apontando para a string de conexão do Supabase (produção).
- **Importante**: As migrações `add_rbac_system` e `add_perm_meta` são críticas para o funcionamento das novas telas.

### 2.2 Seed de Dados (Opcional)
- Verificar se é necessário rodar o seed em produção para popular as roles básicas e permissões.

---

## 🚀 Fase 3: Implantação e Mesclagem

### 3.1 Merge de Branches
- Checkout no `master`.
- Merge de `desenvolvimento` para `master`.
- Resolução de conflitos (se houver).

### 3.2 Push para GitHub
- `git push origin master`.
- **Gatilho**: Isso deve disparar o deploy automático na Vercel e Render (se configurados).

---

## ✅ Fase 4: Verificação Pós-Deploy

### 4.1 Teste de Sanidade (Health Check)
- Acessar a URL de produção.
- Tentar realizar login com um usuário administrativo.
- Testar o acesso às novas rotas CRUD administrativas (Certames, Cargos, etc.).

### 4.2 Monitoramento de Logs
- Acompanhar logs do Render para garantir que a API subiu sem erros de conexão com o banco.
- Verificar o console do navegador no portal da Vercel.

---

## 📝 Questões Socráticas (Aguardando Resposta)
1. **Migrations**: Posso rodar o `prisma migrate deploy` daqui agora mesmo no banco de produção?
2. **Auto-Deploy**: O GitHub ja está integrado com a Vercel e Render para disparar o deploy ao dar push no `master`?
3. **Env Vars**: Há novos segredos ou chaves AWS/Supabase que você adicionou localmente e que ainda não estão em produção?

---

## Próximos Passos
- Aguardar as respostas acima.
- Executar a Fase 1 (Build local).
- Proceder com a Fase 2 e 3 após aprovação.
