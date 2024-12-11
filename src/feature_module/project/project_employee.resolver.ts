import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AppAuthGuard } from "../user/auth_related/auth.guard";
import { CurrentUser } from "src/common/decorators/auth_user.decorator";
import { User } from "../user/schema/user.schema";
import { RolesGuard } from "src/common/guard/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { ValidationError } from "class-validator";
import { ProjectService } from "./project.service";
import { Project } from "./schema/project.schema";
import { CreateProjectInput, GetAllProjectEmployeeDto, UpdateProjectInput } from "./types/project.types";
import { Employee } from "../person/schema/employee.schema";
import { ProjectEmployeeService } from "./project_employee.service";

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectEmployeeResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectEmployeeService: ProjectEmployeeService
  ) {}

  @Query(() => GetAllProjectEmployeeDto, { name: 'getAllProjectEmployees' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async getAllProjectEmployees(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User
  ): Promise<GetAllProjectEmployeeDto> {
    return await this.projectEmployeeService.getAllProjectEmployee(id, user);
  }

  @Mutation(() => [Employee], { name: 'addNewProjectEmployee' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async addNewProjectEmployee(
    @Args('id', { type: () => String }) id: string,
    @Args('employees', { type: () => [String] }) employees: string[],
  ): Promise<Employee[]> {
    return await this.projectEmployeeService.addNewProjectEmployee(id, employees);
  }

  @Mutation(() => Employee, { name: 'removeProjectEmployee' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async removeProjectEmployee(
    @Args('id', { type: () => String }) id: string,
    @Args('employee', { type: () => String }) employee: string,
    @Args('description', { type: () => String }) description: string,
  ): Promise<Employee> {
    return await this.projectEmployeeService.removeProjectEmployee(id, employee, description);
  }
}