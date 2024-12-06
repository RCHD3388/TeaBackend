import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeRole, EmployeeRoleSchema, EmployeeSchema, EmployeeSkill, EmployeeSkillSchema } from './schema/employee.schema';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';
import { RoleSkillResolver } from './roleskill.resolver';
import { RoleSkillService } from './roleskill.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Employee.name, schema: EmployeeSchema },
    { name: EmployeeSkill.name, schema: EmployeeSkillSchema},
    { name: EmployeeRole.name, schema: EmployeeRoleSchema }
  ]),],
  providers: [EmployeeResolver, EmployeeService, RoleSkillResolver, RoleSkillService]
})
export class PersonModule { }
