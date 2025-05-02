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

@Module({
    imports: [AuthModule, UserModule, TrainerModule, WorkoutPlanModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'fitnesstrackerDB',
    entities: [
        User, Trainer, WorkoutPlan,
    ],
        synchronize: true,
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
