import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ToolTransaction } from './tool-transaction.schema';
import { Tool } from '../tool/tool.schema';
import { Warehouse } from '../warehouse/warehouse.schema';
import { CreateToolTransactionInput } from './dto/create-tool-transaction.input';
import { TransactionCategory } from '../../category_data/transaction-category.schema';
@Injectable()
export class ToolTransactionService {
    constructor(
        @InjectModel(ToolTransaction.name)
        private readonly toolTransactionModel: Model<ToolTransaction>,
        @InjectModel(Tool.name)
        private readonly toolModel: Model<Tool>,
        @InjectModel(Warehouse.name)
        private readonly warehouseModel: Model<Warehouse>,
        @InjectModel(TransactionCategory.name)
        private readonly transactionCategory: Model<TransactionCategory>,
    ) {}

    async getToolTransactions(): Promise<ToolTransaction[]> {
        return this.toolTransactionModel.find().populate('tool').populate('warehouse').exec();
    }

    async getToolTransactionsByTool(toolId: string): Promise<ToolTransaction[]> {
        const tool = await this.toolModel.findById(toolId).exec();
        if (!tool) {
            throw new NotFoundException('Tool not found');
        }
        return this.toolTransactionModel.find({ tool: toolId }).populate('tool').populate('warehouse').exec();
    }

    async getRemainingTool(warehouseId: string, toolId: string): Promise<{ tool: any; remaining: number } | null> {
        // Check if the warehouse exists
        const warehouse = await this.warehouseModel.findById(warehouseId).exec();
        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }
    
        // Fetch all transactions for the specified tool in the warehouse
        const toolTransactions = await this.toolTransactionModel
            .find({ warehouse: warehouseId, tool: toolId })
            .populate('tool')
            .populate('warehouse')
            .exec();
    
        // Initialize counters for "in" and "out" quantities
        let totalIn = 0;
        let totalOut = 0;
    
        // Calculate total "in" and "out" quantities
        toolTransactions.forEach((toolTransaction) => {
            if (toolTransaction.in && toolTransaction.in > 0) {
                totalIn += toolTransaction.in;
            }
            if (toolTransaction.out && toolTransaction.out > 0) {
                totalOut += toolTransaction.out;
            }
        });
    
        // Calculate the remaining quantity
        const remaining = totalIn - totalOut;
    
        // If the remaining quantity is zero, return null
        if (remaining <= 0) {
            return null; // Tool is gone
        }
    
        // Return the tool and its remaining quantity
        return {
            tool: toolTransactions[0]?.tool, // Assuming all transactions refer to the same tool
            remaining,
        };
    }
    async create(createToolTransactionInput: CreateToolTransactionInput): Promise<ToolTransaction> {
        const tool = await this.toolModel.findById(createToolTransactionInput.tool).exec();
        const warehouse = await this.warehouseModel.findById(createToolTransactionInput.warehouse).exec();
        if (!tool) {
            throw new NotFoundException(`Tool with ID "${createToolTransactionInput.tool}" not found`);
        }
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID "${createToolTransactionInput.warehouse}" not found`);
        }
        const generateCode = await this.transactionCategory.findById(createToolTransactionInput.transaction_category).exec();
        if (!generateCode) {
            throw new NotFoundException(`TransactionCategory with ID "${createToolTransactionInput.transaction_category}" not found`);
        }
        const transactionCode = generateCode.description.substring(0, 2) + generateCode.counter.toString().padStart(4, '0');
        generateCode.counter++;
        await generateCode.save(); // Update the counter in the database
        const toolTransaction = new this.toolTransactionModel({...createToolTransactionInput, transactionCode, tool: tool._id, warehouse: warehouse._id, transaction_category: generateCode._id});
        return toolTransaction.save();
    }
    
}