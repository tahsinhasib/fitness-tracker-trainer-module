import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlanService } from './workout-plan.service';

describe('WorkoutPlanService', () => {
  let service: WorkoutPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutPlanService],
    }).compile();

    service = module.get<WorkoutPlanService>(WorkoutPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
