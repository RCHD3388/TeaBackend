import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { CreateTransactionInput } from './create-transaction.input';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

@Mutation(() => Transaction)
  createTransaction(
    @Args('createTransactionInput') createTransactionInput: CreateTransactionInput,
  ): Promise<Transaction> {
    return this.transactionService.create(createTransactionInput);
  }
}
