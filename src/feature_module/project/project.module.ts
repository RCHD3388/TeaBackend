import { Module } from '@nestjs/common';
import { ProjectResolver } from './project.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { Attendance, AttendanceModule, AttendanceModuleSchema, Project, ProjectCostLog, ProjectCostLogSchema, ProjectSchema } from './schema/project.schema';
import { CategoryData, CategoryDataSchema } from '../category/schema/category.schema';
import { ProjectService } from './project.service';
import { ProjectEmployeeService } from './project_employee.service';
import { ProjectEmployeeResolver } from './project_employee.resolver';
import { PersonModule } from '../person/person.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProjectCostService } from './project_att_cost/project_cost.service';
import { ProjectAttendResolver } from './project_att_cost/project_attend.resolver';
import { ProjectAttendService } from './project_att_cost/project_attend.service';
import { Warehouse, WarehouseSchema } from '../inventory/schema/warehouse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema},
      { name: Project.name, schema: ProjectSchema},
      { name: CategoryData.name, schema: CategoryDataSchema},
      { name: ProjectCostLog.name, schema: ProjectCostLogSchema},
      { name: AttendanceModule.name, schema: AttendanceModuleSchema},
      { name: Warehouse.name, schema: WarehouseSchema},
    ]),
    PersonModule,
    InventoryModule
  ],
  providers: [
    ProjectResolver, ProjectEmployeeResolver,
    ProjectService, ProjectEmployeeService,
    ProjectCostService,
    ProjectAttendResolver, ProjectAttendService,
  ],

  exports: [ProjectService, ProjectEmployeeService, ProjectCostService]
})
export class ProjectModule {}
