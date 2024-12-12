import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeRole, EmployeeSkill, EmployeeStatus } from './schema/employee.schema';
import { CreateEmployeeInput, EmployeeFilter, UpdateEmployeeInput } from './types/employee.types';
import { User, UserStatus } from '../user/schema/user.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(EmployeeSkill.name) private readonly employeeSkillModel: Model<EmployeeSkill>,
    @InjectModel(EmployeeRole.name) private readonly employeeRoleModel: Model<EmployeeRole>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  private employeePopulateOption = [
    { path: "role", model: "EmployeeRole", localField: "role", foreignField: "id" },
    { path: "skill", model: "EmployeeSkill", localField: "skill", foreignField: "id" }
  ]

  private isHireDateValid(hire_date: string | Date): boolean {
    const today = new Date();
    const hireDate = new Date(hire_date);
    return hireDate <= today;
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findAll(employeeFilter?: EmployeeFilter, custom_filter?: any, withSalary?: boolean): Promise<Employee[]> {
    let employee_filter: any = {}
    if (employeeFilter?.filter) {
      let roleIds = (await this.employeeRoleModel.find({ name: { $in: employeeFilter.filter } }).select("_id")).map((empRole) => empRole._id)
      employee_filter.role = { $in: roleIds }
    }
    if (employeeFilter?.status) {
      employee_filter.status = "Active"
    }
    if (custom_filter) {
      employee_filter = { ...employee_filter, ...custom_filter }
    }
    let salaryFilter = {}
    if(withSalary == false) {
      salaryFilter = { salary: 0 }
    }

    let employee = await this.employeeModel.find(employee_filter, salaryFilter).exec();
    return employee
  }

  async create(createEmployeeInput: CreateEmployeeInput, user: User): Promise<Employee> {
    const { person, hire_date, salary, status, role, skill } = createEmployeeInput;
    const DBrole = await this.employeeRoleModel.findById(role)
    const DBskill = await this.employeeSkillModel.findById(skill)

    if (!this.isHireDateValid(hire_date)) {
      throw new BadRequestException("Hire date cannot be in the future")
    }
    if (!DBrole || !DBskill) {
      throw new NotFoundException("Role or Skill not found")
    }
    let employee = user.employee as Employee
    if ((employee.role as EmployeeRole).name == "admin" && (DBrole.name == "admin" || DBrole.name == "owner")) {
      throw new ForbiddenException("Not allowed to perform this action.")
    }

    const newEmployee = new this.employeeModel({
      person, hire_date, salary, status,
      role: DBrole._id,
      skill: [DBskill._id],
      project_history: [],
    })

    return await newEmployee.save();
  }

  async update(id: string, updateEmployeeInput: UpdateEmployeeInput): Promise<Employee> {
    const updateData: any = {};

    // Update fields from person object
    if (updateEmployeeInput.name) updateData['person.name'] = updateEmployeeInput.name;
    if (updateEmployeeInput.email) updateData['person.email'] = updateEmployeeInput.email;
    if (updateEmployeeInput.phone_number) updateData['person.phone_number'] = updateEmployeeInput.phone_number;
    if (updateEmployeeInput.address) updateData['person.address'] = updateEmployeeInput.address;

    // Update other fields
    if (updateEmployeeInput.status) {
      updateData.status = updateEmployeeInput.status;
    }
    if (updateEmployeeInput.salary) updateData.salary = updateEmployeeInput.salary;
    if (updateEmployeeInput.hire_date) {
      if (!this.isHireDateValid(updateEmployeeInput.hire_date)) {
        throw new BadRequestException("Hire date cannot be in the future")
      }
      updateData.hire_date = updateEmployeeInput.hire_date
    };

    // Update role and skills if present
    if (updateEmployeeInput.role) {
      const roleId = updateEmployeeInput.role;
      let targetUpdatedRole = await this.employeeRoleModel.findById(roleId)
      if (!targetUpdatedRole) { throw new BadRequestException("Role tidak ditemukan") }
      updateData.role = targetUpdatedRole._id
    }

    if (updateEmployeeInput.skills && updateEmployeeInput.skills.length > 0) {
      const skillIds = updateEmployeeInput.skills;
      const uniqueSkillIds = new Set(skillIds);
      if (skillIds.length !== uniqueSkillIds.size) {
        throw new BadRequestException("Skill dengan nama yang sama tidak diperbolehkan.");
      }

      const DBskill = await this.employeeSkillModel.find();
      updateData.skill = updateEmployeeInput.skills.map((skill: string) => {
        let skillDetailData = DBskill.find((sk) => sk._id.toString() === skill)
        if (!skillDetailData) {
          throw new NotFoundException("Skill Not Found")
        }
        return skillDetailData._id
      })

    }

    // control transaction database

    const session = await this.employeeModel.db.startSession()

    try {
      session.startTransaction()

      // main transaction
      let updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
      if (!updatedEmployee) { throw new NotFoundException(`Employee with id ${id} Not found`) }

      if (updateEmployeeInput.status && updateEmployeeInput.status == EmployeeStatus.INACTIVE) {
        await this.userModel.updateMany(
          { employee: id, status: UserStatus.ACTIVE },
          { $set: { status: UserStatus.INACTIVE } }
        )
      }
      // end of transaction
      await session.commitTransaction()
      return updatedEmployee
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
