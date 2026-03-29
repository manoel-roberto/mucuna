import { Module } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { ConfiguracaoController } from './configuracao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConfiguracaoService],
  controllers: [ConfiguracaoController],
  exports: [ConfiguracaoService],
})
export class ConfiguracaoModule {}
