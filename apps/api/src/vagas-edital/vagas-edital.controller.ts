import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { VagasEditalService } from './vagas-edital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('vagas-edital')
export class VagasEditalController {
  constructor(private readonly vagasEditalService: VagasEditalService) {}

  @Get('edital/:editalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAllByEdital(@Param('editalId') editalId: string) {
    return this.vagasEditalService.findAllByEdital(editalId);
  }

  @Post('edital/:editalId/aplicar-sugestoes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  aplicarSugestoes(@Param('editalId') editalId: string) {
    return this.vagasEditalService.aplicarSugestoes(editalId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  create(@Body() data: { editalId: string; cargoId: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; quantidadeVagas: number }) {
    return this.vagasEditalService.create(data);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  createBulk(@Body() data: any) {
    return this.vagasEditalService.createBulk(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  update(@Param('id') id: string, @Body() data: { cargoId?: string; areaAtuacaoId?: string; carreiraId?: string; nivelId?: string; modalidadeId?: string; quantidadeVagas?: number }) {
    return this.vagasEditalService.update(id, data);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  bulkDelete(@Body() data: { editalId: string; ids: string[] }) {
    return this.vagasEditalService.deleteBulk(data.editalId, data.ids);
  }

  @Post('bulk-delete-groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  bulkDeleteGroups(@Body() data: { editalId: string; ids: string[] }) {
    return this.vagasEditalService.deleteBulkGroups(data.editalId, data.ids);
  }

  @Delete('posicao')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  remove(@Param('id') id: string) {
    return this.vagasEditalService.remove(id);
  }
}
