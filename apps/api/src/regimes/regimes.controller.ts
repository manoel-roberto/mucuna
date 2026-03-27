import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { RegimesService } from './regimes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('regimes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegimesController {
  constructor(private readonly regimesService: RegimesService) {}

  @Get()
  findAll() {
    return this.regimesService.findAll();
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string }) {
    return this.regimesService.create(data);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.regimesService.remove(id);
  }
}
