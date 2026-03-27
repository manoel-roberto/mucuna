import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AreasAtuacaoService } from './areas-atuacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('areas-atuacao')
export class AreasAtuacaoController {
  constructor(private readonly areasAtuacaoService: AreasAtuacaoService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAll(@Query('cargoId') cargoId?: string) {
    return this.areasAtuacaoService.findAll(cargoId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.areasAtuacaoService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string; cargoId: string }) {
    return this.areasAtuacaoService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: { nome?: string; cargoId?: string }) {
    return this.areasAtuacaoService.update(id, data);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  removeBulk(@Body() body: { ids: string[] }) {
    return this.areasAtuacaoService.removeBulk(body.ids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.areasAtuacaoService.remove(id);
  }
}
