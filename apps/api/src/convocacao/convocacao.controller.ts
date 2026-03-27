import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ConvocacaoService } from './convocacao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('editais/:editalId/convocacao')
@UseGuards(JwtAuthGuard)
export class ConvocacaoController {
  constructor(private readonly convocacaoService: ConvocacaoService) {}

  @Post('gerar-fila')
  async gerarFila(@Param('editalId') editalId: string) {
    return this.convocacaoService.gerarFilaConvocacao(editalId);
  }
}
