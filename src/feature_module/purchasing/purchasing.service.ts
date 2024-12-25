import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrder, PurchaseTransaction } from './schema/purchasing.schema';

@Injectable()
export class PurchasingService {
  constructor(
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrder>,
    @InjectModel(PurchaseTransaction.name) private readonly purchaseTransactionModel: Model<PurchaseTransaction>,
  ) { }

  
}
