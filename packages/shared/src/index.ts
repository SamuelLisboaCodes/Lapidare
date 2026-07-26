export enum PosicaoVolei {
  PONTEIRO = 'PONTEIRO',
  LEVANTADOR = 'LEVANTADOR',
  CENTRAL = 'CENTRAL',
  LIBERO = 'LIBERO',
  OPOSTO = 'OPOSTO',
}

export enum CategoriaAtleta {
  SUB13 = 'SUB13',
  SUB15 = 'SUB15',
  SUB17 = 'SUB17',
  SUB19 = 'SUB19',
  ADULTO = 'ADULTO',
}

export enum StatusVisibilidadeAtleta {
  PENDENTE_APROVACAO = 'PENDENTE_APROVACAO',
  VISIVEL = 'VISIVEL',
  OCULTO = 'OCULTO',
}

export enum TipoRelacaoResponsavel {
  PAI = 'PAI',
  MAE = 'MAE',
  TUTOR_LEGAL = 'TUTOR_LEGAL',
}

export enum StatusVinculoResponsavel {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REVOGADO = 'REVOGADO',
}

export enum StatusVerificacaoConta {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

export enum PapelClube {
  ADMIN = 'ADMIN',
  MEMBRO = 'MEMBRO',
}

export enum TipoVinculoClube {
  ESCOLA_BASE = 'ESCOLA_BASE',
  SELECAO = 'SELECAO',
  CLUBE_BASE_PROFISSIONAL = 'CLUBE_BASE_PROFISSIONAL',
}

export enum StatusVinculoClube {
  ATIVO = 'ATIVO',
  ENCERRADO = 'ENCERRADO',
}

export enum StatusPeneira {
  ABERTA = 'ABERTA',
  ENCERRADA = 'ENCERRADA',
}

export enum StatusCandidaturaPeneira {
  INTERESSADO = 'INTERESSADO',
  EM_AVALIACAO = 'EM_AVALIACAO',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
}

export enum TipoAtor {
  CLUBE = 'CLUBE',
  EMPRESARIO = 'EMPRESARIO',
  PATROCINADOR = 'PATROCINADOR',
}

export enum DirecaoInteresse {
  ATOR_PARA_ATLETA = 'ATOR_PARA_ATLETA',
  ATLETA_PARA_ATOR = 'ATLETA_PARA_ATOR',
}

export enum StatusModeracaoMidia {
  PENDENTE = 'PENDENTE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
}

export enum SeloCodigo {
  PERFIL_COMPLETO = 'PERFIL_COMPLETO',
  VIDEO_ENVIADO = 'VIDEO_ENVIADO',
  VINCULO_CLUBE_CONFIRMADO = 'VINCULO_CLUBE_CONFIRMADO',
  RESPONSAVEL_VALIDADO = 'RESPONSAVEL_VALIDADO',
}

export enum PlanoAssinatura {
  GRATIS = 'GRATIS',
  PREMIUM = 'PREMIUM',
}

export enum StatusAssinatura {
  ATIVA = 'ATIVA',
  CANCELADA = 'CANCELADA',
  EXPIRADA = 'EXPIRADA',
}

export enum TipoEntidadeDenuncia {
  PERFIL = 'PERFIL',
  MIDIA = 'MIDIA',
  MENSAGEM = 'MENSAGEM',
}

export enum StatusDenuncia {
  ABERTA = 'ABERTA',
  EM_ANALISE = 'EM_ANALISE',
  RESOLVIDA = 'RESOLVIDA',
}
