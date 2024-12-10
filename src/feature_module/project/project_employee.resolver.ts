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
import { CreateProjectInput, UpdateProjectInput } from "./types/project.types";
import { Employee } from "../person/schema/employee.schema";
import { ProjectEmployeeService } from "./project_employee.service";

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectEmployeeResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectEmployeeService: ProjectEmployeeService
  ) {}

  @Query(() => [Project], { name: 'findAllProjects' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findAllProjects(@CurrentUser() user: User): Promise<Project[]> {
    return this.projectService.findAll(user);
  }

  // Query untuk mendapatkan project berdasarkan ID
  @Query(() => Project, { name: 'findProjectById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findProjectById(
    @Args('id', { type: () => String }) id: string, 
    @CurrentUser() user: User
  ): Promise<Project> {
    return this.projectService.findProjectById(id, user);
  }

  // Mutation untuk membuat project baru
  @Mutation(() => Project, { name: 'createProject' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async createProject(@Args('createProjectInput') createProjectInput: CreateProjectInput): Promise<Project> {
    return this.projectService.create(createProjectInput);
  }

  // Mutation untuk memperbarui project
  @Mutation(() => Project, { name: 'updateProject' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateProject(
    @Args('id', { type: () => String }) id: string,
    @Args('updateProjectInput') updateProjectInput: UpdateProjectInput,
    @CurrentUser() user: User
  ): Promise<Project> {
    return this.projectService.update(id, updateProjectInput, user);
  }

  @Query(() => [Employee], { name: 'getAllProjectEmployees' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async getAllProjectEmployees(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User
  ): Promise<Employee[]> {
    return await this.projectEmployeeService.getAllProjectEmployee(id, user);
  }

  @Mutation(() => Project, { name: 'addNewProjectEmployee' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async addNewProjectEmployee(
    @Args('id', { type: () => String }) id: string,
    @Args('employees', { type: () => [String] }) employees: string[],
  ): Promise<Project> {
    return await this.projectEmployeeService.addNewProjectEmployee(id, employees);
  }

  @Mutation(() => Project, { name: 'removeProjectEmployee' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async removeProjectEmployee(
    @Args('id', { type: () => String }) id: string,
    @Args('employees', { type: () => String }) employees: string,
    @Args('description', { type: () => String }) description: string,
  ): Promise<Project> {
    return await this.projectEmployeeService.removeProjectEmployee(id, employees, description);
  }
}