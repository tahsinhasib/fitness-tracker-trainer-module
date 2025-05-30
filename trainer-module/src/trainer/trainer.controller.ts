import { Controller, Post, Get, Body, Req, UseGuards, Param, Patch, UsePipes } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user/user.entity';
import { AddClientDto } from './DTO/add-client.dto';



@Controller('trainer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerController {
    constructor(private trainerService: TrainerService) {}

    // for getting all trainers
    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.trainerService.findAll();
    }

    // View pending requests
    @Get('view-requests')
    @Roles(Role.TRAINER)
    getPendingRequests(@Req() req) {
        return this.trainerService.getPendingRequests(req.user.userId);
    }

    // Approve client request
    @Post('approve-client')
    @Roles(Role.TRAINER)
    approveClient(@Req() req, @Body() body: { clientId: number }) {
        return this.trainerService.approveClient(req.user.userId, body.clientId);
    }

    // View approved clients
    @Get('clients')
    @Roles(Role.TRAINER)
    getClients(@Req() req) {
        return this.trainerService.getClients(req.user.userId);
    }

    @Post('remove-client')
    @Roles(Role.TRAINER)
    removeClient(@Req() req, @Body() body: { clientId: number }) {
        return this.trainerService.removeClient(req.user.userId, body.clientId);
    }
}
