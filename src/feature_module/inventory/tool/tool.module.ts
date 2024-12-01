import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Tool, ToolSchema} from './tool.schema';
import {ToolResolver} from './tool.resolver';
import {ToolService} from './tool.service';

@Module({
    imports: [MongooseModule.forFeature([{name: Tool.name, schema: ToolSchema}])],
    providers: [ToolResolver, ToolService],
})
export class ToolModule {}