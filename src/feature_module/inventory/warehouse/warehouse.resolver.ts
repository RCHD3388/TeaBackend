import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {WarehouseService} from './warehouse.service';
import {Warehouse} from './warehouse.schema';
import {CreateWarehouseInput} from './dto/create-warehouse.input';

@Resolver(() => Warehouse)
export class WarehouseResolver {
    constructor(private readonly warehouseService: WarehouseService) {}

    @Query(() => [Warehouse])
    async warehouses(): Promise<Warehouse[]> {
        return await this.warehouseService.findAll();
    }

    @Mutation(() => Warehouse)
    async createWarehouse(@Args('createWarehouseInput') createWarehouseInput: CreateWarehouseInput): Promise<Warehouse> {
        return await this.warehouseService.create(createWarehouseInput);
    }
    @Mutation(() => Warehouse)
    async updateWarehouse(@Args('id') id: string, @Args('warehouse') warehouse: Warehouse): Promise<Warehouse> {
        return await this.warehouseService.update(id, warehouse);
    }
    @Mutation(() => Warehouse)
    async deactivateWarehouse(@Args('id') id: string): Promise<Warehouse> {
        return await this.warehouseService.deactivate(id);
    }
    @Query(() => Warehouse)
    async warehouse(@Args('id') id: string): Promise<Warehouse> {
        return await this.warehouseService.findById(id);
    }
}