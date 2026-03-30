import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StatusConvocacao } from '@prisma/client';
import { ConvocacoesService } from './convocacoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { StatusRegistroConvocacao } from '@prisma/client';

@Controller('editais/:editalId/convocacoes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConvocacoesController {
  constructor(private readonly convocacoesService: ConvocacoesService) {}

  @Get()
  @Permissions('CANDIDATOS_AVALIAR')
  async getConvocacoesAtivas(@Param('editalId') editalId: string) {
    return this.convocacoesService.findAllAtivos(editalId);
  }

  @Post('marcar')
  @Permissions('CANDIDATOS_AVALIAR')
  async marcarParaConvocacao(
    @Param('editalId') editalId: string,
    @Body('candidatosIds') candidatosIds: string[],
  ) {
    return this.convocacoesService.marcarParaConvocacao(
      editalId,
      candidatosIds,
    );
  }

  @Post(':candidatoId/registro')
  @Permissions('CANDIDATOS_AVALIAR')
  async adicionarRegistro(
    @Param('candidatoId') candidatoId: string,
    @Body()
    data: {
      meioUtilizado: string;
      prazoDocumentacao: string;
      observacoes?: string;
      avancarParaDocumentacao?: boolean;
    },
    @Request() req: any,
  ) {
    return this.convocacoesService.adicionarRegistro(
      candidatoId,
      {
        meioUtilizado: data.meioUtilizado,
        prazoDocumentacao: new Date(data.prazoDocumentacao),
        observacoes: data.observacoes,
        avancarParaDocumentacao: data.avancarParaDocumentacao,
      },
      req.user.id,
    );
  }

  @Put('registros/:registroId/status')
  @Permissions('CANDIDATOS_AVALIAR')
  async atualizarStatusRegistro(
    @Param('registroId') registroId: string,
    @Body('status') status: StatusRegistroConvocacao,
  ) {
    return this.convocacoesService.atualizarStatusRegistro(registroId, status);
  }

  @Patch(':candidatoId/mover')
  @Permissions('CANDIDATOS_AVALIAR')
  async moverNoKanban(
    @Param('candidatoId') candidatoId: string,
    @Body('status') status: StatusConvocacao,
    @Body('observacao') observacao: string,
    @Body('prazo') prazo: string,
    @Request() req: any,
  ) {
    return this.convocacoesService.moverNoKanban(
      candidatoId,
      status,
      req.user.id,
      observacao,
      prazo ? new Date(prazo) : undefined,
    );
  }

  @Delete(':candidatoId/remover')
  @Permissions('CANDIDATOS_AVALIAR')
  async removerDaConvocacao(
    @Param('editalId') editalId: string,
    @Param('candidatoId') candidatoId: string,
  ) {
    return this.convocacoesService.removerDaConvocacao(editalId, candidatoId);
  }

  @Patch(':candidatoId/formulario')
  @Permissions('CANDIDATOS_AVALIAR')
  async vincularFormulario(
    @Param('candidatoId') candidatoId: string,
    @Body('modeloFormularioId') modeloFormularioId: string,
  ) {
    return this.convocacoesService.vincularModeloFormulario(
      candidatoId,
      modeloFormularioId,
    );
  }
}
