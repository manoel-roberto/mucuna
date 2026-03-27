import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { NiveisService } from './niveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('niveis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NiveisController {
  constructor(private readonly niveisService: NiveisService) {}

  @Get()
  findAll() {
    return this.niveisService.findAll();
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string }) {
    return this.niveisService.create(data);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.niveisService.update(id, data);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.niveisService.remove(id);
  }
}
