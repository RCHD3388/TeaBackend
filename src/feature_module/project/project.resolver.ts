import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AppAuthGuard } from "../user/auth_related/auth.guard";
import { CurrentUser } from "src/common/decorators/auth_user.decorator";

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectResolver {
  constructor() {}

  @Mutation(() => String)
  async create_project(@CurrentUser() user: any): Promise<String>{
    console.log(user)
    return "hello world";
  }
}