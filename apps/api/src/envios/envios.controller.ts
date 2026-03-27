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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.CANDIDATO)
  create(@Body() data: { classificacaoId: string; modeloId: string; respostasJSON: any }) {
    return this.enviosService.create(data);
  }

  @Get('edital/:editalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.enviosService.findAllByEdital(editalId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR, PerfilUsuario.CANDIDATO)
  findOne(@Param('id') id: string) {
    return this.enviosService.findOne(id);
  }

  @Post(':id/avaliar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  avaliar(
    @Param('id') id: string,
    @Body() body: { status: string; mensagem?: string; itensAvaliacao?: any; dataAgendamento?: string },
    @Req() req: any,
  ) {
    return this.enviosService.avaliar(id, body.status as any, body.mensagem, body.itensAvaliacao, req.user.id, body.dataAgendamento);
  }

  @Get('candidato/:classificacaoId/modelo/:modeloId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR, PerfilUsuario.CANDIDATO)
  checkSubmission(@Param('classificacaoId') classificacaoId: string, @Param('modeloId') modeloId: string) {
    return this.enviosService.findByCandidatoAndModelo(classificacaoId, modeloId);
  }
}
