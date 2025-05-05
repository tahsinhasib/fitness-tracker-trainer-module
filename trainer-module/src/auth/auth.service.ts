import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { Role, User } from '../user/user.entity';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        @InjectRepository(User) private userRepository: Repository<User>

    ) {}

    // Signup method
    async signup(name: string, email: string, password: string, role: string) {

        const existingUser = await this.userService.findByEmail(email);
        
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.create({
            name,
            email,
            password: hashedPassword,
            role: role as Role,
        });
        return {
            message: 'Signup successful. Please log in.'
        };
    }
    
    // Login method
    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return {
            message: 'Login successful!',
            access_token: this.jwtService.sign({ id: user.id, role: user.role }),
        };
    }


    // Request password reset method
    async requestPasswordReset(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('User not found');
      
        user.resetToken = randomBytes(32).toString('hex');
        user.resetTokenExpiry = new Date(Date.now() + 3600_000); // 1 hour
        await this.userRepository.save(user);
      
        // TODO: Use MailerService to send real email
        const resetLink = `https://your-frontend.com/reset-password?token=${user.resetToken}`;
        console.log(`Reset link: ${resetLink}`);
        return { 
            message: 'Password reset link sent to your email (console for demo).' 
        };
    }
      
    // Reset password method
    async resetPassword(token: string, newPassword: string) {
        const user = await this.userRepository.findOne({ where: { resetToken: token } });
      
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new BadRequestException('Invalid or expired reset token');
        }
      
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
      
        await this.userRepository.save(user);
        return { 
            message: 'Password updated successfully' 
        };
    }
}
