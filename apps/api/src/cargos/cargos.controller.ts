import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CargosService } from './cargos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('cargos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @Permissions('CARGOS_LISTAR')
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  @Permissions('CARGOS_LISTAR')
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Post()
  @Permissions('CARGOS_CRIAR')
  create(@Body() data: { nome: string; descricao?: string }) {
    return this.cargosService.create(data);
  }

  @Patch(':id')
  @Permissions('CARGOS_EDITAR')
  update(
    @Param('id') id: string,
    @Body() data: { nome?: string; descricao?: string },
  ) {
    return this.cargosService.update(id, data);
  }

  @Delete('bulk')
  @Permissions('CARGOS_EXCLUIR')
  removeBulk(@Body() body: { ids: string[] }) {
    return this.cargosService.removeBulk(body.ids);
  }

  @Delete(':id')
  @Permissions('CARGOS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.cargosService.remove(id);
  }

  @Post('importar')
  @Permissions('CARGOS_CRIAR')
  importar(@Body() body: { items: { cargoNome: string; areaNome: string }[] }) {
    return this.cargosService.importarLote(body.items);
  }
}
