import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { NiveisService } from './niveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('niveis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NiveisController {
  constructor(private readonly niveisService: NiveisService) {}

  @Get()
  findAll() {
    return this.niveisService.findAll();
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string }) {
    return this.niveisService.create(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_GERENCIAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.niveisService.update(id, data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.niveisService.remove(id);
  }
}
