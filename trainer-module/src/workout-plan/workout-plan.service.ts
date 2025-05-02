import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { User } from '../user/user.entity';
import { Trainer } from '../trainer/trainer.entity';
import { CreateWorkoutPlanDto } from './DTO/create-workout-plan.dto';

@Injectable()
export class WorkoutPlanService {
    constructor(
        @InjectRepository(WorkoutPlan) private workoutPlanRepo: Repository<WorkoutPlan>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Trainer) private trainerRepo: Repository<Trainer>,
    ) {}

    async createWorkoutPlan(trainerUserId: number, dto: CreateWorkoutPlanDto) {
        const trainer = await this.trainerRepo.findOne({ where: { user: { id: trainerUserId } } });
        if (!trainer) throw new NotFoundException('Trainer not found');
    
        const client = await this.userRepo.findOne({ where: { id: dto.clientId } });
        if (!client) throw new NotFoundException('Client not found');


        // Check if the trainer has an existing relationship with the client (either approved or pending)
        const trainerHasClient = await this.trainerRepo
        .createQueryBuilder('trainer')
        .leftJoinAndSelect('trainer.clients', 'client')
        .leftJoinAndSelect('trainer.pendingClients', 'pendingClient')
        .where('trainer.id = :trainerId', { trainerId: trainer.id })
        .andWhere('client.id = :clientId OR pendingClient.id = :clientId', { clientId: client.id })
        .getOne();

        if (!trainerHasClient) {
            throw new ForbiddenException('You cannot create a workout plan for this client');
        }
    
        const plan = this.workoutPlanRepo.create({
            ...dto,
            trainer,
            client,
        });
    
        const savedPlan = await this.workoutPlanRepo.save(plan);
    
        // Return only selected fields
        return {
            id: savedPlan.id,
            title: savedPlan.title,
            description: savedPlan.description,
            routine: savedPlan.routine,
            startDate: savedPlan.startDate,
            endDate: savedPlan.endDate,
            client: {
                id: client.id,
                name: client.name,
            },
        };
    }
    

    async getPlansByTrainer(trainerUserId: number) {
        const plans = await this.workoutPlanRepo.find({
            where: { trainer: { user: { id: trainerUserId } } },
            relations: ['client'],
        });
    
        return plans.map(plan => ({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            routine: plan.routine,
            startDate: plan.startDate,
            endDate: plan.endDate,
            client: {
                id: plan.client.id,
                name: plan.client.name,
            },
        }));
    }
    
    

    async getPlansByClient(clientId: number) {
        const plans = await this.workoutPlanRepo.find({
            where: { client: { id: clientId } },
            relations: ['trainer', 'trainer.user'],
        });
    
        return plans.map(plan => ({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            routine: plan.routine,
            startDate: plan.startDate,
            endDate: plan.endDate,
            trainer: {
                id: plan.trainer.id,
                name: plan.trainer.user.name,
            },
        }));
    }
    
}
