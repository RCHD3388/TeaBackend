import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  NotFoundException,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readdirSync, existsSync, statSync } from 'fs';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose'; // Correct import
import { Model } from 'mongoose'; // Correct import
import { Project } from 'src/feature_module/project/schema/project.schema';
import { AppAuthGuard } from '../user/auth_related/auth.guard'; // Import AppAuthGuard
import { RolesGuard } from 'src/common/guard/roles.guard'; // Import RolesGuard
import { Roles } from 'src/common/decorators/roles.decorator';
import { zip } from 'rxjs';

@Controller('upload')
export class FileUploadController {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  @Post()
  
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Specify upload directory
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectID') projectID: string,
  ) {
    try {
      const project = await this.projectModel.findById(projectID);
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      project.project_closing.document = `${file.filename}`;
      await project.save();

      return {
        message: 'File uploaded successfully!',
        filePath: `/uploads/${file.filename}`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
    getAllFiles() {
    try {
      const directoryPath = join(process.cwd(), 'uploads');
      const files = readdirSync(directoryPath);
      const fileUrls = files.map((file) => ({
        name: file,
        url: `/uploads/${file}`, // Relative URL to access the file
      }));
      return {
        message: 'Files retrieved successfully!',
        files: fileUrls,
      };
    } catch (error) {
      return {
        message: 'Error retrieving files',
        error: error.message,
      };
    }
  }

  @Get('download/:id')
  
  async downloadProjectDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const project = await this.projectModel.findById(id).exec();

      if (!project || !project.project_closing?.document) {
        throw new NotFoundException(`Document for project ID ${id} not found.`);
      }

      // Gunakan path.join untuk menangani path dengan benar
      const filePath = join(
        process.cwd(),
        'uploads',
        project.project_closing.document,
      );

      if (!existsSync(filePath)) {
        throw new NotFoundException(
          `File ${project.project_closing.document} not found.`,
        );
      }

      // Dapatkan nama file asli
      const originalFileName = project.project_closing.document;

      // Dapatkan mime type berdasarkan ekstensi file
      const mimeType = getMimeType(originalFileName);

      // Set header Content-Type yang sesuai
      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${originalFileName}"`,
      });

      return res.download(filePath, originalFileName);
    } catch (error) {
      console.error('Download error:', error);
      throw new NotFoundException('Error downloading file');
    }
  }
}
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    zip: "application/zip",
    // Tambahkan mime type lain sesuai kebutuhan
  };
  return mimeTypes[ext] || 'application/octet-stream';
}