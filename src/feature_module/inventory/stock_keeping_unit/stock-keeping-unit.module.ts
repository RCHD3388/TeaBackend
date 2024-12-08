import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {StockKeepingUnit, StockKeepingUnitSchema} from './stock-keeping-unit.schema';
import {StockKeepingUnitResolver} from './stock-keeping-unit.resolver';
import {StockKeepingUnitService} from './stock-keeping-unit.service';
import {BrandModule} from '../brand/brand.module';
@Module({
    imports: [
        MongooseModule.forFeature([{name: StockKeepingUnit.name, schema: StockKeepingUnitSchema}]),
        BrandModule
    ],
    providers: [StockKeepingUnitResolver, StockKeepingUnitService],
})
export class StockKeepingUnitModule {}