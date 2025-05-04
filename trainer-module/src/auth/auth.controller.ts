import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestResetDto, ResetPasswordDto } from './DTO/request-reset.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() body: { name: string; email: string; password: string; role: string }) {
        return this.authService.signup(body.name, body.email, body.password, body.role);
    }
  
    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.login(body.email, body.password);
    }

    @Post('forgot-password')
    requestReset(@Body() dto: RequestResetDto) {
        return this.authService.requestPasswordReset(dto.email);
    }

    @Post('reset-password')
    reset(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
    
}
