import { Module } from '@nestjs/common';
import { RegimesService } from './regimes.service';
import { RegimesController } from './regimes.controller';

@Module({
  controllers: [RegimesController],
  providers: [RegimesService],
  exports: [RegimesService],
})
export class RegimesModule {}
