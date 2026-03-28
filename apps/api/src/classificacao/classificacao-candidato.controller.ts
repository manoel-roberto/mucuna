import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ClassificacaoService } from './classificacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('minhas-classificacoes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClassificacaoCandidatoController {
  constructor(private readonly classificacaoService: ClassificacaoService) {}

  @Get()
  // Aberto a quem tiver logado e for candidato, ou admin. 
  // Vou usar uma permissão base ou manter vazio para permitir livre acesso ao usuário sobre seus próprios dados
  findAll(@Req() req: any) {
    return this.classificacaoService.findAllByUsuario(req.user.id);
  }

  @Post('confirmar-dados/:id')
  // Mesma lógica, o usuário está agindo sobre seus dados.
  confirmarDados(@Param('id') id: string, @Body() data: any) {
    return this.classificacaoService.confirmarDados(id, data);
  }
}
