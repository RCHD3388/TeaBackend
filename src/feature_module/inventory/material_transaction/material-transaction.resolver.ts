import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MaterialTransactionService } from './material-transaction.service';
import { MaterialTransaction } from './material-transaction.schema';
import { CreateMaterialTransactionInput } from './dto/create-material.transaction.input';
@Resolver(() => MaterialTransaction)
export class MaterialTransactionResolver {
    constructor(private readonly materialTransactionService: MaterialTransactionService) { }

    @Query(() => [MaterialTransaction])
    async findAllMaterialTransaction(): Promise<MaterialTransaction[]> {
        return this.materialTransactionService.findAll();
    }

    @Query(() => [MaterialTransaction])
    async findByWarehouse(@Args('warehouseId') warehouseId: string): Promise<MaterialTransaction[]> {
        return this.materialTransactionService.findByWarehouse(warehouseId);
    }

    @Query(() => [MaterialTransaction])
    async findAllRemainingItem(@Args('warehouseId') warehouseId: string): Promise<{ material: any; remaining: number }[]> {
        return this.materialTransactionService.findAllRemainingItem(warehouseId);
    }

    @Query(() => MaterialTransaction)
    async findById(@Args('id') id: string): Promise<MaterialTransaction> {
        return this.materialTransactionService.findById(id);
    }

    @Mutation(() => MaterialTransaction)
    async createMaterialTransaction(@Args('data') data: CreateMaterialTransactionInput): Promise<MaterialTransaction> {
        return this.materialTransactionService.create(data);
    }

}