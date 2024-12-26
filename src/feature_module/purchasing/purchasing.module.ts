import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { PurchasingService } from './purchasing.service';
import { PurchasingResolver } from './purchasing.resolver';
import { PurchaseOrder, PurchaseOrderSchema, PurchaseTransaction, PurchaseTransactionSchema } from './schema/purchasing.schema';
import { InventoryModule } from '../inventory/inventory.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: PurchaseOrder.name, schema: PurchaseOrderSchema},
      {name: PurchaseTransaction.name, schema: PurchaseTransactionSchema}
    ]),
    InventoryModule,
    PersonModule
  ],
  providers: [PurchasingResolver, PurchasingService],
  exports: []
})
export class PurchasingModule {}
