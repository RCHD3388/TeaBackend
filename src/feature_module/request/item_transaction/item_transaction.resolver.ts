import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { ItemTransactionService } from './item_transaction.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class ItemTransactionResolver {
  constructor(
    private readonly itemTransactionService: ItemTransactionService
  ) { }

}
