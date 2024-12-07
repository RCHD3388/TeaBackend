import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeRole, EmployeeSkill } from './schema/employee.schema';
import { CreateEmployeeSkillInput, UpdateEmployeeSkillInput } from './types/employee.types';

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

  private async getNextEmployeeSkillId(): Promise<string> {
    const skills = await this.employeeSkillModel.find().select('id').exec();
    const skillIds = skills.map((sk) => sk.id);
    const maxId = skillIds.reduce((max, id) => {
      const numberPart = parseInt(id.slice(2), 10);
      return numberPart > max ? numberPart : max;
    }, 0);

    const nextId = `ES${maxId + 1}`;
    return nextId;
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
    let newId = await this.getNextEmployeeSkillId();
    if (await this.doesSkillExist(name) == true) throw new BadRequestException(`Skill with name ${name} already exist`);
    const newSkill = new this.employeeSkillModel({ id: newId, name, description });
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
    const employee = await this.employeeSkillModel.findById(id).exec();

    if (!employee) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }
    if (employee.already_used) {
      throw new BadRequestException('This Employee skill has already been used and cannot be deleted');
    }

    const deletedEmpSkill = await this.employeeSkillModel.findByIdAndDelete(id).exec();
    return deletedEmpSkill;
  }
}
