import { Module } from '@nestjs/common';
import { EditaisController } from './editais.controller';
import { EditaisService } from './editais.service';
import { TipoEditalController } from './tipo-edital.controller';
import { TipoEditalService } from './tipo-edital.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';

@Module({
  imports: [PrismaModule, ConfiguracaoModule],
  controllers: [EditaisController, TipoEditalController],
  providers: [EditaisService, TipoEditalService],
  exports: [EditaisService, TipoEditalService],
})
export class EditaisModule {}
