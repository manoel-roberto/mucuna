import { Module } from '@nestjs/common';
import { ClassificacaoService } from './classificacao.service';
import { ClassificacaoController } from './classificacao.controller';
import { ClassificacaoCandidatoController } from './classificacao-candidato.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ModalidadesConcorrenciaModule } from '../modalidades-concorrencia/modalidades-concorrencia.module';

@Module({
  imports: [PrismaModule, ModalidadesConcorrenciaModule],
  controllers: [ClassificacaoController, ClassificacaoCandidatoController],
  providers: [ClassificacaoService],
  exports: [ClassificacaoService],
})
export class ClassificacaoModule {}
