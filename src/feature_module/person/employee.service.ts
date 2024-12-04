import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from './schema/employee.schema';
import { EmployeeDto } from './types/employee.types';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    let employee = this.employeeModel.find().exec();
    return employee
  }
}
