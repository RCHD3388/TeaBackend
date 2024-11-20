import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthResponse } from '../auth/dto/auth-response.dto';

@Resolver(of => User)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => AuthResponse, { nullable: true })
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse | null> {
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
