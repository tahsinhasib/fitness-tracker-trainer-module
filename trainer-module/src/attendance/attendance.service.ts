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
    

    async getHeatmapHtml(clientId: number): Promise<string> {
    const records = await this.attendanceRepo.find({
        where: { client: { id: clientId } },
        order: { sessionDate: 'ASC' },
    });

    const attendanceData = records.map(record => ({
        date: record.sessionDate.toISOString().split('T')[0],
        attended: record.attended,
    }));

    const attendanceJson = JSON.stringify(attendanceData);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Attendance Heatmap</title>
    <style>
        .heatmap {
        display: grid;
        grid-template-columns: repeat(7, 30px);
        gap: 4px;
        max-width: 240px;
        margin: 0 auto;
        }
        .day {
        width: 30px;
        height: 30px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        cursor: pointer;
        }
        .attended { background-color: #4caf50; }
        .missed { background-color: #f44336; }
        .no-session { background-color: #e0e0e0; }
        .tooltip {
        position: absolute;
        background: #333;
        color: #fff;
        padding: 5px;
        font-size: 12px;
        display: none;
        pointer-events: none;
        }
    </style>
    </head>
    <body>

    <h2 style="text-align:center">Attendance Heatmap</h2>
    <div class="heatmap" id="heatmap"></div>
    <div class="tooltip" id="tooltip"></div>

    <script>
    const attendanceData = ${attendanceJson};

    const attendanceMap = {};
    attendanceData.forEach(entry => {
        attendanceMap[entry.date] = entry.attended;
    });

    const heatmapEl = document.getElementById('heatmap');
    const tooltip = document.getElementById('tooltip');

    const startDate = new Date(attendanceData[0]?.date || new Date());
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 29); // Show 30 days

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const status = attendanceMap.hasOwnProperty(dateStr)
        ? (attendanceMap[dateStr] ? 'attended' : 'missed')
        : 'no-session';

        const dayDiv = document.createElement('div');
        dayDiv.className = \`day \${status}\`;
        dayDiv.title = \`\${dateStr} - \${status}\`;

        dayDiv.addEventListener('mouseover', e => {
        tooltip.style.display = 'block';
        tooltip.textContent = \`\${dateStr} - \${status}\`;
        tooltip.style.left = \`\${e.pageX + 10}px\`;
        tooltip.style.top = \`\${e.pageY - 10}px\`;
        });

        dayDiv.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
        });

        heatmapEl.appendChild(dayDiv);
    }
    </script>

    </body>
    </html>
    `;

        return html;
    }

}