import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './schema/employee.schema';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Employee.name, schema: EmployeeSchema }
  ]),],
  providers: [EmployeeResolver, EmployeeService]
})
export class PersonModule { }
