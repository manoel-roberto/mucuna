import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ClassificacaoService } from './classificacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('editais/:editalId/classificacao')
export class ClassificacaoController {
  constructor(private readonly classificacaoService: ClassificacaoService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.classificacaoService.findAllByEdital(editalId);
  }

  @Get('estatisticas-vagas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  getEstatisticasVagas(@Param('editalId') editalId: string) {
    return this.classificacaoService.getEstatisticasVagas(editalId);
  }

  @Get('analise-cobertura')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  analisarCobertura(@Param('editalId') editalId: string) {
    return this.classificacaoService.analisarCobertura(editalId);
  }

  @Post('importar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  importar(@Param('editalId') editalId: string, @Body() body: { candidatos: any[] }) {
    return this.classificacaoService.importar(editalId, body.candidatos);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Param('editalId') editalId: string, @Body() data: any) {
    return this.classificacaoService.create(editalId, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: any) {
    return this.classificacaoService.update(id, data);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  removeBulk(@Body() body: { ids: string[] }) {
    return this.classificacaoService.removeBulk(body.ids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.classificacaoService.remove(id);
  }

  @Post('reclassificar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  reclassificar(@Param('editalId') editalId: string) {
    return this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
  }

  @Post('migrar-dados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  migrarDados() {
    return this.classificacaoService.migrarDadosLegados();
  }
}
