# Guia de Contribuição - Ecossistema Mucunã 🚀

Seja bem-vindo(a) ao projeto Mucunã! Este guia detalha como configurar seu ambiente de desenvolvimento para contribuir com o Sistema de Gestão Documentacional da UEFS.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js v22.x** (LTS recomendada)
- **Docker** e **Docker Compose**
- **Git**
- **VS Code** (Recomendado) com as extensões: *ESLint, Prettier e Prisma*.

---

## 🛠️ Configuração Inicial (Passo a Passo)

### 1. Clonar o Repositório
```bash
git clone https://github.com/manoel-roberto/mucuna.git
cd mucuna
```

### 2. Configurar Variáveis de Ambiente
O projeto utiliza um arquivo `.env` na raiz para centralizar as configurações principais.
```bash
cp .env.example .env
```
> **Nota**: No ambiente de desenvolvimento, os valores padrão do `.env.example` já estão configurados para funcionar com os containers Docker locais.

### 3. Instalar Dependências
Como utilizamos **NPM Workspaces**, instale tudo a partir da raiz:
```bash
npm install
```

---

## 🗄️ Banco de Dados e Prisma

O Mucunã utiliza **PostgreSQL** e **Prisma ORM**. Para subir o banco localmente:

### 1. Iniciar o Container do Postgres
```bash
docker compose up -d postgres
```
*Isso subirá o banco na porta `5434` (mapeada internamente para `5432`).*

### 2. Gerar o Prisma Client e rodar Migrations
```bash
# Na raiz do projeto
npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### 3. Criar Usuário Administrador (Seed)
```bash
cd apps/api
npx prisma db seed
```
*O login padrão será `admin@uefs.br` e a senha `SenhaForte123!` (configuráveis no `.env`).*

---

## 🚀 Executando a Aplicação

Você tem duas formas de rodar o projeto:

### Opção A: Modo Híbrido (Recomendado para Dev) ⚡
Nesta modalidade, o banco roda no Docker e as aplicações rodam direto na sua máquina. Isso garante *Hot Reload* mais rápido.

1. **Terminal 1 (Backend):**
   ```bash
   npm run dev --workspace=api
   ```
2. **Terminal 2 (Frontend):**
   ```bash
   npm run dev --workspace=web
   ```

### Opção B: Docker Full (Ideal para testes rápidos) 🐳
Roda todo o ecossistema dentro de containers (API, Web e DB).
```bash
docker compose up --build
```

---

## 📂 Estrutura do Monorepo

- `apps/api`: Backend NestJS. Porta padrão: `3001`.
- `apps/web`: Frontend Next.js. Porta padrão: `3000`.
- `apps/api/prisma`: Esquema do banco de dados e migrations.
- `apps/api/scripts`: Scripts úteis (ex: `test-db.js` para validar conexão).
- `uploads/`: Pasta local onde ficam os PDFs enviados (ignorada pelo Git).

---

## 🧪 Comandos Úteis

- **Prisma Studio**: `cd apps/api && npx prisma studio` (Visualize os dados pelo navegador).
- **Testar Conexão**: `node apps/api/scripts/test-db.js` (Verifica se o banco está alcançável).
- **Limpeza do Docker**: `docker system prune -f` (Use se ficar sem espaço em disco).

---

## 🤝 Padrões de Código
- **Commits**: Use mensagens claras e preferencialmente em português ou inglês técnico.
- **Clean Code**: Mantenha as funções pequenas e as variáveis autoexplicativas.
- **Prisma**: Sempre que alterar o `schema.prisma`, lembre-se de rodar `npx prisma generate`.

Vamos construir um sistema incrível para a UEFS! 🏁🎊
