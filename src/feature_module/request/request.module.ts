import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { ProjectCostResolver } from './project_cost/request_cost.resolver';
import { ProjectCostService } from './project_cost/request_cost.service';
import { RequestCost, RequestCostSchema } from './schema/request_cost.schema';
import { Project, ProjectSchema } from '../project/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestCost.name, schema: RequestCostSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  providers: [ProjectCostResolver, ProjectCostService],
  exports: []
})
export class RequestModule {}
