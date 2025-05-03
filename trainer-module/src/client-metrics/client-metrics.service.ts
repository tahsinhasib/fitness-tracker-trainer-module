import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientMetric } from './client-metrics.entity';
import { CreateClientMetricDto } from './DTO/create-client-metric.dto';
import { User } from '../user/user.entity';
import { Trainer } from 'src/trainer/trainer.entity';

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
}
