import { Test, TestingModule } from '@nestjs/testing';
import { ClientMetricsService } from './client-metrics.service';

describe('ClientMetricsService', () => {
  let service: ClientMetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientMetricsService],
    }).compile();

    service = module.get<ClientMetricsService>(ClientMetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
