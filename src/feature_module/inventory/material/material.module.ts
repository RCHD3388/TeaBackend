import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Material, MaterialSchema} from './material.schema';
import {MaterialResolver} from './material.resolver';
import {MaterialService} from './material.service';

@Module({
    imports: [MongooseModule.forFeature([{name: Material.name, schema: MaterialSchema}])],
    providers: [MaterialResolver, MaterialService],
    exports: [MaterialService],
})
export class MaterialModule {}