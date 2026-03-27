import { Test, TestingModule } from '@nestjs/testing';
import { ConvocacoesService } from './convocacoes.service';

describe('ConvocacoesService', () => {
  let service: ConvocacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvocacoesService],
    }).compile();

    service = module.get<ConvocacoesService>(ConvocacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
