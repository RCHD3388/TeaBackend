import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { LoginInput, LoginResponse } from "./types/auth.type";
import { User } from "./schema/user.schema";
import { AppAuthGuard } from "./auth_related/auth.guard";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/common/decorators/auth_user.decorator";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => LoginResponse)
  async login(@Args("data") data: LoginInput): Promise<LoginResponse> {
    return this.authService.login(data);
  }


  @Mutation(() => Boolean)
  @UseGuards(AppAuthGuard)
  async resetPassword(
    @Args("currentPassword") currentPassword: string,
    @Args("newPassword") newPassword: string,
    @CurrentUser() user: User
  ): Promise<Boolean> {
    return this.authService.resetPassword(currentPassword, newPassword, user);
  }
}