import { ForbiddenException, Injectable } from '@nestjs/common';
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

    async addMetric(userId: number, dto: CreateClientMetricDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
    
        const metric = this.metricRepo.create({
            ...dto,
            user,
        });
    
        return this.metricRepo.save(metric);
    }
    

    async getMetrics(userId: number) {
        return this.metricRepo.find({
            where: { user: { id: userId } },
            order: { timestamp: 'DESC' },
        });
    }

    async getMetricsForTrainer(trainerUserId: number, clientId: number) {
        const trainer = await this.trainerRepo.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['user'],
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
