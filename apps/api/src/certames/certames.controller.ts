import { Controller, Get, Post, Body, Delete, Param, UseGuards, Patch } from '@nestjs/common';
import { CertamesService } from './certames.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('certames')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CertamesController {
  constructor(private readonly certamesService: CertamesService) {}

  @Get()
  @Permissions('CERTAMES_LISTAR')
  findAll() {
    return this.certamesService.findAll();
  }

  @Post()
  @Permissions('CERTAMES_CRIAR')
  create(@Body() data: { nome: string }) {
    return this.certamesService.create(data);
  }

  @Patch(':id')
  @Permissions('CERTAMES_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.certamesService.update(id, data);
  }

  @Delete(':id')
  @Permissions('CERTAMES_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.certamesService.remove(id);
  }
}
