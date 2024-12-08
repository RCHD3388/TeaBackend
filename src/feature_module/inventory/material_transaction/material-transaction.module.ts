import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {MaterialTransaction, MaterialTransactionSchema} from './material-transaction.schema';
import {MaterialTransactionResolver} from './material-transaction.resolver';
import {MaterialTransactionService} from './material-transaction.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialTransaction.name, schema: MaterialTransactionSchema }])],
    providers: [MaterialTransactionResolver, MaterialTransactionService],
})
export class MaterialTransactionModule {}