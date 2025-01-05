import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { User } from "../user/schema/user.schema";
import { Employee, EmployeeRole } from "../person/schema/employee.schema";
import { ClientSession, Connection, Model, ObjectId, Types } from "mongoose";
import { Project } from "./schema/project.schema";
import { CreateProjectInput, UpdateProjectInput } from "./types/project.types";
import { CategoryData, CategoryType, TransactionCategory } from "../category/schema/category.schema";
import { WarehouseService } from "../inventory/warehouse.service";
import { Warehouse, WarehouseStatus, WarehouseType } from "../inventory/schema/warehouse.schema";
import { UpdateProjectClosingInput } from "./types/project_sub.types";
import { MaterialTransactionService } from "../inventory/transaction/material_transaction.service";
import { ToolTransactionService } from "../inventory/transaction/tool_transaction.service";
import { Material, Tool } from "../inventory/schema/inventory.schema";
import { populate } from "dotenv";

@Injectable()
export class ProjectService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
    private readonly warehouseService: WarehouseService,
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService
  ) { }

  private isValidTargetDate(target_date: string | Date): boolean {
    const today = new Date();
    const targetDate = new Date(target_date);
    return targetDate > today;
  }

  private async switchProjectLeader(oldLeader: Employee, newLeader: Employee, project: Project) {
    let index = oldLeader.project_history.findIndex((op) => { return op.project.toString() == project._id.toString() && !op.left_at })
    oldLeader.project_history[index].left_at = new Date();
    oldLeader.project_history[index].description = 'Mandor digantikan';
    await oldLeader.save()

    newLeader.project_history.push({
      project: project._id,
      join_at: new Date(),
      description: ""
    });
    await newLeader.save()
  }

  // find withour worker detail
  async findAll(user: User): Promise<Project[]> {
    let filter = {}
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      filter = { project_leader: (user.employee as Employee)._id.toString() }
    }

    let project = await this.projectModel.find(filter).populate(["project_leader", "status", "priority"]).exec();

    project = project.map((proj) => {
      (proj.project_leader as Employee).salary = null
      return proj
    })

    return project
  }

  // find withour worker detail
  async findProjectById(id: string, user: User): Promise<Project> {
    let filter: any = { _id: id }
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      filter = { project_leader: (user.employee as Employee)._id.toString(), _id: id }
    }

    const project = await this.projectModel.findOne(filter).populate(
      [
        "status", "priority", "project_leader", {
          path: "project_closing",
          populate: {
            path: "closed_by",
            model: "Employee"
          }
        },
        {
          path: "project_closing",
          populate: [
            {
              path: "request_project_closing",
              model: "RequestProjectClosing",
            },
            {
              path: "material_used", 
              model: "MaterialTransaction",
              populate: {
                path: "material",
                model: "Material",
                populate: [
                  {path: "merk", model: "Merk"},
                  {path: "unit_measure", model: "UnitMeasure"},
                  {path: "minimum_unit_measure", model: "UnitMeasure"},
                ]
              }
            }
          ]
        }
      ]
    ).exec();
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found for this user`);
    }

    (project.project_leader as Employee).salary = null
    return project;
  }


  async create(createProjectInput: CreateProjectInput): Promise<Project> {
    let { name, target_date, status, priority, project_leader } = createProjectInput

    let status_data = await this.categoryDataModel.findOne({ _id: status, type: CategoryType.COMPLETION_STATUS })
    let priority_data = await this.categoryDataModel.findOne({ _id: priority, type: CategoryType.PRIORITY })
    let employee_data = await this.employeeModel.findOne({ _id: project_leader }).populate(["role", "skill"]);

    // check duplicate name
    if (await this.projectModel.findOne({ name })) {
      throw new BadRequestException("Nama project yang diberikan telah digunakan sebelumnya")
    }
    // check status
    if (!status_data || !priority_data) {
      throw new BadRequestException("Status atau Prioritas yang diberikan tidak ditemukan ")
    }
    // check valid target date
    if (target_date && !this.isValidTargetDate(target_date)) {
      throw new BadRequestException("Tanggal target tidak valid, pastikan tanggal setelah tanggal hari ini")
    }
    // check valid employee mandor data
    if (!employee_data) {
      throw new BadRequestException("Pegawai mandor tidak ditemukan")
    } else {
      if ((employee_data.role as EmployeeRole).name != "mandor") throw new BadRequestException("Pegawai yang bertugas sebagai mandor harus memiliki role sesuai")
    }

    let session = await this.connection.startSession();

    try {
      session.startTransaction();

      // create new project
      let new_project = new this.projectModel(createProjectInput);
      await new_project.save({ session });

      // create warehouse
      let newWarehouse = await this.warehouseService.create({
        name: `Warehouse Proyek ${new_project.name}`,
        description: `Warehouse untuk project ${new_project.name}`,
        project: new_project._id,
        project_leader: String(new_project.project_leader),
        address: `${new_project.location}`,
        type: WarehouseType.PROJECT,
      }, session)

      // add warehouse information to project
      new_project.warehouse = newWarehouse._id
      await new_project.save({ session });

      // add project leader new project history
      employee_data.project_history.push({
        project: new_project._id,
        join_at: new Date(),
        left_at: null,
        description: ""
      })
      employee_data.save({ session });

      let project = await this.projectModel.findById(new_project._id).populate("project_leader").session(session).exec();
      (project.project_leader as Employee).salary = null

      await session.commitTransaction();
      return project;

    } catch (error) {
      await session.abortTransaction();
      throw error

    } finally {
      await session.endSession();
    }
  }

  async update(id: string, updateProjectInput: UpdateProjectInput, user: User): Promise<Project> {
    let target_project = await this.projectModel.findById(id).populate("project_leader")
    if (!target_project) throw new NotFoundException("Project yang ingin di perbarui tidak ditemukan")

    // check user not equal to role mandor
    let curren_login_employee = (user.employee as Employee)
    let current_login_user_role = (curren_login_employee.role as EmployeeRole).name
    if (
      current_login_user_role == "mandor" &&
      curren_login_employee._id.toString() != (target_project.project_leader as Employee)._id.toString()) {
      throw new ForbiddenException("User tidak diperbolehkan melakukan aksi tersebut")
    }

    const updateData: any = {};

    // update name
    if (updateProjectInput.name && target_project.name != updateProjectInput.name) {
      if (await this.projectModel.findOne({ name: updateProjectInput.name })) {
        throw new BadRequestException("Nama project yang diberikan telah digunakan sebelumnya")
      }
      updateData['name'] = updateProjectInput.name;
    }

    // update location description
    if (updateProjectInput.location && target_project.location != updateProjectInput.location) updateData['location'] = updateProjectInput.location;
    if (updateProjectInput.description && target_project.description != updateProjectInput.description) updateData['description'] = updateProjectInput.description;

    // update check target date
    if (updateProjectInput.target_date && target_project.target_date != updateProjectInput.target_date) {
      if (!this.isValidTargetDate(updateProjectInput.target_date)) {
        throw new BadRequestException("Tanggal target tidak valid, pastikan tanggal setelah tanggal hari ini")
      }
      updateData["target_date"] = updateProjectInput.target_date
    }
    // update check priority
    if (updateProjectInput.priority && target_project.priority != updateProjectInput.priority) {
      let priority_data = await this.categoryDataModel.findOne({ _id: updateProjectInput.priority, type: CategoryType.PRIORITY })
      if (!priority_data) throw new BadRequestException("Prioritas yang diberikan tidak ditemukan ")
      updateData["priority"] = updateProjectInput.priority
    }
    // update check status
    if (updateProjectInput.status && target_project.status != updateProjectInput.status) {
      let status_data = await this.categoryDataModel.findOne({ _id: updateProjectInput.status, type: CategoryType.COMPLETION_STATUS })
      if (!status_data) throw new BadRequestException("Status yang diberikan tidak ditemukan ")
      updateData["status"] = updateProjectInput.status
    }
    // update check project leader
    if (updateProjectInput.project_leader) {
      // check dif mandor
      if ((target_project.project_leader as Employee)._id != updateProjectInput.project_leader) {
        // check if mandor update project mandor 
        if (current_login_user_role == "mandor") throw new ForbiddenException("User tidak diperbolehkan melakukan aksi tersebut")

        let employee_data = await this.employeeModel.findById(updateProjectInput.project_leader).populate("role");
        // check if mandor not found
        if (!employee_data) {
          throw new BadRequestException("Pegawai mandor tidak ditemukan")
        }
        // check new mandor role valid
        if ((employee_data.role as EmployeeRole).name != "mandor") throw new BadRequestException("Pegawai yang bertugas sebagai mandor harus memiliki role sesuai")

        // PROCESS SWITCH MANDOR
        await this.switchProjectLeader(
          target_project.project_leader as Employee,
          employee_data as Employee,
          target_project as Project
        )

        updateData["project_leader"] = updateProjectInput.project_leader
      }
    }

    let updatedProject = await this.projectModel.findByIdAndUpdate(id, updateData, { new: true }).populate(["project_leader", "status", "priority"]).exec();
    if (!updatedProject) { throw new NotFoundException(`Project with id ${id} Not found`) }

    (updatedProject.project_leader as Employee).salary = null

    return updatedProject
  }

  async createProjectClosing(
    project_id: String,
    closed_by: String,
    request_project_closing: String,
    session: ClientSession
  ): Promise<Boolean> {
    let targetProject = await this.projectModel.findById(project_id).session(session).exec();

    targetProject.project_closing = {
      closed_by: closed_by,
      note: "",
      document: null,
      material_used: [],
      request_project_closing: request_project_closing
    }

    let worker_ids = targetProject.worker;
    let target_employee = await this.employeeModel.find({ _id: { $in: worker_ids } }).session(session).exec();

    // SELESAIKAN PEGAWAI YANG SEDANG BEKERJA PADA PROJECT TERSEBUT.
    targetProject.worker = [];
    await targetProject.save({ session });
    for (let i = 0; i < target_employee.length; i++) {
      let current_employee = target_employee[i];
      const projectHistoryIndex = current_employee.project_history.findIndex((history: any) => history.project.toString() === project_id && !history.left_at);
      if (projectHistoryIndex != -1) {
        current_employee.project_history[projectHistoryIndex].left_at = new Date();
        current_employee.project_history[projectHistoryIndex].description = "Project sudah selesai, telah melakukan penutupan project";
        current_employee.save({ session });
      } else {
        throw new BadRequestException(`Terjadi kesalahan data pegawai pada project tersebut.`);
      }
    }

    targetProject.finished_at = new Date();
    let targetWarehouse = await this.warehouseModel.findOne({ project: targetProject._id }).session(session).exec();
    targetWarehouse.status = WarehouseStatus.INACTIVE
    await targetWarehouse.save({ session })

    targetProject.save({ session })
    return true;
  }

  async updateProjectClosing(project_id: string, updateProjectClosingInput: UpdateProjectClosingInput, user: User): Promise<Project> {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      let targetProject = await this.projectModel.findById(project_id).session(session);
      if (!targetProject) throw new NotFoundException('Project tidak ditemukan');

      if (((user.employee as Employee).role as EmployeeRole).name == "mandor"
        && targetProject.project_leader.toString() != (user.employee as Employee)._id.toString()) {
        throw new ForbiddenException("User tidak diperbolehkan melakukan aksi tersebut")
      }

      // get warehouse data
      let currentWarehouse = await this.warehouseModel.findOne({ project: targetProject._id }).session(session).exec();
      if (!currentWarehouse) throw new NotFoundException('Terjadi kesalahan, warehouse tidak ditemukan');

      // UPDATE NOTE PROJECT CLOSING
      if (updateProjectClosingInput.note) targetProject.project_closing.note = updateProjectClosingInput.note;

      // UPDATE ITEMS INVENTORY
      if (updateProjectClosingInput.material_left) {
        if (!updateProjectClosingInput.warehouse_to) {
          throw new BadRequestException("Warehouse tujuan harus diisi, untuk pengembalian barang")
        } else {
          // PENGEMBALIAN
          if (updateProjectClosingInput.material_left && updateProjectClosingInput.material_left.length > 0) {
            await this.materialTransactionService.create({
              materials: updateProjectClosingInput.material_left,
              transaction_category: "TRF",
              warehouse_from: currentWarehouse._id.toString(),
              warehouse_to: updateProjectClosingInput.warehouse_to.toString()
            }, session)
          }
          // PENGGUNAAN
          let remainMaterials = await this.materialTransactionService.getRemainItems(currentWarehouse._id.toString(), session);
          let remainTools = await this.toolTransactionService.getRemainItems(currentWarehouse._id.toString(), session);
          let material_remain_formatted = await Promise.all(remainMaterials.map((materialtrf) => {
            return {
              material: (materialtrf.material as Material)._id.toString(),
              qty: materialtrf.remain
            }
          }))

          let tool_remain_formatted = await Promise.all(remainTools.map((tooltrf) => {
            return (tooltrf.tool as Tool)._id.toString()
          }))

          await this.materialTransactionService.create({
            materials: material_remain_formatted,
            transaction_category: "USE",
            warehouse_from: currentWarehouse._id.toString(),
          }, session)

          targetProject.project_closing.material_used = remainMaterials.map((materialtrf) => materialtrf._id.toString());

          await this.toolTransactionService.create({
            tool: tool_remain_formatted,
            transaction_category: "TRF",
            warehouse_from: currentWarehouse._id.toString(),
            warehouse_to: updateProjectClosingInput.warehouse_to.toString()
          }, session)
        }
      }

      await targetProject.save({ session })
      await session.commitTransaction();
      return targetProject
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
