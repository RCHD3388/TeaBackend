import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryData } from './schema/category.schema';
import { CreateCategoryInput, UpdateCategoryInput } from './types/category.types';

@Resolver(() => CategoryData)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) { }

  @Query(() => [CategoryData], { name: 'getCategories' })
  async getCategories(): Promise<CategoryData[]> {
    return this.categoryService.findAll();
  }

  @Mutation(() => CategoryData)
  async createCategory( @Args('createCategoryInput') createCategoryInput: CreateCategoryInput): Promise<CategoryData> {
    return this.categoryService.create(createCategoryInput);
  }

  @Mutation(() => CategoryData, { name: 'updateCategory' })
  async updateCategory(
    @Args('id') id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryData> {
    return this.categoryService.update(id, updateCategoryInput);
  }

  @Mutation(() => CategoryData)
  async deleteCategory(@Args('id') id: string): Promise<CategoryData> {
    return this.categoryService.delete(id);
  }
}
