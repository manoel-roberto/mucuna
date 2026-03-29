import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { RegimesService } from './regimes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('regimes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegimesController {
  constructor(private readonly regimesService: RegimesService) {}

  @Get()
  @Permissions('REGIMES_LISTAR')
  findAll() {
    return this.regimesService.findAll();
  }

  @Post()
  @Permissions('REGIMES_CRIAR')
  create(@Body() data: { nome: string }) {
    return this.regimesService.create(data);
  }

  @Patch(':id')
  @Permissions('REGIMES_EDITAR')
  update(@Param('id') id: string, @Body() data: { nome: string }) {
    return this.regimesService.update(id, data);
  }

  @Delete(':id')
  @Permissions('REGIMES_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.regimesService.remove(id);
  }
}
