import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmployeeSkillService } from './employee-skill.service';
import { EmployeeSkill } from './employee-skill.schema';

@Resolver('EmployeeSkill') // Matches the type in employee-skill.graphql
export class EmployeeSkillResolver {
  constructor(private readonly employeeSkillService: EmployeeSkillService) {}

  @Query(() => [EmployeeSkill], { name: 'employeeSkills' })
  findAll() {
    return this.employeeSkillService.findAll();
  }

  @Query(() => EmployeeSkill, { name: 'employeeSkill' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.employeeSkillService.findOne(id);
  }

  @Mutation(() => EmployeeSkill)
  createEmployeeSkill(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string
  ) {
    return this.employeeSkillService.create({ name, description });
  }

  @Mutation(() => EmployeeSkill)
  updateEmployeeSkill(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string
  ) {
    return this.employeeSkillService.update(id, { name, description });
  }

  @Mutation(() => Boolean)
  deleteEmployeeSkill(@Args('id') id: string) {
    return this.employeeSkillService.delete(id);
  }
}
