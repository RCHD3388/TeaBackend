import { Resolver, Query } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee } from './schema/employee.schema';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => [Employee], { name: 'getAllEmployees' })
  async getAllEmployees() {
    return this.employeeService.findAll();
  }
}
