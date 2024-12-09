import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user/schema/user.schema";
import { Employee } from "../person/schema/employee.schema";
import { Model } from "mongoose";
import { Project } from "./schema/project.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Employee.name) private projectModel: Model<Project>
  ) { }

  private isValidTargetDate(hire_date: string | Date): boolean {
    const today = new Date();
    const hireDate = new Date(hire_date);
    return hireDate <= today;
  }

  async findAll(): Promise<Project[]> {
    let employee = await this.projectModel.find().populate(["status", "priority"]).exec();
    return employee
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).populate([
      "status", "priority", "project_leader", "worker"
    ]).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }
}
