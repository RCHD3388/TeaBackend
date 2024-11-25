import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { Project } from './project.schema';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project], { name: 'projects' })
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Query(() => Project, { name: 'project' })
  findOne(@Args('id', { type: () => String }) id: string): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Mutation(() => Project)
  createProject(@Args('data') data: CreateProjectInput): Promise<Project> {
    return this.projectService.create(data);
  }

  @Mutation(() => Project)
  updateProject(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateProjectInput
  ): Promise<Project> {
    return this.projectService.update(id, data);
  }

  @Mutation(() => Boolean)
  deleteProject(
    @Args('id', { type: () => String }) id: string
  ): Promise<boolean> {
    return this.projectService.delete(id);
  }
}
