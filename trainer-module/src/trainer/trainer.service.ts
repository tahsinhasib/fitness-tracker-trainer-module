import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class TrainerService {
    constructor(
        @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>, 
        @InjectRepository(User) private userRepository: Repository<User>
    ){}
    

    // for creating a trainer specialization
    async createTrainer(user: any, specialization: string) {
        const trainer = this.trainerRepository.create({specialization, user: { id: user.userId }});
        return await this.trainerRepository.save(trainer);
    }
    
    
    async findAll() {
        return await this.trainerRepository.find({ relations: ['user'] });
    }

    async requestTrainer(userId: number, trainerId: number) {
        const trainerUser = await this.userRepository.findOne({ where: { id: trainerId } });
      
        if (!trainerUser) {
          throw new NotFoundException('Trainer not found');
        }
      
        if (trainerUser.role !== 'trainer') {
          throw new BadRequestException('Requested user is not a trainer');
        }
      
        let trainer = await this.trainerRepository.findOne({
          where: { user: { id: trainerId } },
          relations: ['pendingClients'],
        });
      
        if (!trainer) {
          trainer = this.trainerRepository.create({
            specialization: '',
            user: { id: trainerId },
            pendingClients: [],
          });
        }
      
        const client = await this.userRepository.findOne({ where: { id: userId } });
        if (!client) {
          throw new NotFoundException('Client not found');
        }
      
        const alreadyRequested = trainer.pendingClients.some(u => u.id === userId);
        if (alreadyRequested) {
          throw new ConflictException('You have already sent a request to this trainer');
        }
      
        trainer.pendingClients.push(client);
        await this.trainerRepository.save(trainer);
      
        return { message: 'Request sent successfully', trainer };
      }
  
    // Get pending requests
    async getPendingRequests(trainerUserId: number) {
        const trainer = await this.trainerRepository.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['pendingClients'],
        });
    
        if (!trainer) {
            throw new NotFoundException('Trainer not found');
        }

        if (!trainer.pendingClients || trainer.pendingClients.length === 0) {
            return { message: 'No pending requests' };
        }
    
        // Return only id and name
        return trainer.pendingClients.map(client => ({
            id: client.id,
            name: client.name,
        }));
    }
    
  
    // Approve client
    // Approve client
    
    async approveClient(trainerUserId: number, clientId: number) {
        const trainer = await this.trainerRepository.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['pendingClients', 'clients'],
        });
    
        if (!trainer) throw new NotFoundException('Trainer not found');
    
        const client = trainer.pendingClients.find(c => c.id === clientId);
        if (!client)
            throw new NotFoundException(`Client with ID ${clientId} is not in the pending list`);
    
        // Safely initialize the clients array
        trainer.clients = trainer.clients ?? [];
        trainer.clients.push(client);
    
        trainer.pendingClients = trainer.pendingClients.filter(c => c.id !== clientId);
        await this.trainerRepository.save(trainer);
    
        return {
            id: trainer.id,
            specialization: trainer.specialization,
            clients: trainer.clients.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
            })),
            pendingClients: trainer.pendingClients.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
            })),
        };
    }
    

  
    // Get approved clients
    async getClients(trainerUserId: number) {
        const trainer = await this.trainerRepository.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['clients'],
        });
    
        if (!trainer) {
            throw new NotFoundException('Trainer not found');
        }
    
        return trainer.clients.map(client => ({
            id: client.id,
            name: client.name,
        }));
    }


    async removeClient(trainerUserId: number, clientId: number) {
        const trainer = await this.trainerRepository.findOne({
            where: { user: { id: trainerUserId } },
            relations: ['clients'],
        });
    
        if (!trainer) {
            throw new NotFoundException('Trainer not found');
        }
    
        const clientIndex = trainer.clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
            throw new NotFoundException('Client not found in trainer\'s client list');
        }
    
        // Remove client from the list
        trainer.clients.splice(clientIndex, 1);
        await this.trainerRepository.save(trainer);
    
        return {
            message: `Client with ID ${clientId} has been removed`,
            clients: trainer.clients.map(client => ({
                id: client.id,
                name: client.name,
                email: client.email,
            })),
        };
    }
    
}
