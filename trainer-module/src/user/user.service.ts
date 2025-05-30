import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Trainer } from 'src/trainer/trainer.entity';
import { UpdateUserProfileDto } from './DTO/update-user-profile.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>
    ){}

    findByEmail(email: string){
        return this.userRepository.findOne({ where: { email } });
    }
    
    async findById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>) {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    async isTrainer(userId: number): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return user?.role === 'trainer'; // or use Role.TRAINER
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



    

    async updateProfile(id: number, dto: UpdateUserProfileDto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
    
        // assigns even if null is
        //Object.assign(user, dto);

        for (const key in dto) {
          const value = dto[key];
          if (value !== null && value !== undefined) {
            user[key] = value;
          }
        }
    
        // displays pass which is not needed
        // return this.userRepository.save(user);

        const updatedUser = await this.userRepository.save(user);

        // Exclude password
        const { password, ...userWithoutPassword } = updatedUser;

        return {
            message: 'Profile updated',
            user: userWithoutPassword,
        };
      }
    
}
