import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ClassificacaoService } from './classificacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('editais/:editalId/classificacao')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClassificacaoController {
  constructor(private readonly classificacaoService: ClassificacaoService) {}

  @Get()
  @Permissions('CANDIDATOS_AVALIAR')
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.classificacaoService.findAllByEdital(editalId);
  }

  @Get('estatisticas-vagas')
  @Permissions('CANDIDATOS_AVALIAR')
  getEstatisticasVagas(@Param('editalId') editalId: string) {
    return this.classificacaoService.getEstatisticasVagas(editalId);
  }

  @Get('analise-cobertura')
  @Permissions('CANDIDATOS_AVALIAR')
  analisarCobertura(@Param('editalId') editalId: string) {
    return this.classificacaoService.analisarCobertura(editalId);
  }

  @Post('importar')
  @Permissions('CANDIDATOS_IMPORTAR')
  importar(@Param('editalId') editalId: string, @Body() body: { candidatos: any[] }) {
    return this.classificacaoService.importar(editalId, body.candidatos);
  }

  @Post()
  @Permissions('CANDIDATOS_IMPORTAR')
  create(@Param('editalId') editalId: string, @Body() data: any) {
    return this.classificacaoService.create(editalId, data);
  }

  @Patch(':id')
  @Permissions('CANDIDATOS_IMPORTAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.classificacaoService.update(id, data);
  }

  @Delete('bulk')
  @Permissions('CANDIDATOS_IMPORTAR')
  removeBulk(@Body() body: { ids: string[] }) {
    return this.classificacaoService.removeBulk(body.ids);
  }

  @Delete(':id')
  @Permissions('CANDIDATOS_IMPORTAR')
  remove(@Param('id') id: string) {
    return this.classificacaoService.remove(id);
  }

  @Post('reclassificar')
  @Permissions('CANDIDATOS_AVALIAR')
  reclassificar(@Param('editalId') editalId: string) {
    return this.classificacaoService.reprocessarSituacaoCandidatos(editalId);
  }

  @Post('migrar-dados')
  @Permissions('CANDIDATOS_IMPORTAR')
  migrarDados() {
    return this.classificacaoService.migrarDadosLegados();
  }
}
