import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../../feature_module/project/project.schema';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>
  ) {}

  // Fetch all projects
  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .populate('project_leader worker attendance project_closing') // Populates referenced fields
      .exec();
  }

  // Fetch a single project by ID
  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('project_leader worker attendance project_closing')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    return project;
  }

  // Create a new project
  async create(data: CreateProjectInput): Promise<Project> {
    const newProject = new this.projectModel(data);
    return newProject.save();
  }

  // Update an existing project
  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('project_leader worker attendance project_closing')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    return updatedProject;
  }

  // Delete a project by ID
  async delete(id: string): Promise<boolean> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }
    return true;
  }
}
