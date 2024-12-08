import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tool, ToolSchema } from './tool.schema';
// import { CategoryDataModule } from '../../category_data/category_data/category-data.schema';
import { ToolService } from './tool.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tool.name, schema: ToolSchema }]),
    // CategoryDataModule, 
  ],
  providers: [ToolService],
  exports: [ToolService],
})
export class ToolModule {}