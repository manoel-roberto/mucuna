import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { TipoEditalService } from './tipo-edital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('tipos-edital')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TipoEditalController {
  constructor(private readonly tipoEditalService: TipoEditalService) {}

  @Get()
  findAll() {
    return this.tipoEditalService.findAll();
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string }) {
    return this.tipoEditalService.create(data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.tipoEditalService.remove(id);
  }
}
