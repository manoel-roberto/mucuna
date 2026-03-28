# Mucunã

Sistema de Gestão Documentacional para a Universidade Estadual de Feira de Santana. Desenvolvido para digitalizar a convocação e o envio/análise de documentações obrigatórias de candidatos aprovados em editais e processos seletivos.

## 🚀 Arquitetura
O projeto é um monorepo e inclui:
- **`apps/api`**: REST API construída com **NestJS**, autenticação JWT e Banco de Dados PostgreSQL ORM (**Prisma**).
- **`apps/web`**: Frontend moderno construído com **Next.js (App Router)** e **Tailwind CSS**.

## 💻 Funcionalidades
- Autenticação e Autorização baseada em Papéis (RBAC - Administrador, Operador, Candidato)
- Construtor de Formulários para avaliadores
- Disparos de e-mail de convocação via Nodemailer (Mock no Desenvolvimento)
- Área Restrita para acompanhamento da análise.
- Upload de documentos locais validados (apenas PDF de até 10MB)

## 🐳 Como Executar Localmente (Desenvolvimento)

Para configurar seu ambiente de desenvolvimento do zero, siga o nosso **[Guia de Contribuição (CONTRIBUTING.md)](./CONTRIBUTING.md)**.

### Resumo Rápido:
1.  Configure o `.env` (baseado no `.env.example`).
2.  Instale as dependências: `npm install`
3.  Suba o banco: `docker compose up -d postgres`
4.  Gere o Prisma: `npx prisma generate --schema=apps/api/prisma/schema.prisma`
5.  Inicie: `npm run dev` (em terminais separados para api e web).

## 🤝 Contribuição

Interessado em ajudar? Leia o **[Guia de Contribuição](./CONTRIBUTING.md)** para entender os padrões de código e o fluxo de trabalho.

## 🚢 Como Executar em Produção (Custo Zero)

Para colocar o sistema no ar gratuitamente em poucos minutos, siga o nosso **[Guia de Deploy Custo Zero (DEPLOY.md)](./DEPLOY.md)**.

### Resumo das Plataformas:
- **Banco**: Supabase (Postgres)
- **API**: Render (Node Service)
- **Web**: Vercel (Next.js)
### Outras Opções de Deploy:
- **[Deploy Custo Zero (Supabase + Render + Vercel)](./DEPLOY.md)**
- **[Deploy em Servidor Próprio (VPS/Bare Metal)](./DEPLOY_PROPRIO.md)**

O banco de dados irá rodar automaticamente a migração inicial e a Seed de administrador.

## 🛠 Comandos Úteis

- `npm run dev --workspace=web`: Executar apenas o frontend web.
- `cd apps/api && npx prisma studio`: Explorar o banco de dados visualmente no modo dev.

## ⚖️ Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes. Créditos ao autor original: **Manoel Roberto**.
