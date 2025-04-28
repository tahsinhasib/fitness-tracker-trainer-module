import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user/user.entity';

@Controller('trainer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerController {
  constructor(private trainerService: TrainerService) {}

  @Post('create')
  @Roles(Role.TRAINER)
  createTrainer(@Req() req, @Body() body: { specialization: string }) {
    return this.trainerService.createTrainer(req.user, body.specialization);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.trainerService.findAll();
  }
}
