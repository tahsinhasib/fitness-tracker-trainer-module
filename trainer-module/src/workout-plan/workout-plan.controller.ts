import { Controller, Post, Get, Body, Req, UseGuards, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { WorkoutPlanService } from './workout-plan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { CreateWorkoutPlanDto } from './DTO/create-workout-plan.dto';

@Controller('workout-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutPlanController {
    constructor(private readonly workoutPlanService: WorkoutPlanService) {}

    @Post('create')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Roles(Role.TRAINER)
    create(@Req() req, @Body() dto: CreateWorkoutPlanDto) {
        return this.workoutPlanService.createWorkoutPlan(req.user.userId, dto);
    }

    @Get('trainer/:trainerUserId')
    getPlansByTrainer(@Param('trainerUserId') trainerUserId: number) {
        return this.workoutPlanService.getPlansByTrainer(trainerUserId);
    }


    @Get('client/:clientId')
    getPlansByClient(@Param('clientId') clientId: number) {
        return this.workoutPlanService.getPlansByClient(clientId);
    }

}
