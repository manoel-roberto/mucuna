import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { CarreirasService } from './carreiras.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('carreiras')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarreirasController {
  constructor(private readonly carreirasService: CarreirasService) {}

  @Get()
  findAll() {
    return this.carreirasService.findAll();
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string }) {
    return this.carreirasService.create(data);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.carreirasService.update(id, data);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.carreirasService.remove(id);
  }
}
