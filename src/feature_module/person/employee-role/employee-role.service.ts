import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeRole } from './employee-role.schema';

@Injectable()
export class EmployeeRoleService {
  constructor(
    @InjectModel(EmployeeRole.name)
    private readonly employeeRoleModel: Model<EmployeeRole>
  ) {}

  async findAll(): Promise<EmployeeRole[]> {
    return this.employeeRoleModel.find().exec();
  }

  async findOne(id: string): Promise<EmployeeRole> {
    const employeeRole = await this.employeeRoleModel.findById(id).exec();
    if (!employeeRole) {
      throw new NotFoundException(`EmployeeRole with ID "${id}" not found`);
    }
    return employeeRole;
  }

  async create(data: Partial<EmployeeRole>): Promise<EmployeeRole> {
    const newEmployeeRole = new this.employeeRoleModel(data);
    return newEmployeeRole.save();
  }

  async update(id: string, data: Partial<EmployeeRole>): Promise<EmployeeRole> {
    const updatedEmployeeRole = await this.employeeRoleModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedEmployeeRole) {
      throw new NotFoundException(`EmployeeRole with ID "${id}" not found`);
    }
    return updatedEmployeeRole;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.employeeRoleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`EmployeeRole with ID "${id}" not found`);
    }
    return true;
  }
}
