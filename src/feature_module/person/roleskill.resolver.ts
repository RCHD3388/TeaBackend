import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee, EmployeeRole, EmployeeSkill, RoleSkillEmployeeSchema } from './schema/employee.schema';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types/employee.types';
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
}
