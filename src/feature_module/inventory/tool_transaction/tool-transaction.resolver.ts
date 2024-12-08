import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ToolTransactionService } from './tool-transaction.service';
import { ToolTransaction } from './tool-transaction.schema';
import { CreateToolTransactionInput } from './dto/create-tool-transaction.input';

@Resolver(() => ToolTransaction)
export class ToolTransactionResolver {
    constructor(private readonly toolTransactionService: ToolTransactionService) {}

    @Query(() => [ToolTransaction])
    async getToolTransactions(): Promise<ToolTransaction[]> {
        return this.toolTransactionService.getToolTransactions();
    }

    @Query(() => [ToolTransaction])
    async getToolTransactionsByTool(@Args('toolId') toolId: string): Promise<ToolTransaction[]> {
        return this.toolTransactionService.getToolTransactionsByTool(toolId);
    }
    
}