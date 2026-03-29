import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NoticiasModule } from './noticias/noticias.module';
import { EditaisModule } from './editais/editais.module';
import { FormulariosModule } from './formularios/formularios.module';
import { EnviosModule } from './envios/envios.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ClassificacaoModule } from './classificacao/classificacao.module';
import { ModalidadesConcorrenciaModule } from './modalidades-concorrencia/modalidades-concorrencia.module';
import { CargosModule } from './cargos/cargos.module';
import { AreasAtuacaoModule } from './areas-atuacao/areas-atuacao.module';
import { VagasEditalModule } from './vagas-edital/vagas-edital.module';
import { CertamesModule } from './certames/certames.module';
import { CarreirasModule } from './carreiras/carreiras.module';
import { NiveisModule } from './niveis/niveis.module';
import { RegimesModule } from './regimes/regimes.module';
import { ConvocacaoModule } from './convocacao/convocacao.module';
import { PortalCandidatoModule } from './portal-candidato/portal-candidato.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConvocacoesModule } from './convocacoes/convocacoes.module';
import { RolesModule } from './roles/roles.module';
import { ConfiguracaoModule } from './configuracao/configuracao.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    EditaisModule,
    FormulariosModule,
    EnviosModule,
    NoticiasModule,
    UsuarioModule,
    ClassificacaoModule,
    ModalidadesConcorrenciaModule,
    CargosModule,
    AreasAtuacaoModule,
    VagasEditalModule,
    CertamesModule,
    CarreirasModule,
    NiveisModule,
    RegimesModule,
    ConvocacaoModule,
    PortalCandidatoModule,
    ConvocacoesModule,
    RolesModule,
    ConfiguracaoModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
