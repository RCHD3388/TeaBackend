import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { User } from "./schema/user.schema";
import { RolesGuard } from "src/common/guard/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateUserInput, UpdateUserInput } from "./types/user.types";
import { AppAuthGuard } from "./auth_related/auth.guard";

@Resolver()
@UseGuards(AppAuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'getAllUsers' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'getUserById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async getUserById(@Args('id') id: string): Promise<User> {
    return this.userService.findOneUser({id: id});
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput
  ): Promise<User> {
    return this.userService.update(id, updateUserInput);
  }
}