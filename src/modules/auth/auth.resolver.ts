import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { User } from '../user/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    return this.authService.login(email, password);
  }

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<User> {
    return this.authService.register(email, password);
  }
}
