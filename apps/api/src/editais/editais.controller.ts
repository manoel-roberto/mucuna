import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EditaisService } from './editais.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('editais')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: any) {
    return this.editaisService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: any) {
    return this.editaisService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.editaisService.remove(id);
  }

  @Post(':id/formularios/:modeloId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  vincularFormulario(@Param('id') id: string, @Param('modeloId') modeloId: string) {
    return this.editaisService.vincularFormulario(id, modeloId);
  }

  @Delete(':id/formularios/:modeloId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  desvincularFormulario(@Param('id') id: string, @Param('modeloId') modeloId: string) {
    return this.editaisService.desvincularFormulario(id, modeloId);
  }
}
