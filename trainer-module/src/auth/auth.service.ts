import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { Role } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
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
    
        // Return a message instead of JWT
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
}
