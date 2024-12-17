import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { ProjectCostResolver } from './project_cost/project_cost.resolver';
import { ProjectCostService } from './project_cost/project_cost.service';

@Module({
  imports: [
    MongooseModule.forFeature([]),
  ],
  providers: [ProjectCostResolver, ProjectCostService],
  exports: []
})
export class RequestModule {}
