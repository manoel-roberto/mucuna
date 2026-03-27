import { Test, TestingModule } from '@nestjs/testing';
import { AreasAtuacaoController } from './areas-atuacao.controller';

describe('AreasAtuacaoController', () => {
  let controller: AreasAtuacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AreasAtuacaoController],
    }).compile();

    controller = module.get<AreasAtuacaoController>(AreasAtuacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
