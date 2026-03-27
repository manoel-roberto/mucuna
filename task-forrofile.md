# Task Forrofile

## Objetivo
Construir um sistema completo de gestão de documentação para a UEFS usando NestJS, Next.js, PostgreSQL e Docker, incluindo avaliação de documentos por funcionários e notificações por e-mail, num monorepo (ou estrutura similar de pacotes).

## Tarefas
- [x] Tarefa 1: Configurar Monorepo e Workspaces com `/apps/api` (NestJS) e `/apps/web` (Next.js) e configurar `docker-compose.yml` local. → Verify: `docker compose up` roda API e Web integrados ao Postgres.
- [x] Tarefa 2: Configurar Prisma ORM e modelar o banco de dados conforme especificação, incluindo status de avaliação no modelo `Envio` (Aprovado, Rejeitado) e seed do Administrador via `.env`. → Verify: `npx prisma migrate dev` roda sem erros.
- [x] Tarefa 3: Implementar autenticação (JWT) no NestJS com RBAC (Administrador, Operador, Candidato) e proteção de rotas. → Verify: Endpoint de Login retorna access_token adequado para a role correta.
- [x] Tarefa 4: Criar módulos essenciais da API (Editais, Notícias, Construtor de Formulários, Upload de Arquivos limitados a 10MB PDF). → Verify: Postman/Curl em `/api/noticias` e afins respondem 200 OK.
- [x] Tarefa 5: Desenvolver o envio de e-mails para convocação de candidatos e resposta de avaliação (Nodemailer). → Verify: E-mail de log ou mock de terminal indica o envio correto da convocação.
- [x] Tarefa 6: Implementar UI do Portal Público (Notícias, Lista de Editais) no Next.js (Tailwind). → Verify: Páginas públicas do frontend abrem no `/` sem erro de Build ou de Fetch.
- [x] Tarefa 7: Desenvolver Painel do Candidato no frontend (portal logado, visualização do status, formulário dinâmico e envio de dados/anexos). → Verify: Upload em base64 ou multipart enviado à API com retorno 201/OK.
- [x] Tarefa 8: Desenvolver Painel do Funcionário no frontend (Construtor de Formulários estilo Google Forms, listagem de candidatos, tela especial para avaliar e aprovar/rejeitar PDFs e formulários submetidos). → Verify: Alterar o status de um envio de "PENDENTE" para "APROVADO" funciona com retorno OK da API.
- [x] Tarefa 9: Ajustar Dockerfiles multi-estágio e `docker-compose.prod.yml` para produção, redigindo o `README.md` final em pt-BR. → Verify: `docker compose build` e subida da imagem passa sem travamento em dependências node.

## Conluído Quando
- [ ] O sistema estiver no ar, um candidato conseguir ser convocado por um administrador, preencher o seu cadastro, e ter a sua documentação aprovada ou rejeitada por um funcionário.
