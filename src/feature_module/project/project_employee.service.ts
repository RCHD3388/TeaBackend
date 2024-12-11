import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user/schema/user.schema";
import { Employee, EmployeeRole } from "../person/schema/employee.schema";
import { Model, ObjectId, Types } from "mongoose";
import { Project } from "./schema/project.schema";
import { CreateProjectInput, GetAllProjectEmployeeDto, UpdateProjectInput } from "./types/project.types";
import { CategoryData, CategoryType } from "../category/schema/category.schema";
import { EmployeeService } from "../person/employee.service";

@Injectable()
export class ProjectEmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly employeeService: EmployeeService
  ) { }

  private removeDuplicates(arr: string[]) {
    if (!Array.isArray(arr)) {
      throw new Error("Invalid input data");
    }
    const uniqueSet = new Set(arr);
    return Array.from(uniqueSet);
  }

  async getAllProjectEmployee(id: string, user: User): Promise<GetAllProjectEmployeeDto> {
    const project = await this.projectModel.findById(id).populate('worker').exec();
    let current_loggedin_user_role = ((user.employee as Employee).role as EmployeeRole).name

    if (current_loggedin_user_role == "mandor" && project.project_leader.toString() !== (user.employee as Employee)._id.toString()) {
      throw new ForbiddenException("User tidak diperbolehkan melakukan aksi tersebut")
    }
    let target_return_value: GetAllProjectEmployeeDto = {
      registered: project.worker.map((pw: any) => {  
        (pw as Employee).salary = null;
        return pw
      })
    }

    // check if admin / owner
    if (current_loggedin_user_role == "admin" || current_loggedin_user_role == "owner") {
      let all_employee = await this.employeeService.findAll({ filter: ["pegawai"] }, { _id: { $nin: target_return_value.registered }, status: "Active" });
      // remove salary from unregistered employee return
      target_return_value.unregistered = all_employee.map((emp) => {
        emp.salary = null;
        return emp
      })
    }

    return target_return_value
  }

  async addNewProjectEmployee(id: string, employees: string[]): Promise<Employee[]> {
    const session = await this.projectModel.db.startSession()

    try {
      session.startTransaction();

      // Validasi project
      const project = await this.projectModel.findById(id);
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Validasi setiap employee dan tambahkan ke project
      employees = this.removeDuplicates(employees)
      const employeesToAdd: Employee[] = [];
      for (const employeeId of employees) {
        const employee = await this.employeeModel.findById(employeeId).populate(["role", "skill"]);
        if (!employee) {
          throw new NotFoundException(`Employee with ID ${employeeId} not found`);
        }

        if ((employee.role as EmployeeRole).name != "pegawai") throw new BadRequestException("Pegawai yang didaftarkan harus memiliki role PEGAWAI")

        // Cek apakah employee sudah menjadi bagian dari project
        if (project.worker.findIndex((wo: any) => wo == employeeId) != -1) {
          throw new BadRequestException(`Pegawai ${employee.person.name} telah terdaftar sebagai pegawai project tersebut`);
        }

        employeesToAdd.push(employee);
      }

      // Buat employeeProjectHistory baru
      const projectHistory = {
        project: id,
        join_at: new Date(),
        left_at: null,
        description: "",
      };
      employeesToAdd.forEach(async (employee) => {
        employee.project_history.push(projectHistory)
        await employee.save()
      })

      // Tambahkan semua employee baru ke dalam project
      project.worker.push(...employeesToAdd.map((employee) => employee._id));
      await project.save();

      await session.commitTransaction();

      return employeesToAdd.map((emp) => {
        emp.salary = null
        return emp
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeProjectEmployee(id: string, employee: string, description: string): Promise<Employee> {
    // Validasi project
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Validasi employee
    const target_employee = await this.employeeModel.findById(employee).populate(["role", "skill"]);

    if (!target_employee) {
      throw new NotFoundException(`Employee with ID ${employee} not found`);
    }

    // Cek apakah employee terdaftar dalam project
    const removeIndex = project.worker.findIndex((workerId: any) => workerId.toString() === employee);


    if (removeIndex == -1) {
      throw new BadRequestException(`Pegawai ${target_employee.person.name} bukan bagian dari pegawai project`);
    }

    // Hapus employee dari daftar worker di project
    project.worker = project.worker.filter((value, index) => index != removeIndex);
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
    target_employee.salary = null;
    return target_employee;
  }
}
