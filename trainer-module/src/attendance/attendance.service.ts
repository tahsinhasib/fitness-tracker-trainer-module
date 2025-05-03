import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { MarkAttendanceDto } from './DTO/mark-attendance.dto';

@Injectable()
export class AttendanceService {

    constructor(
        @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
        @InjectRepository(User) private userRepo: Repository<User>
    ) {}

    async markAttendance(clientId: number, dto: MarkAttendanceDto) {
        const client = await this.userRepo.findOne({ where: { id: clientId } });
        if (!client) throw new NotFoundException('Client not found');

        const record = this.attendanceRepo.create({
        client,
        sessionDate: new Date(dto.sessionDate),
        attended: dto.attended,
        });

        return this.attendanceRepo.save(record);
    }


    async getAnalytics(clientId: number) {
        const records = await this.attendanceRepo.find({
          where: { client: { id: clientId } },
        });
      
        const totalSessions = records.length;
        const attendedSessions = records.filter(r => r.attended).length;
        const missedSessions = totalSessions - attendedSessions;
        const attendancePercentage = totalSessions > 0
          ? ((attendedSessions / totalSessions) * 100).toFixed(2)
          : '0.00';
      
        return {
          totalSessions,
          attendedSessions,
          missedSessions,
          attendancePercentage: `${attendancePercentage}%`,
        };
    }
}