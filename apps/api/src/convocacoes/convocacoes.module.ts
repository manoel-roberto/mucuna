import { Module } from '@nestjs/common';
import { ConvocacoesController } from './convocacoes.controller';
import { ConvocacoesService } from './convocacoes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConvocacoesController],
  providers: [ConvocacoesService]
})
export class ConvocacoesModule {}
