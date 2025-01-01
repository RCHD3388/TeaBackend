import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Attendance, AttendanceDetail, AttendanceModule, Project, ProjectCostLog } from "../schema/project.schema";
import { ClientSession, Model } from "mongoose";
import { CreateAttendanceModuleInput, UpdateAttendanceModuleInput } from "../types/project_sub.types";
import { Employee, EmployeeRole } from "src/feature_module/person/schema/employee.schema";
import { User } from "src/feature_module/user/schema/user.schema";

@Injectable()
export class ProjectAttendService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(AttendanceModule.name) private attendanceModuleModel: Model<AttendanceModule>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) { }

  async createModule(createAttendanceModuleInput: CreateAttendanceModuleInput, user: User): Promise<AttendanceModule> {
    let { start_date, project_id } = createAttendanceModuleInput;

    // check if project exist
    let targetProject = await this.projectModel.findById(project_id).select(["attendance", "worker"]).populate(["attendance"]).exec();
    if (!targetProject || !targetProject.attendance) throw new NotFoundException('Project tidak ditemukan');

    // check if user is project leader of the project
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && (targetProject.project_leader as Employee)._id.toString() != (user.employee as Employee)._id.toString()
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }

    // check valid start date
    const existingModules: AttendanceModule[] = targetProject.attendance as AttendanceModule[];
    if (existingModules.some((attendance) => {return attendance.start_date <= start_date && start_date <= attendance.end_date})) {
      throw new BadRequestException('Tanggal mulai tidak valid, bertabrakan dengan module lain');
    }

    const existingWorker: String[] = targetProject.worker as String[];
    let actual_start_date = new Date(start_date.getTime());
    let end_date = new Date(start_date.getTime() + 6 * 24 * 60 * 60 * 1000);
    if (existingModules.some((attendance) => {return attendance.start_date <= end_date && end_date <= attendance.end_date})) {
      throw new BadRequestException('Tanggal mulai tidak valid, bertabrakan dengan module lain');
    }

    let attendances: Attendance[] = [];

    for (let i = 0; i < 7; i++) {
      // create attendance detail
      let currentDate = new Date(start_date.getTime());
      currentDate.setDate(currentDate.getDate() + i);
      let attendance_details: AttendanceDetail[] = [];
      for (let i = 0; i < existingWorker.length; i++) {
        attendance_details.push({
          employee: String(existingWorker[i]),
          check_in: false,
          check_out: false
        })
      }
      // add attendance
      attendances.push({
        date: currentDate,
        attendance_detail: attendance_details
      })
    }

    const attendanceModule = new this.attendanceModuleModel({
      start_date: actual_start_date,
      end_date: end_date,
      submit_status: false,
      attendance: attendances,
      description: '',
    });

    await attendanceModule.save();
    await this.projectModel.findByIdAndUpdate(project_id, { $push: { attendance: attendanceModule._id } }).exec();

    return attendanceModule;
  }

  async submitModule(project_id: string, module_id: string, user: User): Promise<AttendanceModule> {
    let targetProject = await this.projectModel.findById(project_id).exec();
    if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

    if (((user.employee as Employee).role as EmployeeRole).name == "mandor" && targetProject.project_leader.toString() != user.employee.toString()) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut');
    }

    if (targetProject.attendance.findIndex((att: any) => att.toString() == module_id) == -1) {
      throw new BadRequestException('Module absensi tidak ditemukan');
    }
    let attendanceModule = await this.attendanceModuleModel.findById(module_id).exec();

    attendanceModule.submit_status = true;
    return await attendanceModule.save();
  }


  async updateModule(project_id: string, module_id: string, updateInput: UpdateAttendanceModuleInput, user: User): Promise<AttendanceModule> {
    let { description, attendance, start_date } = updateInput;

    let targetProject = await this.projectModel.findById(project_id).populate(["attendance"]).exec();
    if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

    if (((user.employee as Employee).role as EmployeeRole).name == "mandor" && targetProject.project_leader.toString() != (user.employee as Employee)._id.toString()) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut');
    }

    if (targetProject.attendance.findIndex((att: any) => (att as AttendanceModule)._id.toString() == module_id) == -1) {
      throw new BadRequestException('Module absensi tidak ditemukan');
    }

    // CHECK ATTENDANCE MODULE
    let attendanceModule = await this.attendanceModuleModel.findById(module_id).exec();
    if (!attendanceModule) throw new BadRequestException('Module Absensi tidak ditemukan');

    attendanceModule.description = description ?? attendanceModule.description;
    let newAttendance: Attendance[] = attendance as Attendance[];

    // CHECK FORMAT ATTENDANCE VALID 
    // sort attendance by date
    attendanceModule.attendance.sort((a, b) => a.date.getTime() - b.date.getTime());
    newAttendance.sort((a, b) => a.date.getTime() - b.date.getTime());

    // check if the dates are all the same
    if (attendanceModule.attendance.length != newAttendance.length) throw new BadRequestException('Gagal mengupdate modul absensi, jumlah attendance tidak sama');
    for (let i = 0; i < attendanceModule.attendance.length; i++) {
      if (attendanceModule.attendance[i].date.getTime() != newAttendance[i].date.getTime()) throw new BadRequestException('Gagal mengupdate modul absensi, tanggal attendance tidak sama');
      // check if the attendance detail employee are the same
      if (attendanceModule.attendance[i].attendance_detail.length != newAttendance[i].attendance_detail.length) throw new BadRequestException('Gagal mengupdate modul absensi, jumlah attendance detail tidak sama');
      for (let j = 0; j < attendanceModule.attendance[i].attendance_detail.length; j++) {
        if (attendanceModule.attendance[i].attendance_detail[j].employee.toString() != newAttendance[i].attendance_detail[j].employee.toString()) throw new BadRequestException('Gagal mengupdate modul absensi, employee attendance detail tidak sama');
      }
    }

    // START DATE CHANGE
    if (start_date) {
      const existingModules: AttendanceModule[] = targetProject.attendance as AttendanceModule[];
      if (existingModules.some((attendance) => {
        return attendance._id.toString() != module_id && attendance.start_date <= start_date && start_date <= attendance.end_date})) {
        throw new BadRequestException('Tanggal mulai tidak valid, bertabrakan dengan modul lain');
      }

      let end_date = new Date(start_date.getTime() + 6 * 24 * 60 * 60 * 1000);
      if (existingModules.some((attendance) => {
        return attendance._id.toString() != module_id && attendance.start_date <= end_date && end_date <= attendance.end_date})) {
        throw new BadRequestException('Tanggal mulai tidak valid, bertabrakan dengan module lain');
      }

      newAttendance.sort((a, b) => a.date.getTime() - b.date.getTime());
      for (let i = 0; i < newAttendance.length; i++) {
        let currentDate = new Date(start_date.getTime());
        currentDate.setDate(currentDate.getDate() + i);
        newAttendance[i].date = currentDate;
      }
      attendanceModule.start_date = start_date;
      attendanceModule.end_date = end_date;
    }

    attendanceModule.attendance = newAttendance;
    attendanceModule.save();

    return attendanceModule;
  }

  async findAll(project_id: string, user: User): Promise<AttendanceModule[]> {
    let targetProject = await this.projectModel.findById(project_id).select(["project_leader", "attendance"]).populate({
      path: "attendance",
      populate: {
        path: 'attendance.attendance_detail.employee',
        model: 'Employee',
      }
    }).exec();
    if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

    // check if user is project leader of the project
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && targetProject.project_leader.toString() != (user.employee as Employee)._id.toString()
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }

    return targetProject.attendance.sort((a, b) => b.start_date.getTime() - a.start_date.getTime()) as AttendanceModule[];
  }

  async findOne(project_id: string, module_id: string, user: User): Promise<AttendanceModule> {
    let targetProject = await this.projectModel.findById(project_id).exec();
    if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

    // check if user is project leader of the project
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && targetProject.project_leader.toString() != (user.employee as Employee)._id.toString()
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }
    //  check if module exist
    if (targetProject.attendance.findIndex((att: any) => att.toString() == module_id) == -1) {
      throw new BadRequestException('Module absensi tidak ditemukan');
    }

    let targetModule = await this.attendanceModuleModel.findById(module_id)
      .populate({
        path: 'attendance.attendance_detail.employee',
        model: 'Employee'
      })
      .exec();
    return targetModule;
  }

  async deleteOne(project_id: string, module_id: string, user: User): Promise<AttendanceModule> {
    let targetProject = await this.projectModel.findById(project_id).populate(["attendance"]).exec();
    if (!targetProject) throw new BadRequestException('Project tidak ditemukan');

    // check if user is project leader of the project
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && (targetProject.project_leader as Employee)._id.toString() != (user.employee as Employee)._id.toString()
    ) {
      throw new ForbiddenException('User tidak diperbolehkan melakukan aksi tersebut')
    }

    // check if module exist
    let existingModules: AttendanceModule[] = targetProject.attendance as AttendanceModule[];
    let targetModule = existingModules.find((module) => module._id.toString() == module_id);
    if (!targetModule) throw new BadRequestException('Module absensi tidak ditemukan');

    if (targetModule.submit_status == true) throw new BadRequestException('Module absensi telah disubmit, tidak dapat dihapus');

    return await this.attendanceModuleModel.findByIdAndDelete(module_id).exec();
  }

  async addNewEmployee(project_id: string, employee_ids: string[], session: ClientSession) {
    let targetProject = await this.projectModel.findById(project_id).session(session);
    if (!targetProject) throw new BadRequestException('Project tidak ditemukan');

    // find existing modules
    let existingModules = await this.attendanceModuleModel.find({ _id: { $in: targetProject.attendance }, submit_status: false }).session(session);

    existingModules = await Promise.all(existingModules.map(async (module) => {
      // edit all attendance
      module.attendance = await Promise.all(module.attendance.map((attendance) => {
        // batch add attendance detail
        let newAttendanceDetail: AttendanceDetail[] = [];
        for (let i = 0; i < employee_ids.length; i++) {
          newAttendanceDetail.push({
            employee: employee_ids[i].toString(),
            check_in: false,
            check_out: false,
          })
        }
        attendance.attendance_detail.push(...newAttendanceDetail);
        return attendance;
      }))

      await module.save({ session })
      return module;
    }));
  }

  async removeEmployee(project_id: string, employee_id: string, session: ClientSession) {
    let targetProject = await this.projectModel.findById(project_id).session(session);
    if (!targetProject) throw new BadRequestException('Project tidak ditemukan');

    // check if employee exist
    let targetEmployee = await this.employeeModel.findById(employee_id).session(session);
    if (!targetEmployee) throw new BadRequestException('Karyawan tidak ditemukan');

    // find existing modules
    let existingModules = await this.attendanceModuleModel.find({ _id: { $in: targetProject.attendance }, submit_status: false }).session(session);

    existingModules = await Promise.all(existingModules.map(async (module) => {
      // edit all attendance
      module.attendance = module.attendance.map((attendance) => {
        // remove employee from all attendance detail
        attendance.attendance_detail = attendance.attendance_detail.filter(
          (detail) => {
            return detail.employee.toString() !== employee_id.toString()
          }
        );
        return attendance;
      })
      await module.save({ session })
      return module;
    }));
  }
}