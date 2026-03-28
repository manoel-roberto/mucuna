import { Controller, Get, Post, Body, Delete, Param, UseGuards, Patch } from '@nestjs/common';
import { TipoEditalService } from './tipo-edital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('tipos-edital')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TipoEditalController {
  constructor(private readonly tipoEditalService: TipoEditalService) {}

  @Get()
  @Permissions('TIPOS_EDITAL_LISTAR')
  findAll() {
    return this.tipoEditalService.findAll();
  }

  @Post()
  @Permissions('TIPOS_EDITAL_CRIAR')
  create(@Body() data: { nome: string }) {
    return this.tipoEditalService.create(data);
  }

  @Patch(':id')
  @Permissions('TIPOS_EDITAL_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.tipoEditalService.update(id, data);
  }

  @Delete(':id')
  @Permissions('TIPOS_EDITAL_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.tipoEditalService.remove(id);
  }
}
