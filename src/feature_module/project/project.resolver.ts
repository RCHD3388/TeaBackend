import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AppAuthGuard } from "../user/auth_related/auth.guard";
import { CurrentUser } from "src/common/decorators/auth_user.decorator";
import { User } from "../user/schema/user.schema";
import { RolesGuard } from "src/common/guard/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectResolver {
  constructor() {}

  @Mutation(() => String)
  @UseGuards(RolesGuard)
  @Roles('owner')
  async create_project(@CurrentUser() user: User): Promise<String>{
    console.log(user)
    return "hello world";
  }
}