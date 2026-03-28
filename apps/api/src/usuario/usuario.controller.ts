import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usuarioService.findOne(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() data: any) {
    // Garantir que o usuário só altere seus próprios dados permitidos
    const { nome, email, cpf, senha } = data;
    return this.usuarioService.update(user.id, { nome, email, cpf, senha });
  }

  @Get()
  @Permissions('USUARIOS_LISTAR')
  findAll(
    @Query('roleId') roleId?: string,
    @Query('perfil') roleName?: string
  ) {
    return this.usuarioService.findAll(roleId, roleName);
  }

  @Post()
  @Permissions('USUARIOS_CRIAR')
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Patch(':id')
  @Permissions('USUARIOS_EDITAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  @Permissions('USUARIOS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
