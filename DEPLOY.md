# Guia de Deploy Custo Zero - Mucunã 🌥️💰

Este guia descreve como colocar o sistema Mucunã no ar utilizando apenas planos gratuitos (**Free Tiers**) de plataformas de nuvem modernas.

## 🏗️ Arquitetura do Deploy

- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL Grátis)
- **API (Backend)**: [Render](https://render.com/) (Web Service Grátis)
- **Web (Frontend)**: [Vercel](https://vercel.com/) (Hospedagem Next.js Grátis)

---

## 1. 🗄️ Banco de Dados (Supabase)

1.  Crie uma conta no [Supabase](https://supabase.com/).
2.  Crie um novo projeto chamado `mucuna-db`.
3.  Vá em **Project Settings** > **Database**.
4.  Procure pela **Connection String** e selecione a aba **URI**.
5.  Utilize o modo **Transaction** (porta 6543) ou **Session** (porta 5432).
    - Exemplo de URL: `postgresql://postgres.[SEU_ID]:[SENHA]@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
    - *Certifique-se de substituir `[SENHA]` pela senha que você criou.*

---

## 2. 🚀 Backend API (Render)

1.  Crie uma conta no [Render](https://render.com/) e conecte seu GitHub.
2.  Crie um novo **Web Service**.
3.  Selecione o repositório `mucuna`.
4.  **Configurações Importantes**:
    - **Runtime**: `Node`
    - **Build Command**: `npm install && npm run build --workspace=api`
    - **Start Command**: `npm run start --workspace=api`
    - **Plan**: `Free`
5.  **Environment Variables**:
    - `DATABASE_URL`: A URL do Supabase obtida no passo 1.
    - `JWT_SECRET`: Uma chave secreta longa e aleatória.
    - `NODE_ENV`: `production`

> **Nota**: No plano Free do Render, a API "dorme" após 15 minutos de inatividade. O primeiro acesso após esse tempo pode levar cerca de 50 segundos para carregar (Cold Start).

---

## 3. 🖥️ Frontend Web (Vercel)

1.  Crie uma conta na [Vercel](https://vercel.com/) e conecte seu GitHub.
2.  Importe o repositório `mucuna`.
3.  **Configurações de Projeto**:
    - **Framework Preset**: `Next.js`
    - **Root Directory**: `apps/web` (Importante!)
4.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: A URL da sua API no Render (ex: `https://mucuna-api.onrender.com`).
5.  Clique em **Deploy**.

---

## 🔧 Manutenção e Sincronização do Banco

Sempre que houver mudanças no banco de dados (`schema.prisma`), você deve rodar localmente:
```bash
# Sincroniza o banco remoto com seu schema local
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```
O Render detectará o novo código via Git e fará o rebuild automaticamente.

---

## 💡 Dicas de Sucesso

- **SSL no Supabase**: O Mucunã já está configurado para usar SSL automaticamente em produção.
- **Prisma v7**: O projeto usa `Prisma Driver Adapters` para garantir que a conexão com o Supabase seja estável e não estoure o limite de conexões do plano free.

Parabéns! Seu sistema está no ar com **custo zero**! 🏁🚀
