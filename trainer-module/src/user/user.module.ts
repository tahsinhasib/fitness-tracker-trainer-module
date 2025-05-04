import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { TrainerModule } from 'src/trainer/trainer.module';
import { Trainer } from 'src/trainer/trainer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Trainer]),
        TrainerModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
