import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import { Employee } from "../person/schema/employee.schema";
import { UserEmployeeDTO } from "./types/user.types";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>
  ) { }

  private userEmployeeFormater(user: User, with_password: boolean = false): UserEmployeeDTO{
    let employee = user.employee as Employee;
    let return_value = {
      _id: user._id,
      username: user.username,
      status: user.status,
      employee: employee,
    }
    if(with_password){
      return {...return_value, password: user.password}
    }
    return return_value;
  }

  async findForAuth(username: string): Promise<UserEmployeeDTO | null> {
    let user = await this.userModel.findOne({ username }).populate({
      path: "employee",
      model: "Employee",
      localField: "employee",
      foreignField: "id"
    });
    let formated_user = this.userEmployeeFormater(user, true);
    return formated_user;
  }

  async findUser(param: { username?: string; id?: string }): Promise<UserEmployeeDTO> {
    let user = null;
    if (param.username) {
      user = await this.userModel.findOne({username: param.username}, '-password').populate({
        path: "employee",
        model: "Employee",
        localField: "employee",
        foreignField: "id"
      });
    }
    if (param.id) {
      user = await this.userModel.findById(param.id, '-password').populate({
        path: "employee",
        model: "Employee",
        localField: "employee",
        foreignField: "id"
      });
    }

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    let formated_user = this.userEmployeeFormater(user);
    return formated_user;
  }
}