import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../feature_module/user/schema/user.schema';
import { CustomLoggerService } from '../custom_logger/logger.service';
import { employeeRoleData, employeeSkillData, getEmployeeData, getUserData } from './data/person.data';
import { Employee, EmployeeRole, EmployeeSkill } from '../../feature_module/person/schema/employee.schema';
import { CategoryData } from './../../feature_module/category/schema/category.schema';
import { categoryData } from './data/category.data';

@Injectable()
export class SeederService {
  constructor(
    private logger: CustomLoggerService,
    @InjectModel(EmployeeRole.name) private readonly employeeRole: Model<EmployeeRole>,
    @InjectModel(EmployeeSkill.name) private readonly employeeSkill: Model<EmployeeSkill>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(CategoryData.name) private readonly categoryDataModel: Model<CategoryData>
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
    let employeeRole = await this.employeeRole.findOne({ name: "owner" });
    await this.seedModel(this.employeeSkill, employeeSkillData);
    let employeeSkill = await this.employeeSkill.findOne({ name: "administrator" });
    await this.seedModel(this.employeeModel, getEmployeeData({
      role: employeeRole._id,
      skill: employeeSkill._id
    }));
    let employee = await this.employeeModel.findOne()
    await this.seedUser(this.userModel, getUserData({ employee: employee._id }));
    this.logger.log("Seeding completed !")

    await this.seedModel(this.categoryDataModel, categoryData)
  }
}
