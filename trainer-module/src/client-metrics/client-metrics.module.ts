import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientMetric } from './client-metrics.entity';
import { ClientMetricsService } from './client-metrics.service';
import { ClientMetricsController } from './client-metrics.controller';
import { User } from '../user/user.entity';
import { Trainer } from 'src/trainer/trainer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ClientMetric, User, Trainer])
    ],
    providers: [ClientMetricsService],
    controllers: [ClientMetricsController],
})
export class ClientMetricsModule {}
