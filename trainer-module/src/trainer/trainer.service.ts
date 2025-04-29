import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class TrainerService {
    constructor(@InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    @InjectRepository(User) private userRepository: Repository<User>
){}
    

    // for creating a trainer specialization
    async createTrainer(user: any, specialization: string) {
        const trainer = this.trainerRepository.create({specialization, user: { id: user.userId }   
        });
        return await this.trainerRepository.save(trainer);
    }
    
    
    async findAll() {
        return await this.trainerRepository.find({ relations: ['user'] });
    }

    // Request trainer
async requestTrainer(clientId: number, trainerId: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { id: trainerId },
      relations: ['pendingClients']
    });
  
    const client = await this.userRepository.findOne({ where: { id: clientId } });
  
    if (!trainer || !client) throw new Error('Trainer or client not found');
  
    if (trainer.pendingClients.some(c => c.id === clientId)) {
      throw new Error('Already requested');
    }
  
    trainer.pendingClients.push(client);
    return await this.trainerRepository.save(trainer);
  }
  
  // Get pending requests
  async getPendingRequests(trainerUserId: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { user: { id: trainerUserId } },
      relations: ['pendingClients']
    });
    return trainer?.pendingClients ?? [];
  }
  
  // Approve client
  async approveClient(trainerUserId: number, clientId: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { user: { id: trainerUserId } },
      relations: ['pendingClients', 'clients']
    });
  
    if (!trainer) throw new Error('Trainer not found');
  
    const client = trainer.pendingClients.find(c => c.id === clientId);
    if (!client) throw new Error('Client not in pending list');
  
    // Remove from pending and add to clients
    trainer.pendingClients = trainer.pendingClients.filter(c => c.id !== clientId);
    trainer.clients.push(client);
  
    return await this.trainerRepository.save(trainer);
  }
  
  // Get approved clients
  async getClients(trainerUserId: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { user: { id: trainerUserId } },
      relations: ['clients']
    });
  
    return trainer?.clients ?? [];
  }
    
}
