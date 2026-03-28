import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('cargos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @Permissions('EDITAIS_GERENCIAR')
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  @Permissions('EDITAIS_GERENCIAR')
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string; descricao?: string }) {
    return this.cargosService.create(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: { nome?: string; descricao?: string }) {
    return this.cargosService.update(id, data);
  }

  @Delete('bulk')
  @Permissions('EDITAIS_GERENCIAR')
  removeBulk(@Body() body: { ids: string[] }) {
    return this.cargosService.removeBulk(body.ids);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.cargosService.remove(id);
  }

  @Post('importar')
  @Permissions('EDITAIS_GERENCIAR')
  importar(@Body() body: { items: { cargoNome: string; areaNome: string }[] }) {
    return this.cargosService.importarLote(body.items);
  }
}
