import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../feature_module/user/schema/user.schema';
import { CustomLoggerService } from '../custom_logger/logger.service';
import { employeeData, employeeRoleData, employeeSkillData, userData } from './data/person.data';
import { Employee, EmployeeRole, EmployeeSkill } from '../../feature_module/person/schema/employee.schema';

@Injectable()
export class SeederService {
  constructor(
    private logger: CustomLoggerService,
    @InjectModel(EmployeeRole.name) private readonly employeeRole: Model<EmployeeRole>,
    @InjectModel(EmployeeSkill.name) private readonly employeeSkill: Model<EmployeeSkill>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) { }

  async seedModel<T>(model: Model<T>, data: T[]) {
    await model.deleteMany();
    await model.insertMany(data);
    this.logger.log(`${model.modelName} seeded !`)
  }

  async seedUser<T>(model: Model<T>, data: T[]) {
    await model.deleteMany();
    for (const item of data) {
      const newItem = new model(item);
      await newItem.save();
    }
    this.logger.log(`${model.modelName} seeded !`)
  }

  async seed() {
    this.logger.log("Seeding data ...")
    await this.seedModel(this.employeeRole, employeeRoleData);
    await this.seedModel(this.employeeSkill, employeeSkillData);
    await this.seedModel(this.employeeModel, employeeData);
    await this.seedUser(this.userModel, userData);
    this.logger.log("Seeding completed !")
  }
}
