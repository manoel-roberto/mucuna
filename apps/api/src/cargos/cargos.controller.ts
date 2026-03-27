import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string; descricao?: string }) {
    return this.cargosService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: { nome?: string; descricao?: string }) {
    return this.cargosService.update(id, data);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  removeBulk(@Body() body: { ids: string[] }) {
    return this.cargosService.removeBulk(body.ids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.cargosService.remove(id);
  }

  @Post('importar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  importar(@Body() body: { items: { cargoNome: string; areaNome: string }[] }) {
    return this.cargosService.importarLote(body.items);
  }
}
