import { Module } from '@nestjs/common';
import { ProjectResolver } from './project.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { Project, ProjectSchema } from './schema/project.schema';
import { CategoryData, CategoryDataSchema } from '../category/schema/category.schema';
import { ProjectService } from './project.service';
import { ProjectEmployeeService } from './project_employee.service';
import { ProjectEmployeeResolver } from './project_employee.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema},
      { name: Project.name, schema: ProjectSchema},
      { name: CategoryData.name, schema: CategoryDataSchema},
    ]),
  ],
  providers: [
    ProjectResolver, ProjectEmployeeResolver,
    ProjectService, ProjectEmployeeService
  ]
})
export class ProjectModule {}
