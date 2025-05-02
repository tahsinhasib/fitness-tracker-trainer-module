import { Test, TestingModule } from '@nestjs/testing';
import { ClientMetricsController } from './client-metrics.controller';

describe('ClientMetricsController', () => {
  let controller: ClientMetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientMetricsController],
    }).compile();

    controller = module.get<ClientMetricsController>(ClientMetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
