import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { WorkoutPlanService } from './workout-plan.service';
import { WorkoutPlanController } from './workout-plan.controller';
import { Trainer } from '../trainer/trainer.entity';
import { User } from '../user/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([WorkoutPlan, Trainer, User])],
    providers: [WorkoutPlanService],
    controllers: [WorkoutPlanController],
     exports: [WorkoutPlanService],
})
export class WorkoutPlanModule {}
