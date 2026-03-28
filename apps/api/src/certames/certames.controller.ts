import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { CertamesService } from './certames.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('certames')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CertamesController {
  constructor(private readonly certamesService: CertamesService) {}

  @Get()
  findAll() {
    return this.certamesService.findAll();
  }

  @Post()
  @Permissions('EDITAIS_GERENCIAR')
  create(@Body() data: { nome: string }) {
    return this.certamesService.create(data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_GERENCIAR')
  remove(@Param('id') id: string) {
    return this.certamesService.remove(id);
  }
}
