import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { Warehouse, WarehouseType } from './schema/warehouse.schema';
import { Project } from '../project/schema/project.schema';
import { CreateWarehouseInput, UpdateWarehouseInput } from './types/warehouse.types';
import { User } from '../user/schema/user.schema';
import { Employee, EmployeeRole } from '../person/schema/employee.schema';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) { }

  async findAll(user: User): Promise<Warehouse[]> {
    if(((user.employee as Employee).role as EmployeeRole).name == "mandor"){
      return await this.warehouseModel.find().exec();
    }
    return await this.warehouseModel.find().populate('project').exec() 
  }

  async findAllByProjectLeader(user: User): Promise<Warehouse[]> {
    if(((user.employee as Employee).role as EmployeeRole).name == "mandor"){
      return await this.warehouseModel.find({project_leader: (user.employee as Employee)._id.toString()}).exec();
    }else{
      return await this.warehouseModel.find({$or: [{project: null}, {project: { $size: 0 }}]}).exec();
    }
  }

  async findWarehouseById(id: string, user: User): Promise<Warehouse> {
    let target_warehouse = await this.warehouseModel.findById(id).populate('project').exec();
    if (!target_warehouse) throw new NotFoundException('Warehouse tidak ditemukan')

    // check if user is project leader of the project
    if ((((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && (
        target_warehouse.project == null
        ||
        (target_warehouse.project as Project).project_leader.toString() != (user.employee as Employee)._id.toString()
      )
    )
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }

    return target_warehouse
  }

  async create(createWarehouseInput: CreateWarehouseInput, session?: ClientSession): Promise<Warehouse> {
    
    let { type, project, name } = createWarehouseInput
    if (type === 'project') {
      // check if project exist
      let target_project = await this.projectModel.findById(project).session(session).exec()
      if (!target_project) throw new BadRequestException('Project tidak ditemukan')

      // check if project already have an warehouse
      let target_project_warehouse = await this.warehouseModel.findOne({ project: target_project._id }).session(session).exec()
      if (target_project_warehouse) throw new BadRequestException('Project ini sudah memiliki warehouse')
    }

    if (type === 'warehouse') {
      let target_project_warehouse = await this.warehouseModel.findOne({ name: name }).session(session).exec()
      if (target_project_warehouse) throw new BadRequestException('Warehouse perusahaan dengan nama tersebut telah ada')
    }

    const new_warehouse = new this.warehouseModel(createWarehouseInput);
    new_warehouse.save({ session })

    return new_warehouse
  }

  async update(id: string, updateWarehouseInput: UpdateWarehouseInput): Promise<Warehouse> {
    let { name, status } = updateWarehouseInput

    // get target edit warehouse
    let target_warehouse = await this.warehouseModel.findById(id).exec()
    if (!target_warehouse) throw new NotFoundException('Warehouse tidak ditemukan')

    if (name) {
      // check if warehouse name already exist in current type of warehouse
      let constraint_warehouse = await this.warehouseModel.findOne({ name: name, type: target_warehouse.type, _id: { $ne: id } }).exec()
      if (constraint_warehouse) throw new BadRequestException(`Warehouse dengan jenis ${target_warehouse.type} dengan nama tersebut telah ada`)
    }

    if (status && target_warehouse.status != status && target_warehouse.type == WarehouseType.PROJECT) {
      throw new BadRequestException('Hanya warehouse dengan jenis inventory yang dapat diubah status')
    }

    let updatedProject = this.warehouseModel.findByIdAndUpdate(id, updateWarehouseInput, { new: true }).populate('project').exec()
    return updatedProject
  }
}
