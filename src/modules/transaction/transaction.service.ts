import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionInput } from './create-transaction.input';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  create(createTransactionInput: CreateTransactionInput): Promise<Transaction> {
    const transaction = this.transactionRepository.create(createTransactionInput);
    return this.transactionRepository.save(transaction);
  }
}
