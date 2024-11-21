import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeRoleService } from './employee-role.service';
import { EmployeeRole } from './employee-role.schema';

@Resolver('EmployeeRole') // Matches the type defined in employee-role.graphql
export class EmployeeRoleResolver {
  constructor(private readonly employeeRoleService: EmployeeRoleService) {}

  @Query(() => [EmployeeRole], { name: 'employeeRoles' })
  findAll() {
    return this.employeeRoleService.findAll();
  }

  @Query(() => EmployeeRole, { name: 'employeeRole' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.employeeRoleService.findOne(id);
  }

  @Mutation(() => EmployeeRole)
  createEmployeeRole(
    @Args('name') name: string,
    @Args('description') description: string
  ) {
    return this.employeeRoleService.create({ name, description });
  }

  @Mutation(() => EmployeeRole)
  updateEmployeeRole(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string
  ) {
    return this.employeeRoleService.update(id, { name, description });
  }

  @Mutation(() => Boolean)
  deleteEmployeeRole(@Args('id') id: string) {
    return this.employeeRoleService.delete(id);
  }
}
