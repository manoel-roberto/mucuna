import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EditaisService } from './editais.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('editais')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EditaisController {
  constructor(private readonly editaisService: EditaisService) {}

  @Get()
  findAll() {
    return this.editaisService.findAll();
  }

  @Get('ativos-convocacao')
  async findAtivosComConvocacao() {
    const editais = await this.editaisService.findAtivosComConvocacao();
    return editais || [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.editaisService.findOne(id);
  }

  @Get(':id/formularios')
  findFormularios(@Param('id') id: string) {
    return this.editaisService.findFormularios(id);
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: any) {
    return this.editaisService.create(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.editaisService.update(id, data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.editaisService.remove(id);
  }

  @Post(':id/formularios/:modeloId')
  @Permissions('EDITAIS_GERENCIAR')
  vincularFormulario(@Param('id') id: string, @Param('modeloId') modeloId: string) {
    return this.editaisService.vincularFormulario(id, modeloId);
  }

  @Delete(':id/formularios/:modeloId')
  @Permissions('EDITAIS_GERENCIAR')
  desvincularFormulario(@Param('id') id: string, @Param('modeloId') modeloId: string) {
    return this.editaisService.desvincularFormulario(id, modeloId);
  }
}
