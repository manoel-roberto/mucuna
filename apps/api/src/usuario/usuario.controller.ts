import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Permissions('USUARIOS_GERENCIAR')
  findAll(@Query('roleId') roleId?: string) {
    return this.usuarioService.findAll(roleId);
  }

  @Post()
  @Permissions('USUARIOS_GERENCIAR')
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Delete(':id')
  @Permissions('USUARIOS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
