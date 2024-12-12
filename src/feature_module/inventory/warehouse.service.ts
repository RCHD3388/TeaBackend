import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Warehouse } from './schema/warehouse.schema';
import { Project } from '../project/schema/project.schema';
import { CreateWarehouseInput } from './types/warehouse.types';
import { User } from '../user/schema/user.schema';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createWarehouseInput: CreateWarehouseInput): Promise<Warehouse> {
    
    let { type, project } = createWarehouseInput
    if(type === 'project') {
      // check if project exist
      let target_project = await this.projectModel.findById(project).exec()
      if(!target_project) throw new BadRequestException('Project tidak ditemukan') 
      
      // check if project already have an warehouse
      let target_project_warehouse = await this.warehouseModel.findOne({ project: target_project._id }).exec()
      if(target_project_warehouse) throw new BadRequestException('Project ini sudah memiliki warehouse')
    }
    
    const new_warehouse = await this.warehouseModel.create(createWarehouseInput);
    
    return new_warehouse
  }
}
