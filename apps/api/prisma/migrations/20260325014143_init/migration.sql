-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMINISTRADOR', 'OPERADOR', 'CANDIDATO');

-- CreateEnum
CREATE TYPE "StatusEdital" AS ENUM ('RASCUNHO', 'ATIVO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "StatusConvocacao" AS ENUM ('NAO_CONVOCADO', 'CONVOCADO', 'DOCUMENTOS_ENVIADOS', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "StatusAvaliacao" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'CANDIDATO',
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edital" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" "StatusEdital" NOT NULL DEFAULT 'RASCUNHO',
    "inicioInscricoes" TIMESTAMP(3),
    "fimInscricoes" TIMESTAMP(3),
    "prazoEnvioDocumentos" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Edital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassificacaoCandidato" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "nomeCandidato" TEXT NOT NULL,
    "cpfCandidato" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "tipoVaga" TEXT NOT NULL,
    "statusConvocacao" "StatusConvocacao" NOT NULL DEFAULT 'NAO_CONVOCADO',
    "prazoEnvio" TIMESTAMP(3),
    "habilitadoEm" TIMESTAMP(3),
    "habilitadoPorId" TEXT,

    CONSTRAINT "ClassificacaoCandidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeloFormulario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "esquemaJSON" JSONB NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeloFormulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditalFormulario" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "modeloFormularioId" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EditalFormulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Envio" (
    "id" TEXT NOT NULL,
    "classificacaoCandidatoId" TEXT NOT NULL,
    "modeloFormularioId" TEXT NOT NULL,
    "respostasJSON" JSONB NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusAvaliacao" "StatusAvaliacao" NOT NULL DEFAULT 'PENDENTE',
    "mensagemAvaliacao" TEXT,

    CONSTRAINT "Envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArquivoUpload" (
    "id" TEXT NOT NULL,
    "envioId" TEXT NOT NULL,
    "campoChave" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "caminhoArmazenamento" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArquivoUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "urlImagemCapa" TEXT,
    "publicadoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "autorId" TEXT NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaginaConteudo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaginaConteudo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoCandidato_editalId_cpfCandidato_key" ON "ClassificacaoCandidato"("editalId", "cpfCandidato");

-- CreateIndex
CREATE UNIQUE INDEX "EditalFormulario_editalId_modeloFormularioId_key" ON "EditalFormulario"("editalId", "modeloFormularioId");

-- CreateIndex
CREATE UNIQUE INDEX "PaginaConteudo_slug_key" ON "PaginaConteudo"("slug");

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificacaoCandidato" ADD CONSTRAINT "ClassificacaoCandidato_habilitadoPorId_fkey" FOREIGN KEY ("habilitadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeloFormulario" ADD CONSTRAINT "ModeloFormulario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalFormulario" ADD CONSTRAINT "EditalFormulario_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalFormulario" ADD CONSTRAINT "EditalFormulario_modeloFormularioId_fkey" FOREIGN KEY ("modeloFormularioId") REFERENCES "ModeloFormulario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_classificacaoCandidatoId_fkey" FOREIGN KEY ("classificacaoCandidatoId") REFERENCES "ClassificacaoCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_modeloFormularioId_fkey" FOREIGN KEY ("modeloFormularioId") REFERENCES "ModeloFormulario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoUpload" ADD CONSTRAINT "ArquivoUpload_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "Envio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
