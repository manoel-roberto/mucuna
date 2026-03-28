import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { CarreirasService } from './carreiras.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('carreiras')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CarreirasController {
  constructor(private readonly carreirasService: CarreirasService) {}

  @Get()
  @Permissions('CARREIRAS_LISTAR')
  findAll() {
    return this.carreirasService.findAll();
  }

  @Post()
  @Permissions('CARREIRAS_CRIAR')
  create(@Body() data: { nome: string }) {
    return this.carreirasService.create(data);
  }

  @Patch(':id')
  @Permissions('CARREIRAS_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.carreirasService.update(id, data);
  }

  @Delete(':id')
  @Permissions('CARREIRAS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.carreirasService.remove(id);
  }
}
