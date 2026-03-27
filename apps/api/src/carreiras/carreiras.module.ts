import { Module } from '@nestjs/common';
import { CarreirasService } from './carreiras.service';
import { CarreirasController } from './carreiras.controller';

@Module({
  controllers: [CarreirasController],
  providers: [CarreirasService],
  exports: [CarreirasService],
})
export class CarreirasModule {}
