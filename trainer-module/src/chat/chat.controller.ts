import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './DTO/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('send')
  sendMessage(@Req() req, @Body() dto: CreateMessageDto) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  @Get('history/:otherUserId')
  getHistory(@Req() req, @Param('otherUserId') otherUserId: number) {
    return this.chatService.getMessages(req.user.userId, otherUserId);
  }
}
