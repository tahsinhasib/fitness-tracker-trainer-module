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
    // async addMetric(userId: number, dto: CreateClientMetricDto) {
    //     const user = await this.userRepo.findOne({ where: { id: userId } });
    //     if (!user) {
    //         throw new Error('User not found');
    //     }
    
    //     let existingMetric = await this.metricRepo.findOne({ where: { user: { id: userId } } });

    //     if (existingMetric) {
    //         // Update existing record
    //         existingMetric = {
    //             ...existingMetric,
    //             ...dto,
    //             timestamp: new Date(), // optional: update timestamp
    //         };
    //         const updated = await this.metricRepo.save(existingMetric);
    //         return {
    //             message: 'Metrics data updated successfully!',
    //             // displaying data is optional, uncomment if needed
    //             // data: updated,
    //         };
    //     } else {
    //         // Create new record
    //         const metric = this.metricRepo.create({
    //             ...dto,
    //             user,
    //         });
    //         const created = await this.metricRepo.save(metric);
    //         return {
    //             message: 'Metrics data submitted successfully!',
    //             // displaying data is optional, uncomment if needed
    //             // data: created,
    //         };
    //     }
    // }

    // Add a new metric for a specific user
    async addMetric(userId: number, dto: CreateClientMetricDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Always create a new metric entry
        const metric = this.metricRepo.create({
            ...dto,
            user,
            timestamp: new Date(), // optional, override if not set in dto
        });

        const created = await this.metricRepo.save(metric);
        return {
            message: 'Metrics data submitted successfully!',
            // data: created, // Uncomment if you want to return the newly created record
        };
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


    private analyzeClientMetrics(metrics: ClientMetric[]): string[] {
        const suggestions: string[] = [];
        const latest = metrics[0];
        const previous = metrics[1];
    
        if (latest.heartRate > 100) suggestions.push('High resting heart rate. Consider medical consultation.');
        if (latest.bloodPressure && latest.bloodPressure.startsWith('140')) suggestions.push('Elevated blood pressure. Monitor regularly.');
        if (previous && latest.weight < previous.weight - 2)
            suggestions.push('Sudden weight loss detected. Ensure proper nutrition.');
        if (metrics.length < 3) suggestions.push('Not enough data for full trend analysis. Please input more data regularly.');
        if (metrics.length >= 5) {
            const last5 = metrics.slice(0, 5);
            const avgCalories = last5.reduce((sum, m) => sum + m.caloriesBurned, 0) / 5;
            if (avgCalories < 300)
                suggestions.push('Low average calories burned in last 5 sessions. Try increasing workout intensity.');
        }
    
        return suggestions;
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
            order: { timestamp: 'ASC' },
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


        // Header
        doc
            .fontSize(22)
            .fillColor('#1f4e79')
            .text(`Fitness Analytics Report`, { align: 'center' })
            .moveDown(0.5);
    
        doc
            .fontSize(14)
            .fillColor('#000')
            .text(`Client: ${metrics[0].user.name}`, { align: 'center' })
            .moveDown(1);
    
        // Draw line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#aaa').stroke().moveDown();
    
        metrics.forEach((m, index) => {
            doc
              .fontSize(12)
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


        // ---- Smart Insights Feedback ----
        const insights = this.analyzeClientMetrics(metrics);
        if (insights.length) {
            doc.addPage();

            doc.fontSize(18)
                .fillColor('#e63946')
                .text('Health Insights & Suggestions', { align: 'center', underline: true })
                .moveDown(1);

            insights.forEach((suggestion, i) => {
                doc.fontSize(12)
                    .fillColor('#000')
                    .text(`• ${suggestion}`, {
                        width: 500,
                        align: 'left',
                        indent: 20,
                    })
                    .moveDown(0.5);
            });
        }
          
    
        doc.end();
    
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(`Report saved as ${fileName}`));
            stream.on('error', reject);
        });
    }


    async generateGraphHtmlReport(userId: number): Promise<string> {
    const metrics = await this.metricRepo.find({
        where: { user: { id: userId } },
        relations: ['user'],
        order: { timestamp: 'ASC' },
    });

    if (!metrics.length) {
        throw new NotFoundException('No metrics found for this user');
    }

    const fileName = `user-${userId}-graph-report.html`;
    const filePath = path.join(__dirname, '..', '..', 'reports', fileName);

    const labels = metrics.map(m => new Date(m.timestamp).toLocaleDateString());
    const weights = metrics.map(m => m.weight);
    const heartRates = metrics.map(m => m.heartRate);
    const calories = metrics.map(m => m.caloriesBurned);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Client Metrics Graph Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            canvas { margin-bottom: 40px; }
            h2 { color: #1f4e79; }
        </style>
    </head>
    <body>
        <h2>Fitness Metrics Report for ${metrics[0].user.name}</h2>

        <canvas id="weightChart" width="600" height="200"></canvas>
        <canvas id="heartRateChart" width="600" height="200"></canvas>
        <canvas id="caloriesChart" width="600" height="200"></canvas>

        <script>
            const labels = ${JSON.stringify(labels)};

            new Chart(document.getElementById('weightChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Weight (kg)',
                        data: ${JSON.stringify(weights)},
                        borderColor: '#36a2eb',
                        fill: false,
                        tension: 0.3
                    }]
                }
            });

            new Chart(document.getElementById('heartRateChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Heart Rate (bpm)',
                        data: ${JSON.stringify(heartRates)},
                        borderColor: '#ff6384',
                        fill: false,
                        tension: 0.3
                    }]
                }
            });

            new Chart(document.getElementById('caloriesChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Calories Burned',
                        data: ${JSON.stringify(calories)},
                        borderColor: '#4bc0c0',
                        fill: false,
                        tension: 0.3
                    }]
                }
            });
        </script>
    </body>
    </html>
    `;

        fs.writeFileSync(filePath, htmlContent);
        return `Graph HTML report saved as ${fileName}`;
    }

}


