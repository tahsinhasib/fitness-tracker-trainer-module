import { Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AttendanceService } from './attendance.service';
import { Role } from 'src/user/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { MarkAttendanceDto } from './DTO/mark-attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
    ) {}


    @Post(':clientId')
    @Roles(Role.TRAINER)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    mark(@Param('clientId') clientId: number, @Body() dto: MarkAttendanceDto) {
        return this.attendanceService.markAttendance(clientId, dto);
    }
    
    @Get(':clientId/analytics')
    @Roles(Role.TRAINER)
    getAnalytics(@Param('clientId') clientId: number) {
        return this.attendanceService.getAnalytics(clientId);
    }

    @Get(':clientId/excel-report')
    @Roles(Role.TRAINER)
    downloadExcelReport(@Param('clientId') clientId: number) {
        return this.attendanceService.downloadExcelReport(clientId);
    }



}
