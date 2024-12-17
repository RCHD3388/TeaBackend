import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { PurchasingService } from './purchasing.service';
import { PurchasingResolver } from './purchasing.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([]),
  ],
  providers: [PurchasingResolver, PurchasingService],
  exports: []
})
export class PurchasingModule {}
