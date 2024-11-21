import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeSkill } from './employee-skill.schema';

@Injectable()
export class EmployeeSkillService {
  constructor(
    @InjectModel(EmployeeSkill.name)
    private readonly employeeSkillModel: Model<EmployeeSkill>
  ) {}

  async findAll(): Promise<EmployeeSkill[]> {
    return this.employeeSkillModel.find().exec();
  }

  async findOne(id: string): Promise<EmployeeSkill> {
    const skill = await this.employeeSkillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException(`EmployeeSkill with ID "${id}" not found`);
    }
    return skill;
  }

  async create(data: Partial<EmployeeSkill>): Promise<EmployeeSkill> {
    const newSkill = new this.employeeSkillModel(data);
    return newSkill.save();
  }

  async update(
    id: string,
    data: Partial<EmployeeSkill>
  ): Promise<EmployeeSkill> {
    const updatedSkill = await this.employeeSkillModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedSkill) {
      throw new NotFoundException(`EmployeeSkill with ID "${id}" not found`);
    }
    return updatedSkill;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.employeeSkillModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`EmployeeSkill with ID "${id}" not found`);
    }
    return true;
  }
}
