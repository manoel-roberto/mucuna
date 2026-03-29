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
import { EditaisService } from './editais.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('editais')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EditaisController {
  constructor(private readonly editaisService: EditaisService) {}

  @Get()
  @Permissions('EDITAIS_LISTAR')
  findAll() {
    return this.editaisService.findAll();
  }

  @Get('ativos-convocacao')
  @Permissions('EDITAIS_LISTAR')
  async findAtivosComConvocacao() {
    const editais = await this.editaisService.findAtivosComConvocacao();
    return editais || [];
  }

  @Get(':id')
  @Permissions('EDITAIS_LISTAR')
  findOne(@Param('id') id: string) {
    return this.editaisService.findOne(id);
  }

  @Get(':id/formularios')
  @Permissions('EDITAIS_LISTAR')
  findFormularios(@Param('id') id: string) {
    return this.editaisService.findFormularios(id);
  }

  @Post()
  @Permissions('EDITAIS_CRIAR')
  create(@Body() data: any) {
    return this.editaisService.create(data);
  }

  @Patch(':id')
  @Permissions('EDITAIS_EDITAR')
  update(@Param('id') id: string, @Body() data: any) {
    return this.editaisService.update(id, data);
  }

  @Delete(':id')
  @Permissions('EDITAIS_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.editaisService.remove(id);
  }

  @Post(':id/formularios/:modeloId')
  @Permissions('EDITAIS_EDITAR')
  vincularFormulario(
    @Param('id') id: string,
    @Param('modeloId') modeloId: string,
  ) {
    return this.editaisService.vincularFormulario(id, modeloId);
  }

  @Delete(':id/formularios/:modeloId')
  @Permissions('EDITAIS_EDITAR')
  desvincularFormulario(
    @Param('id') id: string,
    @Param('modeloId') modeloId: string,
  ) {
    return this.editaisService.desvincularFormulario(id, modeloId);
  }
}
