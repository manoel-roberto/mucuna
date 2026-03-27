# Prompt — UEFS DocManager
> Cole este conteúdo no Antigravity e execute `/create`

---

```
/create
```

Crie uma aplicação web completa chamada **UEFS DocManager** — sistema de recebimento e gestão de documentação para a **UEFS (Universidade Estadual de Feira de Santana)**, utilizado pelo setor de recebimento de documentos para gerenciar a documentação de candidatos aprovados em concursos públicos e processos seletivos.

> ⚠️ **IDIOMA OBRIGATÓRIO:** Toda a aplicação — interface, mensagens, labels, textos de erro, notificações, comentários no código, seeds do banco de dados, README e toda documentação — deve estar **exclusivamente em Português do Brasil (pt-BR)**. Não utilizar inglês em nenhuma parte visível ao usuário.

---

## STACK TECNOLÓGICA (obrigatória)

- **Backend:** Node.js com NestJS (API REST)
- **Frontend:** Next.js 14+ com TypeScript e Tailwind CSS
- **Banco de dados:** PostgreSQL (via Prisma ORM)
- **Autenticação:** JWT com refresh tokens e controle de acesso baseado em papéis (RBAC)
- **Armazenamento de arquivos:** Sistema de arquivos local com volume montado (compatível com Docker), suportando uploads de PDF com no máximo 10MB por arquivo
- **Containerização:** Docker + Docker Compose (deve rodar localmente e em pipelines de CI/CD)
- **Configuração:** Arquivo `.env` para todas as variáveis de ambiente

---

## ESTRUTURA DO PROJETO

Monorepo com dois workspaces:

- `/apps/api` — Backend NestJS
- `/apps/web` — Frontend Next.js
- `docker-compose.yml` na raiz (desenvolvimento local)
- `docker-compose.prod.yml` na raiz (produção/pipeline CI)
- `Dockerfile` dentro de cada app
- `.env.example` na raiz com todas as variáveis documentadas em português

---

## VARIÁVEIS DE AMBIENTE (.env)

