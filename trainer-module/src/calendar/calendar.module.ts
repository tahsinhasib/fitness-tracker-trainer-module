// app.module.ts or src/calendar/calendar.module.ts
import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { WorkoutPlanModule } from '../workout-plan/workout-plan.module';

@Module({
  imports: [WorkoutPlanModule],
  controllers: [CalendarController],
})
export class CalendarModule {}
