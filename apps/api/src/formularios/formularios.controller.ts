import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('formularios')
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
  findAll() {
    return this.formulariosService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  create(@Body() data: any, @Req() req: any) {
    return this.formulariosService.create(data, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR, PerfilUsuario.CANDIDATO)
  findOne(@Param('id') id: string) {
    return this.formulariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() data: any) {
    return this.formulariosService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.formulariosService.remove(id);
  }

  @Post('vincular-edital')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR)
  vincular(@Body() data: { editalId: string; modeloId: string; obrigatorio?: boolean }) {
    return this.formulariosService.vincularAoEdital(data.editalId, data.modeloId, data.obrigatorio);
  }
  
  @Get('edital/:editalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR, PerfilUsuario.CANDIDATO)
  findByEdital(@Param('editalId') editalId: string) {
    return this.formulariosService.listByEdital(editalId);
  }
}
