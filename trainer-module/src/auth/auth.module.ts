import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from './constants';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret, 
          signOptions: { expiresIn: '1h' },
        }),
        UserModule,
      ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
