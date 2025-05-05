import { Controller, Post, Get, Body, Param, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './DTO/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private chatService: ChatService
    ) {}

    // Send a message
    @Post('send')
    @Roles(Role.USER, Role.TRAINER)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    sendMessage(@Req() req, @Body() dto: CreateMessageDto) {
        return this.chatService.sendMessage(req.user.userId, dto);
    }

    // Get chat history with a specific user
    @Get('history/:otherUserId')
    @Roles(Role.USER, Role.TRAINER)
    getHistory(@Req() req, @Param('otherUserId') otherUserId: number) {
        return this.chatService.getMessages(req.user.userId, otherUserId);
    }
}
