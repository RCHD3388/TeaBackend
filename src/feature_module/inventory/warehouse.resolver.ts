import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';

@Resolver()
@UseGuards(AppAuthGuard)
export class WarehouseResolver {
  constructor() { }

  
}
