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
  @Permissions('EDITAIS_GERENCIAR')
  findAll() {
    return this.formulariosService.findAll();
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: any, @Req() req: any) {
    return this.formulariosService.create(data, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formulariosService.findOne(id);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.formulariosService.update(id, data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.formulariosService.remove(id);
  }

  @Post('vincular-edital')
  @Permissions('EDITAIS_GERENCIAR')
  vincular(@Body() data: { editalId: string; modeloId: string; obrigatorio?: boolean }) {
    return this.formulariosService.vincularAoEdital(data.editalId, data.modeloId, data.obrigatorio);
  }
  
  @Get('edital/:editalId')
  findByEdital(@Param('editalId') editalId: string) {
    return this.formulariosService.listByEdital(editalId);
  }
}
