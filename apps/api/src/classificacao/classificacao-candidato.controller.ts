import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ClassificacaoService } from './classificacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('minhas-classificacoes')
export class ClassificacaoCandidatoController {
  constructor(private readonly classificacaoService: ClassificacaoService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.CANDIDATO, PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAll(@Req() req: any) {
    return this.classificacaoService.findAllByUsuario(req.user.id);
  }

  @Post('confirmar-dados/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.CANDIDATO)
  confirmarDados(@Param('id') id: string, @Body() data: any) {
    return this.classificacaoService.confirmarDados(id, data);
  }
}
