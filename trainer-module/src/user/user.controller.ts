import { Controller, Post, Body, UseGuards, Req, ValidationPipe, UsePipes, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { TrainerService } from 'src/trainer/trainer.service';
import { RequestTrainerDto } from './DTO/request-trainer.dto';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './DTO/update-user-profile.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly usersService: UserService, 
        private readonly trainerService: TrainerService) {}
    
    @Post('request-trainer')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Roles(Role.USER)
    async requestTrainer(@Req() req, @Body() body: RequestTrainerDto) {
        return this.trainerService.requestTrainer(req.user.userId, body.trainerId);
    }


    @Patch('update-profile/:id')
    async updateProfile(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserProfileDto,
    ) {
        return this.usersService.updateProfile(id, dto);
    }
}
