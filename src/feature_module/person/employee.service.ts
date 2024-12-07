import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeRole, EmployeeSkill } from './schema/employee.schema';
import { CreateEmployeeInput, EmployeeDto, RoleSkillEmployeeUpdateInput, UpdateEmployeeInput } from './types/employee.types';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(EmployeeSkill.name) private readonly employeeSkillModel: Model<EmployeeSkill>,
    @InjectModel(EmployeeRole.name) private readonly employeeRoleModel: Model<EmployeeRole>,
  ) { }

  private isHireDateValid(hire_date: string | Date): boolean {
    const today = new Date();
    const hireDate = new Date(hire_date);
    return hireDate <= today;
  }

  private async getNextEmployeeId(): Promise<string> {
    const employees = await this.employeeModel.find().select('id').exec();
    const employeeIds = employees.map((emp) => emp.id);
    const maxId = employeeIds.reduce((max, id) => {
      const numberPart = parseInt(id.slice(2), 10);
      return numberPart > max ? numberPart : max;
    }, 0);

    const nextId = `EM${maxId + 1}`;
    return nextId;
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findAll(): Promise<Employee[]> {
    let employee = this.employeeModel.find().exec();
    return employee
  }

  async create(createEmployeeInput: CreateEmployeeInput): Promise<Employee> {
    const { person, hire_date, salary, status, role, skill } = createEmployeeInput;
    const newId = await this.getNextEmployeeId();
    const DBrole = await this.employeeRoleModel.findOne({ id: role.id })
    const DBskill = await this.employeeSkillModel.findOne({ id: skill.id })

    if (!this.isHireDateValid(hire_date)) {
      throw new BadRequestException("Hire date cannot be in the future")
    }

    if (!DBrole || !DBskill) {
      throw new NotFoundException("Role or Skill not found")
    }

    if (DBskill.already_used == false) {
      DBskill.already_used = true
      await DBskill.save()
    }

    const newEmployee = new this.employeeModel({
      id: newId, person, hire_date, salary, status,
      role: { id: DBrole.id, name: DBrole.name },
      skill: [{ id: DBskill.id, name: DBskill.name }],
      project_history: [],
    });

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
    if (updateEmployeeInput.status) updateData.status = updateEmployeeInput.status;
    if (updateEmployeeInput.salary) updateData.salary = updateEmployeeInput.salary;
    if (updateEmployeeInput.hire_date) {
      if (!this.isHireDateValid(updateEmployeeInput.hire_date)) {
        throw new BadRequestException("Hire date cannot be in the future")
      }
      updateData.hire_date = updateEmployeeInput.hire_date
    };

    // Update role and skills if present
    if (updateEmployeeInput.role) {
      const { id } = updateEmployeeInput.role;
      let targetUpdatedRole = await this.employeeRoleModel.findOne({ id })
      if (!targetUpdatedRole) { throw new NotFoundException("Role is not found") }
      updateData.role = { id: targetUpdatedRole.id, name: targetUpdatedRole.name }
    }

    if (updateEmployeeInput.skills && updateEmployeeInput.skills.length > 0) {
      const skillIds = updateEmployeeInput.skills.map((skill) => skill.id);
      const uniqueSkillIds = new Set(skillIds);
      if (skillIds.length !== uniqueSkillIds.size) {
        throw new NotFoundException("Duplicate skill IDs found");
      }

      const DBskill = await this.employeeSkillModel.find();
      updateData.skill = updateEmployeeInput.skills.map((skill: RoleSkillEmployeeUpdateInput) => {
        let skillDetailData = DBskill.find((sk) => sk.id === skill.id)
        if (!skillDetailData) {
          throw new NotFoundException("Skill Not Found")
        }
        return { id: skillDetailData.id, name: skillDetailData.name }
      })

    }

    let updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedEmployee) { throw new NotFoundException(`Employee with id ${id} Not found`) }
    return updatedEmployee
  }
}
