import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';                                                                     //pdf
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
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async addMetric(@Req() req, @Body() dto: CreateClientMetricDto) {
        return this.metricsService.addMetric(req.user.userId, dto);
    }

    // Delete metric by id
    @Delete('delete')
    @Roles(Role.USER)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async deleteMyMetric(@Req() req) {
        return this.metricsService.deleteMetricByUserId(req.user.userId);
    }

    // Get all metrics for a user
    @Get('display-metrics')
    @Roles(Role.USER)
    async getMetrics(@Req() req) {
        return this.metricsService.getMetrics(req.user.userId);
    }

    // Get all metrics for a trainer
    @Get('client/:clientId')
    @Roles(Role.TRAINER)
    async getClientMetrics(@Param('clientId') clientId: number, @Req() req) {
        return this.metricsService.getMetricsForTrainer(req.user.userId, clientId);
    }

    // PDF report generation
    @Get('generate-report')
    @Roles(Role.USER)
    async generateReport(@Req() req) {
    return this.metricsService.generateReport(req.user.userId);
    }

    //Generate Chart
    @Get('generate-graph-report')
    @Roles(Role.USER)
    async generateGraphReport(@Req() req) {
        return this.metricsService.generateGraphHtmlReport(req.user.userId);
    }


}
