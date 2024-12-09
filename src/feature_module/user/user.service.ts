import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { model, Model } from "mongoose";
import { Employee } from "../person/schema/employee.schema";
import { CreateUserInput, UpdateUserInput } from "./types/user.types";
import path from "path";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>
  ) { }

  async findForAuth(username: string): Promise<User | null> {
    let user = await this.userModel.findOne({ username }).populate("employee");
    return user;
  }

  async findOneUser(param: { username?: string; id?: string }): Promise<User> {
    let user = null;
    if (param.username) {
      user = await this.userModel.findOne({username: param.username}, '-password').populate("employee");
    }
    if (param.id) {
      user = await this.userModel.findById(param.id, '-password').populate("employee");
    }

    if (!user) {
      throw new UnauthorizedException(`User not found`);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    let users = await this.userModel.find({}, '-password').populate("employee");
    return users;
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    let { username, password, employee } = createUserInput;

    let targetEmployee = await this.employeeModel.findById(employee);
    if(!targetEmployee) throw new BadRequestException("Employee tidak ditemukan")

    const newUser = new this.userModel({
      username,
      password,
      employee: employee,
    });

    const savedUser = await newUser.save();
    const userObject = savedUser.toObject()
    delete userObject.password;
    return userObject;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const updateData: any = {};

    if (updateUserInput.username) updateData.username = updateUserInput.username;
    if (updateUserInput.status) updateData.status = updateUserInput.status;

    let updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-password")
      .populate("employee")
      .exec();
    if (!updatedUser) { throw new NotFoundException(`User with id ${id} Not found`) }
    return updatedUser
  }
}
