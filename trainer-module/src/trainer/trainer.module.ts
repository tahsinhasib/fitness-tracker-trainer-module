import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './trainer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Trainer])],
  providers: [TrainerService],
  controllers: [TrainerController]
})
export class TrainerModule {}
