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
import { RequestClosingResolver } from './project_closing/request_closing.resolver';
import { RequestClosingService } from './project_closing/request_closing.service';
import { RequestProjectClosing, RequestProjectClosingSchema } from './schema/request_closing.schema';
import { CategoryData, CategoryDataSchema } from '../category/schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestCost.name, schema: RequestCostSchema },
      { name: RequestProjectClosing.name, schema: RequestProjectClosingSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: CategoryData.name, schema: CategoryDataSchema },
    ]),
    ProjectModule,
    InventoryModule
  ],
  providers: [RequestCostResolver, RequestCostService,
    RequestClosingResolver, RequestClosingService
  ],
  exports: []
})
export class RequestModule {}
