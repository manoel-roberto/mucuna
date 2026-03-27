import { Module } from '@nestjs/common';
import { AreasAtuacaoService } from './areas-atuacao.service';
import { AreasAtuacaoController } from './areas-atuacao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AreasAtuacaoController],
  providers: [AreasAtuacaoService],
  exports: [AreasAtuacaoService],
})
export class AreasAtuacaoModule {}
