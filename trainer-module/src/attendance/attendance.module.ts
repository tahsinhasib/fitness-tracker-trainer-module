import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { User } from 'src/user/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance, User])
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService]
})
export class AttendanceModule {}
