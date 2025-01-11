import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileUploadController } from './file-upload.controller';
import { Project, ProjectSchema } from 'src/feature_module/project/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
