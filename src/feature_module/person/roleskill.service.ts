import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeRole, EmployeeSkill } from './schema/employee.schema';
import { CreateEmployeeSkillInput, UpdateEmployeeSkillInput } from './types/employee.types';
import { User } from '../user/schema/user.schema';

@Injectable()
export class RoleSkillService {
  constructor(
    @InjectModel(EmployeeSkill.name) private readonly employeeSkillModel: Model<EmployeeSkill>,
    @InjectModel(EmployeeRole.name) private readonly employeeRoleModel: Model<EmployeeRole>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) { }

  private async doesSkillExist(name: string, id: string | null = null): Promise<boolean> {
    const filter: any = { name };
    if (id) { filter._id = { $ne: id }; }
    const existingSkill = await this.employeeSkillModel.findOne(filter).exec();
    if (existingSkill) return true
    return false
  }

  async findAllRole(): Promise<EmployeeRole[]> {
    let roles = this.employeeRoleModel.find().exec();
    return roles
  }

  async findAllSkill(): Promise<EmployeeSkill[]> {
    let skills = this.employeeSkillModel.find().exec();
    return skills
  }

  async createEmployeeSkill(createEmployeeSkillInput: CreateEmployeeSkillInput): Promise<EmployeeSkill> {
    let { name, description } = createEmployeeSkillInput
    if (await this.doesSkillExist(name) == true) throw new BadRequestException(`Skill with name ${name} already exist`);
    const newSkill = new this.employeeSkillModel({ name, description });
    return newSkill.save();
  }

  async updateEmployeeSkill(id: string, updateEmployeeSkillInput: UpdateEmployeeSkillInput): Promise<EmployeeSkill> {
    if (await this.doesSkillExist(updateEmployeeSkillInput.name, id)) {
      throw new BadRequestException(`Skill with name ${updateEmployeeSkillInput.name} already exist`);
    }
    let skill = await this.employeeSkillModel.findByIdAndUpdate(
      id,
      { $set: updateEmployeeSkillInput },
      { new: true, runValidators: true },
    );

    if (!skill) throw new NotFoundException(`Skill with id ${id} not found`);
    return skill;
  }

  async delete(id: string): Promise<EmployeeSkill> {
    const employeeSkill = await this.employeeSkillModel.findById(id).exec();

    if (!employeeSkill) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }

    const isSkillUsed = await this.employeeModel.exists({ skill: { $in: [employeeSkill._id] } });
    if (isSkillUsed) {
      throw new BadRequestException(`Skill with ID ${id} is already in use by an employee and cannot be deleted`);
    }

    const deletedEmpSkill = await this.employeeSkillModel.findByIdAndDelete(id).exec();
    return deletedEmpSkill;
  }
}
