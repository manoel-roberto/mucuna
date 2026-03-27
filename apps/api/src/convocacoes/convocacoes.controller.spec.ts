import { Test, TestingModule } from '@nestjs/testing';
import { ConvocacoesController } from './convocacoes.controller';

describe('ConvocacoesController', () => {
  let controller: ConvocacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvocacoesController],
    }).compile();

    controller = module.get<ConvocacoesController>(ConvocacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
