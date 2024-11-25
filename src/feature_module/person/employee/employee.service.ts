import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee } from './employee.schema';
import { Person } from '../person.schema';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { CreatePersonInput } from '../create-person.input';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    @InjectModel(Person.name)
    private readonly personModel: Model<Person>
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().populate('person').exec();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeModel
      .findById(id)
      .populate('person')
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return employee;
  }

  async create(data: CreateEmployeeInput): Promise<Employee> {
    const person = await this.createOrFetchPerson(data.person);

    const newEmployee = new this.employeeModel({
      person: person._id,
      hire_date: data.hire_date,
      salary: data.salary,
      status: data.status,
      role: new Types.ObjectId(data.role),
      skill: data.skill?.map((id) => new Types.ObjectId(id)),
    });
    return newEmployee.save();
  }

  //   async update(id: string, data: Partial<Employee>): Promise<Employee> {
  //     // If `person` is provided as `CreatePersonInput`, create or fetch it.
  //     if (typeof data.person === 'object' && data.person !== null) {
  //       const person = await this.createOrFetchPerson(
  //         data.person as CreatePersonInput
  //       );
  //       data.person = person._id; // Assign the ObjectId reference
  //     }

  //     const updatedEmployee = await this.employeeModel
  //       .findByIdAndUpdate(id, data, { new: true })
  //       .exec();

  //     if (!updatedEmployee) {
  //       throw new NotFoundException(`Employee with ID "${id}" not found`);
  //     }

  //     return updatedEmployee;
  //   }

  async delete(id: string): Promise<boolean> {
    const result = await this.employeeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return true;
  }

  private async createOrFetchPerson(
    personData: CreatePersonInput
  ): Promise<Person> {
    let person = await this.personModel
      .findOne({ email: personData.email })
      .exec();

    if (!person) {
      person = new this.personModel(personData);
      await person.save();
    }

    return person;
  }
}
