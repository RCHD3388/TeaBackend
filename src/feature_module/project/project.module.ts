import { Module } from '@nestjs/common';
import { ProjectResolver } from './project.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { Project, ProjectSchema } from './schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema},
      { name: Project.name, schema: ProjectSchema},
    ]),
  ],
  providers: [
    ProjectResolver
  ]
})
export class ProjectModule {}
