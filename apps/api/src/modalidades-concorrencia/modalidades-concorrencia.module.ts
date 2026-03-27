import { Module } from '@nestjs/common';
import { ModalidadesConcorrenciaService } from './modalidades-concorrencia.service';
import ModalidadesConcorrenciaController from './modalidades-concorrencia.controller';

@Module({
  controllers: [ModalidadesConcorrenciaController],
  providers: [ModalidadesConcorrenciaService],
  exports: [ModalidadesConcorrenciaService],
})
export class ModalidadesConcorrenciaModule {}
