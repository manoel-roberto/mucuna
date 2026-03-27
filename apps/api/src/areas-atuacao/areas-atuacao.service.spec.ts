import { Test, TestingModule } from '@nestjs/testing';
import { AreasAtuacaoService } from './areas-atuacao.service';

describe('AreasAtuacaoService', () => {
  let service: AreasAtuacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AreasAtuacaoService],
    }).compile();

    service = module.get<AreasAtuacaoService>(AreasAtuacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
