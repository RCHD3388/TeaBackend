import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StockKeepingUnitService } from './stock-keeping-unit.service';
import { StockKeepingUnit } from './stock-keeping-unit.schema';
import { CreateStockKeepingUnitInput } from './dto/create-stock-keeping-unit.input';

@Resolver(() => StockKeepingUnit)
export class StockKeepingUnitResolver {
    constructor(
        private readonly stockKeepingUnitService: StockKeepingUnitService
    ) {}

    @Query(() => [StockKeepingUnit], { name: 'stockKeepingUnits' })
    async findAll(): Promise<StockKeepingUnit[]> {
        return this.stockKeepingUnitService.findAll();
    }

    @Mutation(() => StockKeepingUnit, { name: 'createStockKeepingUnit' })
    async create(@Args('data') data: CreateStockKeepingUnitInput): Promise<StockKeepingUnit> {
        return this.stockKeepingUnitService.create(data);
    }
}