import { PrismaClient } from '@prisma/client';

async function diagnose() {
  const prisma = new PrismaClient();
  try {
    const usuarios = await prisma.usuario.findMany({ where: { perfil: 'CANDIDATO' } });
    console.log('--- USUÁRIOS CANDIDATOS ---');
    usuarios.forEach(u => console.log(`ID: ${u.id}, Nome: ${u.nome}, CPF: ${u.cpf}`));

    const classifs = await prisma.classificacaoCandidato.findMany({
      include: {
        edital: {
          include: {
            formularios: {
              include: {
                modeloFormulario: true
              }
            }
          }
        }
      }
    });

    console.log('\n--- CLASSIFICAÇÕES E FORMULÁRIOS ---');
    classifs.forEach(c => {
      console.log(`Candidato: ${c.nomeCandidato} | CPF: ${c.cpfCandidato} | Edital: ${c.edital.titulo}`);
      if (c.edital.formularios.length === 0) {
        console.log('  -> AVISO: Edital não tem VagaEdital cadastrada!');
      } else {
        c.edital.formularios.forEach(f => {
          console.log(`  -> VagaEdital ID: ${f.id} | ModeloFormId: ${f.modeloFormularioId} | Nome: ${f.modeloFormulario?.nome}`);
        });
      }
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
