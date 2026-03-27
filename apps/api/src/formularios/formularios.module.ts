import { Module } from '@nestjs/common';
import { FormulariosController } from './formularios.controller';
import { FormulariosService } from './formularios.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormulariosController],
  providers: [FormulariosService],
  exports: [FormulariosService],
})
export class FormulariosModule {}