```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/uefs_docmanager

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Aplicação
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Upload de Arquivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

---

## PERFIS DE USUÁRIO

Dois tipos distintos de usuário com fluxos de autenticação separados:

**1. FUNCIONÁRIO** — servidores da universidade responsáveis pelo recebimento de documentação  
**2. CANDIDATO** — aprovados no processo seletivo que enviam seus documentos

---

## MÓDULO 1 — PÁGINA INICIAL PÚBLICA

Site institucional público (sem necessidade de login) com:

- Cabeçalho com identidade visual da UEFS e área para logotipo
- **Seção de Notícias:** cards dinâmicos com avisos e informações institucionais (gerenciados pelos funcionários)
- **Seção de Processos Seletivos Ativos:** cards para cada edital ativo, exibindo título, descrição, período de convocação e botão de ação
- **Seção Informativa:** páginas com orientações sobre o processo de envio de documentação, perguntas frequentes e contatos
- **CTA de Cadastro de Candidatos:** botão/seção destacada convidando candidatos aprovados a criar uma conta
- **Menu de Navegação:** Início, Processos Seletivos, Informações, Notícias, Entrar (login)
- Layout totalmente responsivo

---

## MÓDULO 2 — AUTENTICAÇÃO

- **Autocadastro de Candidatos:** formulário com nome completo, CPF (validado no formato brasileiro), e-mail, senha e telefone
- **Login de Funcionários apenas** (sem autocadastro — contas criadas por administrador)
- **Página de Login** com detecção automática do perfil (redirecionamento ao painel correto após login)
- Estratégia de access token + refresh token JWT
- Rotas protegidas por perfil
- **Regra crítica de segurança:** Um candidato **somente poderá enviar documentos** se sua conta tiver sido explicitamente **habilitada** por um funcionário para um processo seletivo específico. Candidatos sem habilitação visualizam estado bloqueado com mensagem informativa clara.

---

## MÓDULO 3 — PAINEL DO FUNCIONÁRIO

Navegação lateral com as seguintes seções:

### 3.1 Gerenciamento de Conteúdo (CMS)
- Gerenciar **notícias**: criar, editar, excluir, publicar/despublicar (título, corpo em rich text, URL da imagem de capa, data de publicação)
- Gerenciar conteúdo das **páginas informativas** exibidas no site público

### 3.2 Gerenciamento de Processos Seletivos (Editais)
- Criar e gerenciar **editais** com os campos:
  - Título, descrição, ano, tipo (concurso público, processo seletivo simplificado, etc.)
  - Status: rascunho | ativo | encerrado
  - Data de início e fim das inscrições
  - Prazo para envio de documentação
- Listar todos os editais com filtros por status e ano

### 3.3 Gerenciamento de Candidatos
- Importar ou cadastrar manualmente a **lista de classificados** de um edital, incluindo:
  - Nome do candidato, CPF, posição (ordem de classificação), tipo de vaga (ampla concorrência, cotas)
  - Vincular candidato à conta cadastrada (correspondência por CPF)
- **Convocar candidatos:** o funcionário seleciona um candidato da lista e define:
  - Status: "convocado"
  - Prazo individual para envio de documentação (data/hora personalizável por candidato)
  - Esta ação **habilita** a conta do candidato para enviar documentos naquele edital
- Visualizar status do candidato: não convocado | convocado | documentos enviados | aprovado | reprovado
- Visualizar e baixar todos os documentos enviados por um candidato específico

### 3.4 Construtor de Formulários
Construtor de formulários estilo Google Forms (arrastar e soltar) para criação de modelos reutilizáveis de solicitação de documentos:

**Tipos de bloco suportados:**
- **Cabeçalho de seção** (título + descrição opcional)
- **Bloco de texto** (parágrafo informativo somente leitura)
- **Campo de texto curto** (entrada de linha única)
- **Campo de texto longo** (área de texto)
- **Escolha única** (botões de rádio)
- **Múltipla escolha** (caixas de seleção)
- **Lista suspensa** (dropdown)
- **Campo de data**
- **Campo de upload de arquivo** (somente PDF, máximo 10MB por arquivo, com rótulo e instruções configuráveis)
- **Divisor**

Funcionalidades:
- Adicionar, reordenar (arrastar), duplicar e excluir blocos
- Marcar campos como obrigatórios ou opcionais
- Modo de pré-visualização para ver o formulário como o candidato o veria
- Salvar como modelo com nome e descrição
- Vincular um modelo de formulário a um edital (um ou mais formulários por edital)

### 3.5 Gerenciamento de Funcionários (somente Administrador)
- Criar e gerenciar contas de funcionários (nome, e-mail, papel: administrador | operador)

---

## MÓDULO 4 — PORTAL DO CANDIDATO

Após o login, o candidato visualiza seu portal pessoal:

- **Painel:** lista de editais aos quais está vinculado, com indicador de status para cada um
- **Estado bloqueado:** se a conta NÃO estiver habilitada para envio, exibir mensagem clara:  
  *"Você ainda não foi convocado para envio de documentação neste processo seletivo."*
- **Envio ativo:** quando habilitado, exibir:
  - Detalhes do edital e posição na classificação
  - Prazo para envio com contador regressivo
  - Lista de formulários exigidos pelo funcionário
  - Para cada formulário: preencher todos os campos e fazer upload dos arquivos PDF exigidos (máximo 10MB cada)
  - Botão de envio (disponível apenas antes do prazo)
  - Após envio: visualização somente leitura dos dados enviados

---

## ESQUEMA DO BANCO DE DADOS (Prisma)

Modelos necessários (com relações e índices adequados):

- `Usuario` — id, nome, cpf, email, senhaHash, perfil, telefone, criadoEm
- `Edital` — id, titulo, descricao, ano, tipo, status, inicioInscricoes, fimInscricoes, prazoEnvioDocumentos, criadoEm
- `ClassificacaoCandidato` — id, editalId, usuarioId, posicao, tipoVaga, statusConvocacao, prazoEnvio, habilitadoEm, habilitadoPor
- `ModeloFormulario` — id, nome, descricao, esquemaJSON, criadoPor, criadoEm
- `EditalFormulario` — id, editalId, modeloFormularioId, obrigatorio
- `Envio` — id, classificacaoCandidatoId, modeloFormularioId, respostasJSON, enviadoEm
- `ArquivoUpload` — id, envioId, campoChave, nomeOriginal, caminhoArmazenamento, tamanhoBytes, tipoMime, enviadoEm
- `Noticia` — id, titulo, corpo, urlImagemCapa, publicadoEm, status, autorId
- `PaginaConteudo` — id, slug, titulo, corpo, atualizadoEm

---

## CONFIGURAÇÃO DOCKER

**`docker-compose.yml` (desenvolvimento local):**
- Serviços: `postgres`, `api`, `web`
- Postgres com volume nomeado para persistência de dados
- API e Web com hot-reload (volumes montados para o código-fonte)
- Verificações de saúde (health checks) no postgres antes de iniciar a API

**`docker-compose.prod.yml` (produção/pipeline CI):**
- Serviços: `postgres`, `api`, `web`
- Sem volumes de código-fonte (usa imagens construídas)
- Políticas de reinicialização: `unless-stopped`
- Variáveis de ambiente via arquivo `.env`
- Portas expostas configuráveis via variáveis de ambiente

**Dockerfiles:**
- Dockerfile multi-estágio para a API (estágio de build + estágio de produção)
- Dockerfile multi-estágio para o Web (saída standalone do Next.js)

**README.md deve incluir (em Português do Brasil):**
- Pré-requisitos
- Como rodar localmente com Docker Compose
- Como rodar sem Docker (modo desenvolvimento)
- Como fazer o build para produção
- Documentação das variáveis de ambiente
- Instruções de migração do banco de dados (`prisma migrate deploy`)

---

## REQUISITOS ADICIONAIS

- Todos os envios de formulário devem validar tipo de arquivo (somente PDF) e tamanho (≤ 10MB) tanto no frontend quanto no backend
- Validação de CPF (formato brasileiro) no cadastro e na importação de candidatos
- Paginação em todas as listagens (padrão: 20 itens por página)
- Notificações toast para ações do usuário (sucesso, erro)
- Estados de carregamento em todas as operações assíncronas
- Estados vazios com mensagens úteis em todas as listagens
- Páginas de erro 404 e boundary de erro
- Layouts responsivos para mobile nos portais de funcionário e candidato
- Rate limiting na API nos endpoints de autenticação (proteção contra força bruta)
- Headers de segurança com Helmet.js na API
- CORS configurado via variável de ambiente

---

## AGENTES A COORDENAR

Utilizar `@orchestrator` para coordenar:

- `@database-architect` — esquema Prisma e migrações
- `@backend-specialist` — API NestJS, autenticação, upload de arquivos e regras de negócio
- `@frontend-specialist` — páginas Next.js, UI do construtor de formulários e portal do candidato
- `@devops-engineer` — Docker, Docker Compose e configuração pronta para CI/CD
- `@security-auditor` — fluxo de autenticação, segurança no upload de arquivos e validação do RBAC

---

**Ordem de execução:** planejamento do projeto → esquema do banco de dados → API backend → frontend → configuração Docker → README
