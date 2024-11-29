import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UnitMeasure, UnitMeasureSchema} from './unit-measure.schema';
import {UnitMeasureResolver} from './unit-measure.resolver';
import {UnitMeasureService} from './unit-measure.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UnitMeasure.name, schema: UnitMeasureSchema },
        ]),
    ],
    providers: [UnitMeasureResolver, UnitMeasureService],
})
export class UnitMeasureModule {}
