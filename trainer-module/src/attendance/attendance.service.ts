import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { MarkAttendanceDto } from './DTO/mark-attendance.dto';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttendanceService {

    constructor(
        @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
        @InjectRepository(User) private userRepo: Repository<User>
    ) {}

    // Mark attendance for a client
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



    private async generateExcelReport(clientId: number): Promise<string> {
        const attendanceData = await this.attendanceRepo.find({
            where: { client: { id: clientId } },
            relations: ['client'],
            order: { markedAt: 'ASC' },
        });

        if (!attendanceData || attendanceData.length === 0) {
            throw new Error('No attendance data found for this client');
        }

        const reportsDir = path.join(__dirname, '..', '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const fileName = `user-${clientId}-attendance-report.xlsx`;
        const filePath = path.join(reportsDir, fileName);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Attendance Report');

        sheet.columns = [
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        attendanceData.forEach((entry) => {
            sheet.addRow({
                date: new Date(entry.markedAt).toLocaleString(),
                status: entry.attended,
            });
        });

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }


    async downloadExcelReport(clientId: number): Promise<StreamableFile> {
        // Generate the report first
        const filePath = await this.generateExcelReport(clientId); 
    
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);
    
        return new StreamableFile(fileStream, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: `attachment; filename="${fileName}"`,
        });
    }
    
}