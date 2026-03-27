import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StatusConvocacao } from '@prisma/client';
import { ConvocacoesService } from './convocacoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';
import { StatusRegistroConvocacao } from '@prisma/client';

@Controller('editais/:editalId/convocacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR)
export class ConvocacoesController {
  constructor(private readonly convocacoesService: ConvocacoesService) {}

  @Get()
  async getConvocacoesAtivas(@Param('editalId') editalId: string) {
    return this.convocacoesService.findAllAtivos(editalId);
  }

  @Post('marcar')
  async marcarParaConvocacao(
    @Param('editalId') editalId: string,
    @Body('candidatosIds') candidatosIds: string[]
  ) {
    return this.convocacoesService.marcarParaConvocacao(editalId, candidatosIds);
  }

  @Post(':candidatoId/registro')
  async adicionarRegistro(
    @Param('candidatoId') candidatoId: string,
    @Body() data: { meioUtilizado: string; prazoDocumentacao: string; observacoes?: string },
    @Request() req: any
  ) {
    return this.convocacoesService.adicionarRegistro(
      candidatoId,
      {
        meioUtilizado: data.meioUtilizado,
        prazoDocumentacao: new Date(data.prazoDocumentacao),
        observacoes: data.observacoes
      },
      req.user.userId
    );
  }

  @Put('registros/:registroId/status')
  async atualizarStatusRegistro(
    @Param('registroId') registroId: string,
    @Body('status') status: StatusRegistroConvocacao
  ) {
    return this.convocacoesService.atualizarStatusRegistro(registroId, status);
  }

  @Patch(':candidatoId/mover')
  async moverNoKanban(
    @Param('candidatoId') candidatoId: string,
    @Body('status') status: StatusConvocacao,
    @Body('observacao') observacao: string,
    @Body('prazo') prazo: string,
    @Request() req: any
  ) {
    return this.convocacoesService.moverNoKanban(
      candidatoId, 
      status, 
      req.user.userId, 
      observacao, 
      prazo ? new Date(prazo) : undefined
    );
  }

  @Delete(':candidatoId/remover')
  async removerDaConvocacao(
    @Param('editalId') editalId: string,
    @Param('candidatoId') candidatoId: string
  ) {
    return this.convocacoesService.removerDaConvocacao(editalId, candidatoId);
  }

  @Patch(':candidatoId/formulario')
  async vincularFormulario(@Param('candidatoId') candidatoId: string, @Body('modeloFormularioId') modeloFormularioId: string) {
    return this.convocacoesService.vincularModeloFormulario(candidatoId, modeloFormularioId);
  }
}
