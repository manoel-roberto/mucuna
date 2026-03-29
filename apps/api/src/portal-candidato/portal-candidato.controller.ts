import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  UseGuards,
  Param,
  Patch,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PortalCandidatoService } from './portal-candidato.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('portal-candidato')
export class PortalCandidatoController {
  constructor(
    private readonly portalCandidatoService: PortalCandidatoService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(
    @Query('cpf') cpf: string,
    @Query('inscricao') inscricao: string,
  ) {
    if (!cpf || !inscricao) {
      throw new HttpException(
        'CPF e Inscrição são obrigatórios.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.portalCandidatoService.getStatus(cpf, inscricao);
  }

  @Post('enviar-documentos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('arquivos', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async enviarDocumentos(
    @Body('classificacaoId') classificacaoId: string,
    @Body('modeloId') modeloId: string,
    @Body('respostas') respostasRaw: string,
    @UploadedFiles() arquivos: any[],
  ) {
    let respostas = {};
    try {
      respostas = JSON.parse(respostasRaw);
    } catch (e) {
      respostas = respostasRaw;
    }

    return this.portalCandidatoService.enviarDocumentos(
      classificacaoId,
      modeloId,
      respostas,
      arquivos,
    );
  }

  @Patch('finalizar/:id')
  @UseGuards(JwtAuthGuard)
  async finalizarEnvio(@Param('id') id: string, @Request() req: any) {
    return this.portalCandidatoService.finalizarEnvio(id, req.user.userId);
  }
}
