# Guia de Deploy em Infraestrutura Própria 🏢🚀

Este guia detalha como realizar o deploy do Mucunã em servidores próprios (VPS, Dedicados ou On-premise), separando a camada de aplicação da camada de banco de dados.

## 🏗️ Arquitetura Sugerida

- **Servidor A (Aplicação)**: Hospeda a API (NestJS) e o Portal Web (Next.js).
- **Servidor B (Banco de Dados)**: Instância isolada de PostgreSQL 15+.

---

## 1. 🗄️ Preparação do Banco de Dados (Servidor B)

Se você estiver instalando o PostgreSQL manualmente em um Linux (Ubuntu/Debian):

1. **Instalar Postgres**: `sudo apt install postgresql`
2. **Configurar acesso externo**: No arquivo `/etc/postgresql/[versao]/main/postgresql.conf`, altere:
   ```conf
   listen_addresses = '*'
   ```
3. **Liberar o IP da Aplicação**: No arquivo `/etc/postgresql/[versao]/main/pg_hba.conf`, adicione:
   ```conf
   host    all             all             [IP_DO_SERVIDOR_A]/32        md5
   ```
4. **Criar Banco e Usuário**:
   ```sql
   CREATE DATABASE mucuna;
   CREATE USER mucuna_user WITH PASSWORD 'SuaSenhaSegura';
   GRANT ALL PRIVILEGES ON DATABASE mucuna TO mucuna_user;
   ```
5. **Reiniciar**: `sudo systemctl restart postgresql`

---

## 2. 🚀 Configuração do Servidor de Aplicação (Servidor A)

### Pré-requisitos
```bash
# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar gerenciador de processos
sudo npm install -g pm2
```

### Deploy do Código
1. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/manoel-roberto/mucuna.git
   cd mucuna
   npm install
   ```
2. Configure o `.env` com a URL do Servidor B:
   ```bash
   DATABASE_URL="postgresql://mucuna_user:SuaSenhaSegura@[IP_DO_SERVIDOR_B]:5432/mucuna"
   ```

### Iniciando a API (Backend)
```bash
npm run build --workspace=api
pm2 start dist/apps/api/src/main.js --name "mucuna-api"
```

### Iniciando o Web (Frontend)
O projeto está configurado para o modo **standalone** do Next.js para melhor performance.
```bash
npm run build --workspace=web
# O build gera a pasta apps/web/.next/standalone
pm2 start apps/web/.next/standalone/server.js --name "mucuna-web" -- --port 3000
```

---

## 🔒 3. Segurança e Proxy Reverso (Nginx)

Recomendamos usar o Nginx para lidar com SSL (HTTPS).

1. **Instalar Nginx**: `sudo apt install nginx`
2. **Configuração do Site** (`/etc/nginx/sites-available/mucuna`):
   ```nginx
   server {
       server_name api.seudominio.com;
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
       }
   }
   server {
       server_name portal.seudominio.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
       }
   }
   ```
3. **SSL**: Use o [Certbot](https://certbot.eff.org/) para gerar certificados gratuitos Let's Encrypt.

---

## 📋 Checklist de Saúde
- ✅ Firewall (UFW) liberando apenas portas 80, 443 e SSH no Servidor A.
- ✅ Backup automático do PostgreSQL no Servidor B.
- ✅ Logs monitorados via `pm2 logs`.

O sistema está agora configurado em uma estrutura profissional e resiliente! 🏁🏛️
