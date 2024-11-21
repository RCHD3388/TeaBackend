// import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
// import { EmployeeService } from './employee.service';
// import { Employee } from './employee.schema';
// import { CreateEmployeeInput } from './dto/create-employee.input';
// import { UpdateEmployeeInput } from './dto/update-employee.input';

// @Resolver(() => Employee)
// export class EmployeeResolver {
//   constructor(private readonly employeeService: EmployeeService) {}

//   @Query(() => [Employee], { name: 'employees' })
//   findAll(): Promise<Employee[]> {
//     return this.employeeService.findAll();
//   }

//   @Query(() => Employee, { name: 'employee' })
//   findOne(@Args('id', { type: () => String }) id: string): Promise<Employee> {
//     return this.employeeService.findOne(id);
//   }

//   @Mutation(() => Employee)
//   createEmployee(@Args('data') data: CreateEmployeeInput): Promise<Employee> {
//     return this.employeeService.create(data);
//   }

//   @Mutation(() => Employee)
//   @Mutation(() => Employee)
//   updateEmployee(
//     @Args('id', { type: () => String }) id: string,
//     @Args('data') data: UpdateEmployeeInput
//   ): Promise<Employee> {
//     return this.employeeService.update(id, data);
//   }

//   @Mutation(() => Boolean)
//   deleteEmployee(
//     @Args('id', { type: () => String }) id: string
//   ): Promise<boolean> {
//     return this.employeeService.delete(id);
//   }
// }
