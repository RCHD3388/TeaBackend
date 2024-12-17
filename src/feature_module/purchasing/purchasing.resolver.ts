import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { PurchasingService } from './purchasing.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class PurchasingResolver {
  constructor(
    private readonly purchasingService: PurchasingService
  ) { }

}
