import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TrainerModule } from './trainer/trainer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Trainer } from './trainer/trainer.entity';
import { WorkoutPlanModule } from './workout-plan/workout-plan.module';
import { WorkoutPlan } from './workout-plan/workout-plan.entity';
import { ClientMetricsModule } from './client-metrics/client-metrics.module';
import { ClientMetric } from './client-metrics/client-metrics.entity';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/attendance.entity';

@Module({
    imports: [
        AuthModule, 
        UserModule, 
        TrainerModule, 
        WorkoutPlanModule, 
        ClientMetricsModule, 
        AttendanceModule, 

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'root',
            database: 'fitnesstrackerDB',
            entities: [
                User, 
                Trainer, 
                WorkoutPlan, 
                ClientMetric,
                Attendance
            ],
                synchronize: true,
        }),
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
