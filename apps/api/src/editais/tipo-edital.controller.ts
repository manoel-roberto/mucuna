import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { TipoEditalService } from './tipo-edital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('tipos-edital')
export class TipoEditalController {
  constructor(private readonly tipoEditalService: TipoEditalService) {}

  @Get()
  findAll() {
    return this.tipoEditalService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string }) {
    return this.tipoEditalService.create(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.tipoEditalService.remove(id);
  }
}
