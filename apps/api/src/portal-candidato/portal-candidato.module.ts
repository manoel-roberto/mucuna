import { Module } from '@nestjs/common';
import { PortalCandidatoService } from './portal-candidato.service';
import { PortalCandidatoController } from './portal-candidato.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PortalCandidatoController],
  providers: [PortalCandidatoService],
})
export class PortalCandidatoModule {}
