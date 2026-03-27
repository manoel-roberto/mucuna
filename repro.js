const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const enviosService = {
    prisma,
    async avaliar(id, status, mensagem, itensAvaliacao, usuarioId) {
      return this.prisma.$transaction(async (tx) => {
        const updatedEnvio = await tx.envio.update({
          where: { id },
          data: {
            statusAvaliacao: status,
            mensagemAvaliacao: mensagem,
            itensAvaliacaoJSON: itensAvaliacao,
          },
          include: {
            classificacao: {
              include: {
                edital: {
                  include: {
                    formularios: true,
                  },
                },
              },
            },
          },
        });

        const idClassificacao = updatedEnvio.classificacaoCandidatoId;
        console.log('ID Classificação:', idClassificacao);
        console.log('Status recebido:', status);

        if (status === 'REJEITADO') {
          console.log('Entrou no bloco REJEITADO');
          await tx.classificacaoCandidato.update({
            where: { id: idClassificacao },
            data: { statusConvocacao: 'DOCUMENTACAO_PENDENTE' },
          });
          
          await tx.registroConvocacao.create({
            data: {
              classificacaoCandidatoId: idClassificacao,
              meioUtilizado: 'Teste Manual',
              prazoDocumentacao: new Date(),
              status: 'MUDANCA_FASE',
              observacoes: `REJEIÇÃO TESTE: ${mensagem}`,
              criadoPorId: usuarioId
            }
          });
        }
        return updatedEnvio;
      });
    }
  };

  try {
    const res = await enviosService.avaliar(
      '1212dd32-ee40-412e-b021-86668e644cc6', 
      'REJEITADO', 
      'Teste de rejeição via script', 
      { 'field-1': { status: 'REJEITADO', feedback: 'Erro teste' } }
    );
    console.log('Sucesso:', res.id);
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
