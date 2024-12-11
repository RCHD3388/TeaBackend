import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user/schema/user.schema";
import { Employee, EmployeeRole } from "../person/schema/employee.schema";
import { Model, ObjectId, Types } from "mongoose";
import { Project } from "./schema/project.schema";
import { CreateProjectInput, UpdateProjectInput } from "./types/project.types";
import { CategoryData, CategoryType } from "../category/schema/category.schema";

@Injectable()
export class ProjectEmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) { }

  async getAllProjectEmployee(id: string, user: User): Promise<Employee[]> {
    const project = await this.projectModel.findById(id).populate('worker').exec();
    
    if(project.project_leader == user._id) throw new ForbiddenException("User tidak diperbolehkan melakukan aksi tersebut")

    let employees = project.worker.map((pw: any) => {return pw as Employee})
    return employees
  }

  async addNewProjectEmployee(id: string, employees: string[]): Promise<Project> {
    // Validasi project
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  
    // Validasi setiap employee dan tambahkan ke project
    const employeesToAdd = [];
    for (const employeeId of employees) {
      const employee = await this.employeeModel.findById(employeeId).populate("role");
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
  
      if ((employee.role as EmployeeRole).name != "pegawai" ) throw new BadRequestException("Pegawai yang didaftarkan harus memiliki role PEGAWAI")

      // Cek apakah employee sudah menjadi bagian dari project
      if (project.worker.findIndex((wo) => wo == employeeId) != -1) {
        throw new BadRequestException(`Pegawai ${employee.person.name} telah terdaftar sebagai pegawai project tersebut`);
      }
  
      // Buat employeeProjectHistory baru
      const projectHistory = {
        project: id,
        join_at: new Date(),
        left_at: null,
        description: "",
      };
      employee.project_history.push(projectHistory);
  
      // Save new project history
      await employee.save();
      employeesToAdd.push(employee._id);
    }
  
    // Tambahkan semua employee baru ke dalam project
    project.worker.push(...employeesToAdd);
    await project.save();
    return project;
  }
  
  async removeProjectEmployee(id: string, employee: string, description: string): Promise<Project> {
    // Validasi project
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  
    // Validasi employee
    console.log(employee)
    const target_employee = await this.employeeModel.findById(employee);
    console.log(target_employee)
    if (!target_employee) {
      throw new NotFoundException(`Employee with ID ${employee} not found`);
    }
  
    // Cek apakah employee terdaftar dalam project
    const removeIndex = project.worker.findIndex((workerId: any) => workerId.toString() === employee);
    console.log(removeIndex)
    if (removeIndex == -1) {
      throw new BadRequestException(`Pegawai ${target_employee.person.name} bukan bagian dari pegawai project`);
    }
  
    // Hapus employee dari daftar worker di project
    project.worker = project.worker.splice(removeIndex, 1);
    await project.save();
  
    // Perbarui project history pada employee
    const projectHistoryIndex = target_employee.project_history.findIndex((history: any) => history.project.toString() === id && !history.left_at);
    if (projectHistoryIndex != -1) {
      target_employee.project_history[projectHistoryIndex].left_at = new Date();
      target_employee.project_history[projectHistoryIndex].description = description;
    } else {
      throw new BadRequestException(`Tidak ditemukan riwayat proyek aktif untuk pegawai dalam proyek tersebut.`);
    }
  
    // Simpan perubahan pada employee
    await target_employee.save();
    return project;
  }
}
