import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { CertamesService } from './certames.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('certames')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertamesController {
  constructor(private readonly certamesService: CertamesService) {}

  @Get()
  findAll() {
    return this.certamesService.findAll();
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: { nome: string }) {
    return this.certamesService.create(data);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.certamesService.remove(id);
  }
}
