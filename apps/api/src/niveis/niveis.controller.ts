import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NiveisService } from './niveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('niveis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NiveisController {
  constructor(private readonly niveisService: NiveisService) {}

  @Get()
  @Permissions('NIVEIS_LISTAR')
  findAll() {
    return this.niveisService.findAll();
  }

  @Post()
  @Permissions('NIVEIS_CRIAR')
  create(@Body() data: { nome: string }) {
    return this.niveisService.create(data);
  }

  @Patch(':id')
  @Permissions('NIVEIS_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.niveisService.update(id, data);
  }

  @Delete(':id')
  @Permissions('NIVEIS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.niveisService.remove(id);
  }
}
