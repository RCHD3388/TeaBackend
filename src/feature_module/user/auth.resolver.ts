import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { LoginInput, LoginResponse } from "./types/auth.type";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args("data") data: LoginInput): Promise<LoginResponse>{
    return this.authService.login(data);
  }
}