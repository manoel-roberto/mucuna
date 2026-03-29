import { Module } from '@nestjs/common';
import { VagasEditalService } from './vagas-edital.service';
import { VagasEditalController } from './vagas-edital.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassificacaoModule } from '../classificacao/classificacao.module';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';

@Module({
  imports: [PrismaModule, ClassificacaoModule, ConfiguracaoModule],
  controllers: [VagasEditalController],
  providers: [VagasEditalService],
  exports: [VagasEditalService],
})
export class VagasEditalModule {}
