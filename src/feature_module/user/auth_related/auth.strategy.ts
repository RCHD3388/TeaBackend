import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user.service';
import { Employee } from 'src/feature_module/person/schema/employee.schema';
import { AuthenticationError } from '@nestjs/apollo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'random_jwt_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOneUser({id: payload.id});
    if(user.status  == "Inactive") throw new AuthenticationError("User tidak ditemukan")
    return user;
  }
}
