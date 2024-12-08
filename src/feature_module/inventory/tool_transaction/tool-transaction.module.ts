import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ToolTransaction } from './tool-transaction.schema';
import {ToolTransactionResolver} from './tool-transaction.resolver';
import {ToolTransactionService} from './tool-transaction.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: ToolTransaction.name, schema: ToolTransaction }])],
    providers: [ToolTransactionResolver, ToolTransactionService],
    exports: [ToolTransactionService]
})
export class ToolTransactionModule {}