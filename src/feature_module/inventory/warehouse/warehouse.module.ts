import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Warehouse, WarehouseSchema} from './warehouse.schema';
import {WarehouseResolver} from './warehouse.resolver';
import {WarehouseService} from './warehouse.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Warehouse.name, schema: WarehouseSchema },
        ]),
    ],
    providers: [WarehouseResolver, WarehouseService],
    exports: [WarehouseService],
})
export class WarehouseModule {}
