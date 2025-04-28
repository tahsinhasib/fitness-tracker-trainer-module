import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class TrainerService {
    constructor(@InjectRepository(Trainer) private trainerRepository: Repository<Trainer>){}
    

    // for creating a trainer specialization
    async createTrainer(user: any, specialization: string) {
        const trainer = this.trainerRepository.create({specialization, user: { id: user.userId }   
        });
        return await this.trainerRepository.save(trainer);
    }
    
    
    async findAll() {
        return await this.trainerRepository.find({ relations: ['user'] });
    }

    // for adding a client to a trainer
    async addClient(trainerId: number, clientId: number) {
        const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
        if (!trainer) {
            throw new Error('Trainer not found');
        }
    
        const client = await this.trainerRepository.manager.findOne(User, { where: { id: clientId } });
        if (!client) {
            throw new Error('Client not found');
        }
    
        trainer.client = client;
        return await this.trainerRepository.save(trainer);
    }
    
}
