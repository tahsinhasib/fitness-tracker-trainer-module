import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>){}

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
}
