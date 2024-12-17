import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectCostService } from './request_cost.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectCostResolver {
  constructor(
    private readonly projectCostService: ProjectCostService
  ) { }

}
