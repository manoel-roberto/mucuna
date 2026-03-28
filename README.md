# Mucunã (antigo forrofile)

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

1. Clone o repositório e renomei `.env.example` para `.env`.
2. Configure as variáveis de ambiente (E-mail, DB, Credentials).
3. Instale as dependências: `npm install`
4. Execute o Docker Compose:
```bash
docker compose up
```

## 🚢 Como Executar em Produção

Fornecemos Dockerfiles *multi-stage* otimizados e um orquestrador específico para ambiente de produção (rodando o NextJS Standalone).

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```
O banco de dados irá rodar automaticamente a migração inicial e a Seed de administrador.

## 🛠 Comandos Úteis

- `npm run dev --workspace=web`: Executar apenas o frontend web.
- `cd apps/api && npx prisma studio`: Explorar o banco de dados visualmente no modo dev.
