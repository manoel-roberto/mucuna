import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  findAll(@Query('perfil') perfil?: PerfilUsuario) {
    return this.usuarioService.findAll(perfil);
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
