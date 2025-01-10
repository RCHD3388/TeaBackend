import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeRole, EmployeeRoleSchema, EmployeeSchema, EmployeeSkill, EmployeeSkillSchema } from './schema/employee.schema';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';
import { RoleSkillResolver } from './roleskill.resolver';
import { RoleSkillService } from './roleskill.service';
import { SupplierResolver } from './supplier.resolver';
import { SupplierService } from './supplier.service';
import { Supplier, SupplierSchema } from './schema/supplier.schema';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Employee.name, schema: EmployeeSchema },
    { name: EmployeeSkill.name, schema: EmployeeSkillSchema},
    { name: EmployeeRole.name, schema: EmployeeRoleSchema },
    { name: Supplier.name, schema: SupplierSchema },
    { name: User.name, schema: UserSchema }
  ]),],
  providers: [
    EmployeeResolver, EmployeeService, 
    RoleSkillResolver, RoleSkillService,
    SupplierResolver, SupplierService
  ],
  exports: [EmployeeService, RoleSkillService, SupplierService]
})
export class PersonModule { }
