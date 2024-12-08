import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaterialTransaction } from './material-transaction.schema';
import { Warehouse } from '../warehouse/warehouse.schema';
import { Material } from '../material/material.schema';
import { TransactionCategory } from '../../category_data/transaction-category.schema';
import { CreateMaterialTransactionInput } from './dto/create-material.transaction.input';
@Injectable()
export class MaterialTransactionService {
    constructor(
        @InjectModel('MaterialTransaction')
        private readonly materialTransactionModel: Model<MaterialTransaction>,
        @InjectModel('Warehouse') private readonly warehouseModel: Model<Warehouse>,
        @InjectModel('Material') private readonly materialModel: Model<Material>,
        @InjectModel('TransactionCategory') private readonly transactionCategory: Model<TransactionCategory>,
    ) { }

    async findAll(): Promise<MaterialTransaction[]> {
        return this.materialTransactionModel.find().exec();
    }
    async findByWarehouse(warehouseId: string): Promise<MaterialTransaction[]> {
        return this.materialTransactionModel.find({ warehouse: warehouseId }).exec();
    }

    async findAllRemainingItem(warehouseId: string): Promise<{ material: any; remaining: number }[]> {
        const warehouse = await this.warehouseModel.findById(warehouseId).exec();
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID "${warehouseId}" not found`);
        }
    
        // Fetch all transactions for the warehouse
        const materialTransactions = await this.materialTransactionModel.find({ warehouse: warehouseId }).exec();
    
        // Group transactions by material
        const materialMap = new Map<string, { totalIn: number; totalOut: number }>();
    
        materialTransactions.forEach(transaction => {
            const materialId = transaction.material.toString();
            const totals = materialMap.get(materialId) || { totalIn: 0, totalOut: 0 };
    
            if (transaction.in && transaction.in > 0) {
                totals.totalIn += transaction.in;
            }
    
            if (transaction.out && transaction.out > 0) {
                totals.totalOut += transaction.out;
            }
    
            materialMap.set(materialId, totals);
        });
    
        // Prepare the remaining items list
        const materialIds = Array.from(materialMap.keys());
        const materials = await this.materialModel.find({ _id: { $in: materialIds } }).exec();
    
        const materialList = materials.map(material => {
            const totals = materialMap.get(material._id.toString());
            const remaining = (totals?.totalIn || 0) - (totals?.totalOut || 0);
            return { material, remaining };
        });
        return materialList;
    }
    
    async findById(id: string): Promise<MaterialTransaction> {
        const materialTransaction = await this.materialTransactionModel.findById(id).exec();
        if (!materialTransaction) {
            throw new NotFoundException(`MaterialTransaction with ID "${id}" not found`);
        }
        return materialTransaction;
    }

    async create(createMaterialTransactionInput: CreateMaterialTransactionInput): Promise<MaterialTransaction> {
        const warehouse = await this.warehouseModel.findById(createMaterialTransactionInput.warehouse).exec();
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID "${createMaterialTransactionInput.warehouse}" not found`);
        }
    
        const material = await this.materialModel.findById(createMaterialTransactionInput.material).exec();
        if (!material) {
            throw new NotFoundException(`Material with ID "${createMaterialTransactionInput.material}" not found`);
        }
    
        const transactionCategory = await this.transactionCategory.findById(createMaterialTransactionInput.transaction_category).exec();
        if (!transactionCategory) {
            throw new NotFoundException(`TransactionCategory with ID "${createMaterialTransactionInput.transaction_category}" not found`);
        }
    
        // Generate a unique transaction code
        const transactionCode = transactionCategory.description.substring(0, 2) + transactionCategory.counter.toString().padStart(4, '0');
        transactionCategory.counter++;
        await transactionCategory.save(); // Update the counter in the database
        // Map the input to a MaterialTransaction object
        const materialTransaction = new this.materialTransactionModel({
            ...createMaterialTransactionInput,
            transactionCode,
            warehouse: warehouse._id,
            material: material._id,
            transaction_category: transactionCategory._id,
        });
    
        return materialTransaction.save();
    }
    
}