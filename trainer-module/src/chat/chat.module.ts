import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { User } from '../user/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, User])
    ],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule {}
