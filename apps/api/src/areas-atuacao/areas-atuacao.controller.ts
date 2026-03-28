import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AreasAtuacaoService } from './areas-atuacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('areas-atuacao')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AreasAtuacaoController {
  constructor(private readonly areasAtuacaoService: AreasAtuacaoService) {}

  @Get()
  @Permissions('EDITAIS_GERENCIAR')
  findAll(@Query('cargoId') cargoId?: string) {
    return this.areasAtuacaoService.findAll(cargoId);
  }

  @Get(':id')
  @Permissions('EDITAIS_GERENCIAR')
  findOne(@Param('id') id: string) {
    return this.areasAtuacaoService.findOne(id);
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string; cargoId: string }) {
    return this.areasAtuacaoService.create(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: { nome?: string; cargoId?: string }) {
    return this.areasAtuacaoService.update(id, data);
  }

  @Delete('bulk')
  @Permissions('EDITAIS_GERENCIAR')
  removeBulk(@Body() body: { ids: string[] }) {
    return this.areasAtuacaoService.removeBulk(body.ids);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.areasAtuacaoService.remove(id);
  }
}
