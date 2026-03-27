import { Module } from '@nestjs/common';
import { EditaisController } from './editais.controller';
import { EditaisService } from './editais.service';
import { TipoEditalController } from './tipo-edital.controller';
import { TipoEditalService } from './tipo-edital.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EditaisController, TipoEditalController],
  providers: [EditaisService, TipoEditalService],
  exports: [EditaisService, TipoEditalService],
})
export class EditaisModule {}
