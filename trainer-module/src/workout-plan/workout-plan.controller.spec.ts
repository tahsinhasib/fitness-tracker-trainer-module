import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlanController } from './workout-plan.controller';

describe('WorkoutPlanController', () => {
  let controller: WorkoutPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlanController],
    }).compile();

    controller = module.get<WorkoutPlanController>(WorkoutPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
