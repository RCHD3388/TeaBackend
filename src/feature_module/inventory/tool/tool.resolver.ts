import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ToolService } from './tool.service';
import { Tool } from './tool.schema';
import { CreateToolInput } from './dto/create-tool.input';

@Resolver(() => Tool)
export class ToolResolver {
    constructor(private readonly toolService: ToolService) {}

    @Query(() => [Tool])
    async tools(): Promise<Tool[]> {
        return this.toolService.findAll();
    }

    @Query(() => Tool)
    async tool(@Args('id') id: string): Promise<Tool> {
        return this.toolService.findById(id);
    }

    @Mutation(() => Tool)
    async createTool(@Args('data') data: CreateToolInput): Promise<Tool> {
        return this.toolService.create(data);
    }
}