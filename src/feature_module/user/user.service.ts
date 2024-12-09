import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { model, Model } from "mongoose";
import { Employee, EmployeeRole } from "../person/schema/employee.schema";
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
      user = await this.userModel.findOne({ username: param.username }, '-password').populate("employee");
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

  async create(createUserInput: CreateUserInput, user: User): Promise<User> {
    let { username, password, employee } = createUserInput;

    if (await this.userModel.findOne({ username })) {
      throw new BadRequestException("Username sudah pernah digunakan sebelumnya")
    }

    let targetEmployee = await this.employeeModel.findById(employee)
      .populate(["role"]);

    if (!targetEmployee) throw new BadRequestException("Employee tidak ditemukan")

    let loggedInUserEmployeeRole = ((user.employee as Employee).role as EmployeeRole).name
    let targetUserEmployeeRole = (targetEmployee.role as EmployeeRole).name
    if (loggedInUserEmployeeRole == "admin" &&
      (targetUserEmployeeRole == "admin" || targetUserEmployeeRole == "owner")
    ) {
      throw new ForbiddenException("User tidak diperbolehkan untuk melakukan aksi tersebut")
    }

    const newUser = new this.userModel({
      username,
      password,
      employee: employee,
    });
    await newUser.save();

    return await this.userModel.findById(newUser._id).populate("employee");
  }

  async update(id: string, updateUserInput: UpdateUserInput, user: User): Promise<User> {
    let targetUser = await this.userModel.findById(id).populate("employee");
    if (!targetUser) throw new NotFoundException(`User with id ${id} Not found`)

    // check user permission
    let targetUserRole = ((targetUser.employee as Employee).role as EmployeeRole).name;
    let loggedInUserRole = ((user.employee as Employee).role as EmployeeRole).name
    if (loggedInUserRole == "admin" &&
      (targetUserRole == "admin" || targetUserRole == "owner")
    ) {
      throw new ForbiddenException("User tidak diperbolehkan untuk melakukan aksi tersebut")
    }

    // update username
    if (updateUserInput.username) {
      if (await this.userModel.findOne({
        username: updateUserInput.username,
        _id: { $ne: targetUser._id }
      })) {
        throw new BadRequestException("Username sudah pernah digunakan")
      } else {
        // username valid
        targetUser.username = updateUserInput.username
      }
    }

    if (updateUserInput.status) {
      targetUser.status = updateUserInput.status
    }

    await targetUser.save()

    return targetUser
  }

  async updatePassword(id: string, newPassword: string, authUser: User): Promise<User> {
    let user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User dengan id not found`)
    }
    if (user._id != authUser._id) {
      throw new ForbiddenException("User tidak diperbolehkan untuk melakukan aksi tersebut")
    }
    user.password = newPassword
    user.save();
    let returnObject = user.toObject();
    delete returnObject.password
    return returnObject
  }

  async deleteUser(id: string, user: User): Promise<User> {
    let targetUser = await this.userModel.findById(id).populate("employee");
    if (!targetUser) throw new NotFoundException(`User with id ${id} Not found`)

    let targetUserRole = ((targetUser.employee as Employee).role as EmployeeRole).name;
    let loggedInUserRole = ((user.employee as Employee).role as EmployeeRole).name
    if (loggedInUserRole == "admin" &&
      (targetUserRole == "admin" || targetUserRole == "owner")
    ) {
      throw new ForbiddenException("User tidak diperbolehkan untuk melakukan aksi tersebut")
    }

    await this.userModel.findByIdAndDelete(id)
    return targetUser
  }
}
