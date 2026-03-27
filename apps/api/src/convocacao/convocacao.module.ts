import { Module } from '@nestjs/common';
import { ConvocacaoService } from './convocacao.service';
import { ConvocacaoController } from './convocacao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConvocacaoController],
  providers: [ConvocacaoService],
  exports: [ConvocacaoService],
})
export class ConvocacaoModule {}
