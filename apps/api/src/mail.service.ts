import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Para simplificar a verificação de log (conforme a especificação), usamos o jsonTransport
    this.transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  async sendConvocacao(email: string, prazoEnvio: Date, editalNome: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"UEFS Mucunã" <no-reply@uefs.br>',
      to: email,
      subject: `Mucunã - Sistema de Convocação para envio de documentos - ${editalNome}`,
      text: `Olá! Você foi convocado(a) para o edital ${editalNome}. Prazo: ${prazoEnvio.toISOString()}.`,
      html: `<h3>Parabéns pela convocação!</h3><p>Você foi convocado(a) para o edital <strong>${editalNome}</strong>.</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `E-mail SIMULADO enviado para ${email}. Conteúdo JSON exportado.`,
      );
      return info;
    } catch (error) {
      this.logger.error(`Falha ao simular envio de e-mail`, error.stack);
      throw error;
    }
  }
}
