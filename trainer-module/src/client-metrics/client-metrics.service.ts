import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientMetric } from './client-metrics.entity';
import { CreateClientMetricDto } from './DTO/create-client-metric.dto';
import { User } from '../user/user.entity';
import { Trainer } from 'src/trainer/trainer.entity';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClientMetricsService {
    constructor(
        @InjectRepository(ClientMetric) private metricRepo: Repository<ClientMetric>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Trainer) private trainerRepo: Repository<Trainer>,
    ) {}

    // Add a new metric for a specific user
    async addMetric(userId: number, dto: CreateClientMetricDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
    
        let existingMetric = await this.metricRepo.findOne({ where: { user: { id: userId } } });

        if (existingMetric) {
            // Update existing record
            existingMetric = {
                ...existingMetric,
                ...dto,
                timestamp: new Date(), // optional: update timestamp
            };
            const updated = await this.metricRepo.save(existingMetric);
            return {
                message: 'Metrics data updated successfully!',
                // displaying data is optional, uncomment if needed
                // data: updated,
            };
        } else {
            // Create new record
            const metric = this.metricRepo.create({
                ...dto,
                user,
            });
            const created = await this.metricRepo.save(metric);
            return {
                message: 'Metrics data submitted successfully!',
                // displaying data is optional, uncomment if needed
                // data: created,
            };
        }
    }

    async deleteMetricByUserId(userId: number) {
        const metric = await this.metricRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    
        if (!metric) {
            throw new NotFoundException('No metrics data found for this user');
        }
    
        await this.metricRepo.delete({ user: { id: userId } });
    
        return { message: 'Metrics data deleted successfully' };
    }
    
    

    // Get all metrics for a specific user
    async getMetrics(userId: number) {
        const metrics = await this.metricRepo.find({
            where: { user: { id: userId } },
            order: { timestamp: 'DESC' },
            relations: ['user'],
        });
        return metrics.map(metric => ({
            id: metric.id,
            weight: metric.weight,
            height: metric.height,
            heartRate: metric.heartRate,
            bloodPressure: metric.bloodPressure,
            caloriesBurned: metric.caloriesBurned,
            notes: metric.notes,
            timestamp: metric.timestamp,
            user: {
                id: metric.user.id,
                name: metric.user.name,
            }
        }));
    }
    
    // Get all metrics for a specific client assigned to a trainer
    async getMetricsForTrainer(trainerUserId: number, clientId: number) {
        const trainer = await this.trainerRepo.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['clients', 'user'],
        });
    
        if (!trainer || !trainer.clients.some(client => client.id === Number(clientId))) {
            throw new ForbiddenException('This client is not assigned to you');
        }
    
        return this.metricRepo.find({
            where: { user: { id: clientId } },
            order: { timestamp: 'DESC' }
        });
    }


    // Generate pdf report
    async generateReport(userId: number): Promise<string> {
        const metrics = await this.metricRepo.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { timestamp: 'DESC' },
        });
    
        if (!metrics || metrics.length === 0) {
            throw new NotFoundException('No metrics found for this user');
        }
    
        const reportsDir = path.join(__dirname, '..', '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }
    
        const fileName = `user-${userId}-metrics-report.pdf`;
        const filePath = path.join(reportsDir, fileName);
    
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);


        const logoPath = path.join(__dirname, '..', 'assets', 'signature_1.png');

        // Header
        doc
            .fontSize(22)
            .fillColor('#1f4e79')
            .text(`Fitness Analytics Report`, { align: 'center' })
            .moveDown(0.5);
    
        doc
            .fontSize(16)
            .fillColor('#000')
            .text(`Client: ${metrics[0].user.name}`, { align: 'center' })
            .moveDown(1);
    
        // Draw line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#aaa').stroke().moveDown();
    
        metrics.forEach((m, index) => {
            doc
              .fontSize(14)
              .fillColor('#1f4e79')
              .text(`Entry #${index + 1}`, {
                underline: true,
                align: 'center'
              })
              .moveDown(0.5);
          
            const pageWidth = doc.page.width;
            const tableWidth = 400;
            const tableLeftX = (pageWidth - tableWidth) / 2;
            const rowHeight = 24;
            const col1Width = 150;
            const col2Width = tableWidth - col1Width;
            const tableTopY = doc.y;
          
            const rows = [
              ['Weight', `${m.weight} kg`],
              ['Height', `${m.height} cm`],
              ['Heart Rate', `${m.heartRate} bpm`],
              ['Blood Pressure', m.bloodPressure],
              ['Calories Burned', `${m.caloriesBurned}`],
              ['Notes', m.notes || 'N/A'],
              ['Date', new Date(m.timestamp).toLocaleString()],
            ];
          
            rows.forEach((row, rowIndex) => {
              const y = tableTopY + rowIndex * rowHeight;
          
              // Draw bordered row
              doc
                .rect(tableLeftX, y, tableWidth, rowHeight)
                .strokeColor('#999')
                .stroke();
          
              // Left column (label)
              doc
                .fontSize(12)
                .fillColor('#000')
                .text(row[0], tableLeftX, y + 6, {
                  width: col1Width,
                  align: 'center'
                });
          
              // Right column (value)
              doc
                .fontSize(12)
                .fillColor('#000')
                .text(row[1], tableLeftX + col1Width, y + 6, {
                  width: col2Width,
                  align: 'center'
                });
            });
          
            doc.moveDown(1.5);
        });
          
    
        doc.end();
    
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(`Report saved as ${fileName}`));
            stream.on('error', reject);
        });
    }
}
