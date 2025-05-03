import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';
import { CreateMessageDto } from './DTO/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async sendMessage(senderId: number, dto: CreateMessageDto) {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: dto.receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or Receiver not found');
    }

    const message = this.messageRepo.create({ sender, receiver, content: dto.content });
    await this.messageRepo.save(message);

    // Simulate push notification
    console.log(`Push Notification: New message for ${receiver.name}`);

    return message;
  }

  async getMessages(userId: number, otherUserId: number) {
    const messages = await this.messageRepo.find({
        where: [
          { sender: { id: userId }, receiver: { id: otherUserId } },
          { sender: { id: otherUserId }, receiver: { id: userId } }
        ],
        relations: ['sender', 'receiver'],
        order: { timestamp: 'ASC' }
    });
    
    return messages.map(msg => ({
        senderName: msg.sender.name,
        senderRole: msg.sender.role,
        content: msg.content,
        timestamp: msg.timestamp,
    }));
  }
}
