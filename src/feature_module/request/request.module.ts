import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { RequestCostResolver } from './project_cost/request_cost.resolver';
import { RequestCostService } from './project_cost/request_cost.service';
import { RequestCost, RequestCostSchema } from './schema/request_cost.schema';
import { Project, ProjectSchema } from '../project/schema/project.schema';
import { ProjectModule } from '../project/project.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestCost.name, schema: RequestCostSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    ProjectModule,
    InventoryModule
  ],
  providers: [RequestCostResolver, RequestCostService],
  exports: []
})
export class RequestModule {}
