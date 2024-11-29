import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import { Employee } from "../person/schema/employee.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>
  ) { }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User>{
    const user = await this.userModel.findById(id, '-password');
    if(!user){
      throw new NotFoundException(`User not found`);
    }
    const employee = await this.employeeModel.findOne({id: user.employee});
    if(!employee){
      throw new NotFoundException(`User employee data not found`)
    }
    return user;
  }
}