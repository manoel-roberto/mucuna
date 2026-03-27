import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModalidadesConcorrenciaService } from './modalidades-concorrencia.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('modalidades-concorrencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export default class ModalidadesConcorrenciaController {
  constructor(private readonly modalidadesConcorrenciaService: ModalidadesConcorrenciaService) {}

  @Get()
  findAll() {
    return this.modalidadesConcorrenciaService.findAll();
  }

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() data: { nome: string; descricao?: string }) {
    return this.modalidadesConcorrenciaService.create(data);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() data: { nome?: string; descricao?: string }) {
    return this.modalidadesConcorrenciaService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.modalidadesConcorrenciaService.remove(id);
  }
}
