-- CreateEnum
CREATE TYPE "PosicaoVolei" AS ENUM ('PONTEIRO', 'LEVANTADOR', 'CENTRAL', 'LIBERO', 'OPOSTO');

-- CreateEnum
CREATE TYPE "CategoriaAtleta" AS ENUM ('SUB13', 'SUB15', 'SUB17', 'SUB19', 'ADULTO');

-- CreateEnum
CREATE TYPE "StatusVisibilidadeAtleta" AS ENUM ('PENDENTE_APROVACAO', 'VISIVEL', 'OCULTO');

-- CreateEnum
CREATE TYPE "TipoRelacaoResponsavel" AS ENUM ('PAI', 'MAE', 'TUTOR_LEGAL');

-- CreateEnum
CREATE TYPE "StatusVinculoResponsavel" AS ENUM ('PENDENTE', 'APROVADO', 'REVOGADO');

-- CreateEnum
CREATE TYPE "StatusVerificacaoConta" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "PapelClube" AS ENUM ('ADMIN', 'MEMBRO');

-- CreateEnum
CREATE TYPE "TipoVinculoClube" AS ENUM ('ESCOLA_BASE', 'SELECAO', 'CLUBE_BASE_PROFISSIONAL');

-- CreateEnum
CREATE TYPE "StatusVinculoClube" AS ENUM ('ATIVO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "StatusPeneira" AS ENUM ('ABERTA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "StatusCandidaturaPeneira" AS ENUM ('INTERESSADO', 'EM_AVALIACAO', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "DirecaoInteresse" AS ENUM ('ATOR_PARA_ATLETA', 'ATLETA_PARA_ATOR');

-- CreateEnum
CREATE TYPE "StatusModeracaoMidia" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "SeloCodigo" AS ENUM ('PERFIL_COMPLETO', 'VIDEO_ENVIADO', 'VINCULO_CLUBE_CONFIRMADO', 'RESPONSAVEL_VALIDADO');

-- CreateEnum
CREATE TYPE "PlanoAssinatura" AS ENUM ('GRATIS', 'PREMIUM');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoEntidadeDenuncia" AS ENUM ('PERFIL', 'MIDIA', 'MENSAGEM');

-- CreateEnum
CREATE TYPE "StatusDenuncia" AS ENUM ('ABERTA', 'EM_ANALISE', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "oauthProvider" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtletaPerfil" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "alturaCm" INTEGER,
    "envergaduraCm" INTEGER,
    "alcanceAtaqueCm" INTEGER,
    "alcanceBloqueioCm" INTEGER,
    "posicao" "PosicaoVolei" NOT NULL,
    "categoria" "CategoriaAtleta" NOT NULL,
    "bio" TEXT,
    "statusVisibilidade" "StatusVisibilidadeAtleta" NOT NULL DEFAULT 'PENDENTE_APROVACAO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtletaPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsavelPerfil" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,

    CONSTRAINT "ResponsavelPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VinculoResponsavelAtleta" (
    "id" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "status" "StatusVinculoResponsavel" NOT NULL DEFAULT 'PENDENTE',
    "tipoRelacao" "TipoRelacaoResponsavel" NOT NULL,
    "versaoTermoAceito" TEXT,
    "ipAprovacao" TEXT,
    "userAgentAprovacao" TEXT,
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "VinculoResponsavelAtleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresarioPerfil" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "representa" TEXT,
    "statusVerificacao" "StatusVerificacaoConta" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "EmpresarioPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrocinadorPerfil" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "statusVerificacao" "StatusVerificacaoConta" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "PatrocinadorPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clube" (
    "id" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "documento" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "statusVerificacao" "StatusVerificacaoConta" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroClube" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clubeId" TEXT NOT NULL,
    "papel" "PapelClube" NOT NULL DEFAULT 'MEMBRO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "convidadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembroClube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VinculoAtletaClube" (
    "id" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "clubeId" TEXT NOT NULL,
    "tipoVinculo" "TipoVinculoClube" NOT NULL,
    "status" "StatusVinculoClube" NOT NULL DEFAULT 'ATIVO',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "confirmadoPeloClube" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VinculoAtletaClube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peneira" (
    "id" TEXT NOT NULL,
    "clubeId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaAtleta" NOT NULL,
    "posicaoAlvo" "PosicaoVolei",
    "dataEvento" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusPeneira" NOT NULL DEFAULT 'ABERTA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Peneira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidaturaPeneira" (
    "id" TEXT NOT NULL,
    "peneiraId" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "status" "StatusCandidaturaPeneira" NOT NULL DEFAULT 'INTERESSADO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidaturaPeneira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeguidorClube" (
    "id" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "clubeId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeguidorClube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "referenciaId" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interesse" (
    "id" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "clubeId" TEXT,
    "empresarioId" TEXT,
    "patrocinadorId" TEXT,
    "direcao" "DirecaoInteresse" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interesse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "clubeId" TEXT,
    "empresarioId" TEXT,
    "patrocinadorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Midia" (
    "id" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'VIDEO',
    "url" TEXT NOT NULL,
    "descricao" TEXT,
    "statusModeracao" "StatusModeracaoMidia" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Midia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selo" (
    "id" TEXT NOT NULL,
    "codigo" "SeloCodigo" NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Selo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtletaSelo" (
    "atletaId" TEXT NOT NULL,
    "seloId" TEXT NOT NULL,
    "concedidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtletaSelo_pkey" PRIMARY KEY ("atletaId","seloId")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "clubeId" TEXT,
    "empresarioId" TEXT,
    "patrocinadorId" TEXT,
    "plano" "PlanoAssinatura" NOT NULL DEFAULT 'GRATIS',
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3),

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "id" TEXT NOT NULL,
    "denuncianteId" TEXT NOT NULL,
    "entidadeTipo" "TipoEntidadeDenuncia" NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" "StatusDenuncia" NOT NULL DEFAULT 'ABERTA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AtletaPerfil_usuarioId_key" ON "AtletaPerfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelPerfil_usuarioId_key" ON "ResponsavelPerfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelPerfil_cpf_key" ON "ResponsavelPerfil"("cpf");

-- CreateIndex
CREATE INDEX "VinculoResponsavelAtleta_atletaId_idx" ON "VinculoResponsavelAtleta"("atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "EmpresarioPerfil_usuarioId_key" ON "EmpresarioPerfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PatrocinadorPerfil_usuarioId_key" ON "PatrocinadorPerfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PatrocinadorPerfil_cnpj_key" ON "PatrocinadorPerfil"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "MembroClube_usuarioId_clubeId_key" ON "MembroClube"("usuarioId", "clubeId");

-- CreateIndex
CREATE INDEX "VinculoAtletaClube_atletaId_idx" ON "VinculoAtletaClube"("atletaId");

-- CreateIndex
CREATE INDEX "VinculoAtletaClube_clubeId_idx" ON "VinculoAtletaClube"("clubeId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidaturaPeneira_peneiraId_atletaId_key" ON "CandidaturaPeneira"("peneiraId", "atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "SeguidorClube_atletaId_clubeId_key" ON "SeguidorClube"("atletaId", "clubeId");

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_idx" ON "Notificacao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversa_matchId_key" ON "Conversa"("matchId");

-- CreateIndex
CREATE INDEX "Mensagem_conversaId_idx" ON "Mensagem"("conversaId");

-- CreateIndex
CREATE INDEX "Midia_atletaId_idx" ON "Midia"("atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "Selo_codigo_key" ON "Selo"("codigo");

-- AddForeignKey
ALTER TABLE "AtletaPerfil" ADD CONSTRAINT "AtletaPerfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelPerfil" ADD CONSTRAINT "ResponsavelPerfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoResponsavelAtleta" ADD CONSTRAINT "VinculoResponsavelAtleta_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "ResponsavelPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoResponsavelAtleta" ADD CONSTRAINT "VinculoResponsavelAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresarioPerfil" ADD CONSTRAINT "EmpresarioPerfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrocinadorPerfil" ADD CONSTRAINT "PatrocinadorPerfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroClube" ADD CONSTRAINT "MembroClube_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroClube" ADD CONSTRAINT "MembroClube_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoAtletaClube" ADD CONSTRAINT "VinculoAtletaClube_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoAtletaClube" ADD CONSTRAINT "VinculoAtletaClube_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peneira" ADD CONSTRAINT "Peneira_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidaturaPeneira" ADD CONSTRAINT "CandidaturaPeneira_peneiraId_fkey" FOREIGN KEY ("peneiraId") REFERENCES "Peneira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidaturaPeneira" ADD CONSTRAINT "CandidaturaPeneira_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguidorClube" ADD CONSTRAINT "SeguidorClube_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguidorClube" ADD CONSTRAINT "SeguidorClube_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_empresarioId_fkey" FOREIGN KEY ("empresarioId") REFERENCES "EmpresarioPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_patrocinadorId_fkey" FOREIGN KEY ("patrocinadorId") REFERENCES "PatrocinadorPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_empresarioId_fkey" FOREIGN KEY ("empresarioId") REFERENCES "EmpresarioPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_patrocinadorId_fkey" FOREIGN KEY ("patrocinadorId") REFERENCES "PatrocinadorPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Midia" ADD CONSTRAINT "Midia_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtletaSelo" ADD CONSTRAINT "AtletaSelo_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "AtletaPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtletaSelo" ADD CONSTRAINT "AtletaSelo_seloId_fkey" FOREIGN KEY ("seloId") REFERENCES "Selo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_empresarioId_fkey" FOREIGN KEY ("empresarioId") REFERENCES "EmpresarioPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_patrocinadorId_fkey" FOREIGN KEY ("patrocinadorId") REFERENCES "PatrocinadorPerfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_denuncianteId_fkey" FOREIGN KEY ("denuncianteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
