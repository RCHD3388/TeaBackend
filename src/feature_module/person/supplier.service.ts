import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierStatus } from './schema/supplier.schema';
import { CreateSupplierInput, UpdateSupplierInput } from './types/supplier.types';
import { FilterInput } from '../types/global_input_types.types';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
  ) { }

  async findSupplierById(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async findAll(filter?: FilterInput): Promise<Supplier[]> {
    let filt = {};
    if (filter) filt = {status: SupplierStatus.ACTIVE};

    let employee = await this.supplierModel.find(filt).exec();
    return employee
  }

  async create(createSupplierInput: CreateSupplierInput): Promise<Supplier> {
    const { person, name, status } = createSupplierInput;

    let targetSupplierConstraint = await this.supplierModel.findOne({ name }).exec() 
    if(targetSupplierConstraint) throw new BadRequestException('Supplier dengan nama tersebut sudah ada')

    const newEmployee = new this.supplierModel({
      person, name, status,
    })

    return await newEmployee.save();
  }

  async update(id: string, updateSupplierInput: UpdateSupplierInput): Promise<Supplier> {
    const updateData: any = {};

    if (updateSupplierInput.name) updateData['person.name'] = updateSupplierInput.name;
    if (updateSupplierInput.email) updateData['person.email'] = updateSupplierInput.email;
    if (updateSupplierInput.phone_number) updateData['person.phone_number'] = updateSupplierInput.phone_number;
    if (updateSupplierInput.address) updateData['person.address'] = updateSupplierInput.address;

    if (updateSupplierInput.status) updateData.status = updateSupplierInput.status;
    if (updateSupplierInput.company_name) {
      let targetSupplierConstraint = await this.supplierModel.findOne({ name: updateSupplierInput.company_name, _id: { $ne: id } }).exec()
      if(targetSupplierConstraint) throw new BadRequestException('Supplier dengan nama tersebut sudah ada')
      updateData.name = updateSupplierInput.company_name;
    }

    let updatedSupplier = await this.supplierModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedSupplier) { throw new NotFoundException(`Supplier with id ${id} Not found`) }
    return updatedSupplier
  }
}
