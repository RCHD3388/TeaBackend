import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from 'src/feature_module/user/schema/user.schema';
import { ProjectAttendService } from './project_attend.service';
import { AttendanceModule } from '../schema/project.schema';
import { CreateAttendanceModuleInput, UpdateAttendanceModuleInput } from '../types/project_sub.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectAttendResolver {
  constructor(
    private readonly projectAttendService: ProjectAttendService
  ) { }

  @Mutation(() => AttendanceModule, { name: 'createAttendance' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async createAttendance(
    @Args('createAttendanceInput') createAttendanceInput: CreateAttendanceModuleInput,
    @CurrentUser() user: User
  ): Promise<AttendanceModule> {
    return this.projectAttendService.createModule(createAttendanceInput, user);
  }

  @Mutation(() => AttendanceModule, { name: 'submitAttendanceModule' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async submitAttendanceModule(
    @Args('projectId') projectId: string,
    @Args('moduleId') moduleId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceModule> {
    return this.projectAttendService.submitModule(projectId, moduleId, user);
  }

  @Query(() => [AttendanceModule], { name: 'findAllAttendanceModules' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findAllAttendanceModules(
    @Args('projectId') projectId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceModule[]> {
    return this.projectAttendService.findAll(projectId, user);
  }

  @Query(() => AttendanceModule, { name: 'findOneAttendanceModule' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findOneAttendanceModule(
    @Args('projectId') projectId: string,
    @Args('moduleId') moduleId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceModule> {
    return this.projectAttendService.findOne(projectId, moduleId, user);
  }

  @Mutation(() => AttendanceModule, { name: 'deleteAttendanceModule' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async deleteAttendanceModule(
    @Args('projectId') projectId: string,
    @Args('moduleId') moduleId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceModule> {
    return this.projectAttendService.deleteOne(projectId, moduleId, user);
  }

  @Mutation(() => AttendanceModule, { name: 'updateAttendanceModule' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateAttendanceModule(
    @Args('projectId') projectId: string,
    @Args('moduleId') moduleId: string,
    @Args('updateAttendanceModuleInput') updateAttendanceModuleInput: UpdateAttendanceModuleInput,
    @CurrentUser() user: User
  ): Promise<AttendanceModule> {
    return this.projectAttendService.updateModule(projectId, moduleId, updateAttendanceModuleInput, user);
  }

}
