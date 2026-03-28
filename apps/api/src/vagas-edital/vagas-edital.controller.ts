import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { VagasEditalService } from './vagas-edital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('vagas-edital')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VagasEditalController {
  constructor(private readonly vagasEditalService: VagasEditalService) {}

  @Get('edital/:editalId')
  @Permissions('EDITAIS_GERENCIAR')
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.vagasEditalService.findAllByEdital(editalId);
  }

  @Post('edital/:editalId/aplicar-sugestoes')
  @Permissions('EDITAIS_GERENCIAR')
  aplicarSugestoes(@Param('editalId') editalId: string) {
    return this.vagasEditalService.aplicarSugestoes(editalId);
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { editalId: string; cargoId: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; quantidadeVagas: number }) {
    return this.vagasEditalService.create(data);
  }

  @Post('bulk')
  @Permissions('EDITAIS_GERENCIAR')
  createBulk(@Body() data: any) {
    return this.vagasEditalService.createBulk(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: { cargoId?: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; quantidadeVagas?: number }) {
    return this.vagasEditalService.update(id, data);
  }

  @Post('bulk-delete')
  @Permissions('EDITAIS_GERENCIAR')
  bulkDelete(@Body() data: { editalId: string; ids: string[] }) {
    return this.vagasEditalService.deleteBulk(data.editalId, data.ids);
  }

  @Post('bulk-delete-groups')
  @Permissions('EDITAIS_GERENCIAR')
  bulkDeleteGroups(@Body() data: { editalId: string; ids: string[] }) {
    return this.vagasEditalService.deleteBulkGroups(data.editalId, data.ids);
  }

  @Delete('posicao')
  @Permissions('EDITAIS_GERENCIAR')
  removeByPosition(
    @Body() data: { 
      editalId: string; 
      cargoId: string; 
      areaAtuacaoId?: string; 
      carreiraId?: string; 
      nivelId?: string 
    }
  ) {
    return this.vagasEditalService.removeByPosition(
      data.editalId, 
      data.cargoId, 
      data.areaAtuacaoId, 
      data.carreiraId, 
      data.nivelId
    );
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.vagasEditalService.remove(id);
  }
}
