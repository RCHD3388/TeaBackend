import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Project, ProjectCostLog } from "../schema/project.schema";
import { ClientSession, Model } from "mongoose";
import { User } from "src/feature_module/user/schema/user.schema";
import { Employee, EmployeeRole } from "src/feature_module/person/schema/employee.schema";
import { CreateRequestCostInput } from "src/feature_module/request/types/request_cost.types";
import { CreateProjectInput } from "../types/project.types";
import { CreateProjectCostLogInput } from "../types/project_sub.types";


@Injectable()
export class ProjectCostService {
  constructor(
    @InjectModel(ProjectCostLog.name) private projectCostModel: Model<ProjectCostLog>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) { }

  async findAll(projectId: string, user: User): Promise<ProjectCostLog[]> {
    let targetProject = await this.projectModel.findById(projectId).exec();
    if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

    // check if user is project leader of the project
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && targetProject.project_leader != (user.employee as Employee)._id.toString()
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }

    return this.projectCostModel.find({project: projectId}).populate(["category", "created_by"]).exec();
  }

  async createCostLog(createProjectCostLogInput: CreateProjectCostLogInput, session: ClientSession): Promise<ProjectCostLog> {
    let newdata = new this.projectCostModel(createProjectCostLogInput);

    return newdata.save({ session });
  }
}