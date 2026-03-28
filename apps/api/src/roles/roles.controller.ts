import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('PERFIS_LISTAR')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Permissions('PERFIS_LISTAR')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post()
  @Permissions('PERFIS_CRIAR')
  create(@Body() data: { nome: string; descricao?: string; permissionIds: string[] }) {
    return this.rolesService.create(data);
  }

  @Patch(':id')
  @Permissions('PERFIS_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome?: string; descricao?: string; permissionIds?: string[] }) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @Permissions('PERFIS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
