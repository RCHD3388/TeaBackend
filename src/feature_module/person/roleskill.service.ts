import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeRole, EmployeeSkill } from './schema/employee.schema';
import { CreateEmployeeInput, EmployeeDto, RoleSkillEmployeeUpdateInput, UpdateEmployeeInput } from './types/employee.types';

@Injectable()
export class RoleSkillService {
  constructor(
    @InjectModel(EmployeeSkill.name) private readonly employeeSkillModel: Model<EmployeeSkill>,
    @InjectModel(EmployeeRole.name) private readonly employeeRoleModel: Model<EmployeeRole>,
  ) { }

  async findAllRole(): Promise<EmployeeRole[]> {
    let roles = this.employeeRoleModel.find().exec();
    return roles
  }

  async findAllSkill(): Promise<EmployeeSkill[]> {
    let skills = this.employeeSkillModel.find().exec();
    return skills
  }
}
