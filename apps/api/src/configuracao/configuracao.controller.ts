import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  @Get()
  get() {
    return this.configuracaoService.get();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() data: any) {
    return this.configuracaoService.update(data);
  }
}
