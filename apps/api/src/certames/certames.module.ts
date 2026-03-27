import { Module } from '@nestjs/common';
import { CertamesService } from './certames.service';
import { CertamesController } from './certames.controller';

@Module({
  controllers: [CertamesController],
  providers: [CertamesService],
  exports: [CertamesService],
})
export class CertamesModule {}
