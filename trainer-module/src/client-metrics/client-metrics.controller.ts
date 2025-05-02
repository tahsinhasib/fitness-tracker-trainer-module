import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../user/user.entity';
import { ClientMetricsService } from './client-metrics.service';
import { CreateClientMetricDto } from './DTO/create-client-metric.dto';

@Controller('client-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientMetricsController {
    constructor(private readonly metricsService: ClientMetricsService) {}

    @Post('add-metrics')
    @Roles(Role.USER)
    async addMetric(@Req() req, @Body() dto: CreateClientMetricDto) {
        return this.metricsService.addMetric(req.user.userId, dto);
    }

    @Get('display-metrics')
    @Roles(Role.USER)
    async getMetrics(@Req() req) {
        return this.metricsService.getMetrics(req.user.userId);
    }

    @Get('client/:clientId')
    @Roles(Role.TRAINER)
    async getClientMetrics(@Param('clientId') clientId: number, @Req() req) {
        return this.metricsService.getMetricsForTrainer(req.user.userId, clientId);
    }

}
