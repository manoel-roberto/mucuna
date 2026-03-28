import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { RegimesService } from './regimes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('regimes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegimesController {
  constructor(private readonly regimesService: RegimesService) {}

  @Get()
  findAll() {
    return this.regimesService.findAll();
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string }) {
    return this.regimesService.create(data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.regimesService.remove(id);
  }
}
