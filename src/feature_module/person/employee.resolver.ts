import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee } from './schema/employee.schema';
import { CreateEmployeeInput, EmployeeFilter, UpdateEmployeeInput } from './types/employee.types';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from '../user/schema/user.schema';

@Resolver()
@UseGuards(AppAuthGuard)
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => [Employee], { name: 'getAllEmployees' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async getAllEmployees(
    @Args('employeeFilter', {nullable: true}) employeeFilter?: EmployeeFilter
  ) {
    return this.employeeService.findAll(employeeFilter);
  }

  @Query(() => Employee, { name: 'getEmployeeById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async getEmployeeById(@Args('id') id: string): Promise<Employee> {
    return this.employeeService.findEmployeeById(id);
  }

  @Mutation(() => Employee)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async createEmployee( 
    @Args('createEmployeeInput') createEmployeeInput: CreateEmployeeInput,
    @CurrentUser() user: User
  ): Promise<Employee> {
    return this.employeeService.create(createEmployeeInput, user);
  }

  @Mutation(() => Employee)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async updateEmployee(
    @Args('id') id: string, 
    @Args('updateEmployeeInput') updateEmployeeInput: UpdateEmployeeInput
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeInput);
  }
}
