import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class TrainerService {
    constructor(@InjectRepository(Trainer) private trainerRepository: Repository<Trainer>){}
    
    
    // async createTrainer(user: User, specialization: string) {
    //     const trainer = this.trainerRepository.create({ user, specialization });
    //     return await this.trainerRepository.save(trainer);
    //   }

    async createTrainer(user: any, specialization: string) {
        const trainer = this.trainerRepository.create({
            specialization,
            user: { id: user.userId }   
        });
        return await this.trainerRepository.save(trainer);
    }
    
    
      async findAll() {
        return await this.trainerRepository.find({ relations: ['user'] });
      }
}
