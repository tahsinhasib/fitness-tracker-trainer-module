import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './trainer.entity';
import { User } from 'src/user/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Trainer, User])
    ],
    providers: [TrainerService],
    controllers: [TrainerController],
    exports: [TrainerService]
})
export class TrainerModule {}
