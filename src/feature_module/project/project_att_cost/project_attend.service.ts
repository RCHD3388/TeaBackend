import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Attendance, AttendanceDetail, AttendanceModule, Project, ProjectCostLog } from "../schema/project.schema";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class ProjectAttendService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) { }
  
  
}