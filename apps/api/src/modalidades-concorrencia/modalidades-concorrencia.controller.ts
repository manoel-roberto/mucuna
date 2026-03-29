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
import { ModalidadesConcorrenciaService } from './modalidades-concorrencia.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('modalidades-concorrencia')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export default class ModalidadesConcorrenciaController {
  constructor(
    private readonly modalidadesConcorrenciaService: ModalidadesConcorrenciaService,
  ) {}

  @Get()
  @Permissions('MODALIDADES_LISTAR')
  findAll() {
    return this.modalidadesConcorrenciaService.findAll();
  }

  @Post()
  @Permissions('MODALIDADES_CRIAR')
  create(@Body() data: { nome: string; descricao?: string }) {
    return this.modalidadesConcorrenciaService.create(data);
  }

  @Patch(':id')
  @Permissions('MODALIDADES_EDITAR')
  update(
    @Param('id') id: string,
    @Body() data: { nome?: string; descricao?: string },
  ) {
    return this.modalidadesConcorrenciaService.update(id, data);
  }

  @Delete(':id')
  @Permissions('MODALIDADES_EXCLUIR')
  remove(@Param('id') id: string) {
    return this.modalidadesConcorrenciaService.remove(id);
  }
}
