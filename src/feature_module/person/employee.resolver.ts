import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee } from './schema/employee.schema';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types/employee.types';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Resolver()
@UseGuards(AppAuthGuard)
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => [Employee], { name: 'getAllEmployees' })
  @UseGuards(RolesGuard)
  @Roles("owner")
  async getAllEmployees() {
    return this.employeeService.findAll();
  }

  @Query(() => Employee)
  @Query(() => [Employee], { name: 'getEmployeeById' })
  @UseGuards(RolesGuard)
  async getEmployeeById(@Args('id') id: string): Promise<Employee> {
    return this.employeeService.findEmployeeById(id);
  }

  @Mutation(() => Employee)
  @UseGuards(RolesGuard)
  @Roles("owner")
  async createEmployee( @Args('createEmployeeInput') createEmployeeInput: CreateEmployeeInput ): Promise<Employee> {
    return this.employeeService.create(createEmployeeInput);
  }

  @Mutation(() => Employee)
  @UseGuards(RolesGuard)
  @Roles("owner")
  async updateEmployee(
    @Args('id') id: string, 
    @Args('updateEmployeeInput') updateEmployeeInput: UpdateEmployeeInput
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeInput);
  }
}
