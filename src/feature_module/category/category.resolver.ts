import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryData } from './schema/category.schema';

@Resolver(() => CategoryData)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}
}
