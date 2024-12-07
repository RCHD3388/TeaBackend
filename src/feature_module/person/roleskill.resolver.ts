import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeRole, EmployeeSkill } from './schema/employee.schema';
import { CreateEmployeeSkillInput } from './types/employee.types';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleSkillService } from './roleskill.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class RoleSkillResolver {
  constructor(private readonly roleSkillService: RoleSkillService) {}

  @Query(() => [EmployeeRole], { name: 'getAllRole' })
  @UseGuards(RolesGuard)
  @Roles("owner")
  async getAllRole() {
    return this.roleSkillService.findAllRole();
  }

  @Query(() => [EmployeeSkill], { name: 'getAllSkill' })
  @UseGuards(RolesGuard)
  @Roles("owner")
  async getAllSkill() {
    return this.roleSkillService.findAllSkill();
  }

  @Mutation(() => EmployeeSkill, { name: 'createEmployeeSkill' })
  @UseGuards(RolesGuard)
  @Roles("owner")
  async createEmployeeSkill( @Args('createEmployeeSkillInput') createEmployeeSkillInput: CreateEmployeeSkillInput ) {
    return this.roleSkillService.createEmployeeSkill(createEmployeeSkillInput);
  }

  @Mutation(() => EmployeeSkill, { name: 'updateEmployeeSkill' })
  @UseGuards(RolesGuard)
  @Roles("owner")
  async updateEmployeeSkill( @Args('id') id: string, @Args('updateEmployeeSkillInput') updateEmployeeSkillInput: CreateEmployeeSkillInput ) {
    return this.roleSkillService.updateEmployeeSkill(id, updateEmployeeSkillInput);
  }

  @Mutation(() => EmployeeSkill)
  @UseGuards(RolesGuard)
  @Roles("owner")
  async deleteEmployeeSkill(@Args('id') id: string): Promise<EmployeeSkill> {
    return this.roleSkillService.delete(id);
  }
}
