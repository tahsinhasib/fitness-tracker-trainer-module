import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { Role } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService: JwtService,) {}
    
    async signup(name: string, email: string, password: string, role: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.create({ name, email, password: hashedPassword, role: role as Role });
        return {
            access_token: this.jwtService.sign({ id: user.id, role: user.role }),
        };
    }
    
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
            access_token: this.jwtService.sign({ id: user.id, role: user.role }),
        };
    }
}
