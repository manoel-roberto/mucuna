import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('formularios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  @Get()
  @Permissions('FORMULARIOS_LISTAR')
  findAll() {
    return this.formulariosService.findAll();
  }

  @Post()
  @Permissions('FORMULARIOS_CRIAR')
  create(@Body() data: any, @Req() req: any) {
    return this.formulariosService.create(data, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formulariosService.findOne(id);
  }

  @Patch(':id')
  @Permissions('FORMULARIOS_EDITAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.formulariosService.update(id, data);
  }

  @Delete(':id')
  @Permissions('FORMULARIOS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.formulariosService.remove(id);
  }

  @Post('vincular-edital')
  @Permissions('FORMULARIOS_EDITAR')
  vincular(@Body() data: { editalId: string; modeloId: string; obrigatorio?: boolean }) {
    return this.formulariosService.vincularAoEdital(data.editalId, data.modeloId, data.obrigatorio);
  }
  
  @Get('edital/:editalId')
  findByEdital(@Param('editalId') editalId: string) {
    return this.formulariosService.listByEdital(editalId);
  }
}
