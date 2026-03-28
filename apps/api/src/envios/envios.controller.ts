import {
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { EnviosService } from './envios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('envios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  create(@Body() data: { classificacaoId: string; modeloId: string; respostasJSON: any }) {
    return this.enviosService.create(data);
  }

  @Get('edital/:editalId')
  @Permissions('CANDIDATOS_AVALIAR')
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.enviosService.findAllByEdital(editalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enviosService.findOne(id);
  }

  @Post(':id/avaliar')
  @Permissions('CANDIDATOS_AVALIAR')
  avaliar(
    @Param('id') id: string,
    @Body() body: { status: string; mensagem?: string; itensAvaliacao?: any; dataAgendamento?: string },
    @Req() req: any,
  ) {
    return this.enviosService.avaliar(id, body.status as any, body.mensagem, body.itensAvaliacao, req.user.id, body.dataAgendamento);
  }

  @Get('candidato/:classificacaoId/modelo/:modeloId')
  checkSubmission(@Param('classificacaoId') classificacaoId: string, @Param('modeloId') modeloId: string) {
    return this.enviosService.findByCandidatoAndModelo(classificacaoId, modeloId);
  }
}
