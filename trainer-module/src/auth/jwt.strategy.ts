import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: jwtConstants.secret, // secret must match signing secret
        });
      }
    
    //   async validate(payload: any) {
    //     // This 'payload' is the decoded JWT
    //     return { userId: payload.sub, email: payload.email, role: payload.role };
    //   }

    async validate(payload: any) {
        return { userId: payload.id, role: payload.role }; // no payload.sub, use payload.id
    }
    
    
}
