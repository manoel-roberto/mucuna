import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-mail')
  async testMail() {
    return await this.mailService.sendConvocacao(
      'candidato@test.com',
      new Date(),
      'Edital Teste',
    );
  }
}
