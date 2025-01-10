import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryData, CetegoryStatusType } from './schema/category.schema';
import { CategoryFilter, CreateCategoryInput, UpdateCategoryInput } from './types/category.types';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from './../../common/guard/roles.guard';
import { Roles } from './../../common/decorators/roles.decorator';
import { FilterInput } from '../types/global_input_types.types';

@Resolver(() => CategoryData)
@UseGuards(AppAuthGuard)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) { }

  @Mutation(() => CategoryData)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput): Promise<CategoryData> {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => [CategoryData], { name: 'getCategories' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor", "staff_pembelian")
  async getCategories(
    @Args('categoryFilter', {nullable: true}) categoryFilter?: CategoryFilter,
    @Args('filter', {nullable: true}) filter?: FilterInput
  ): Promise<CategoryData[]> {
    return this.categoryService.findAll(categoryFilter, filter);
  }

  @Mutation(() => CategoryData, { name: 'updateCategory' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async updateCategory(
    @Args('id') id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryData> {
    return this.categoryService.update(id, updateCategoryInput);
  }

  @Mutation(() => CategoryData)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async deleteCategory(@Args('id') id: string): Promise<CategoryData> {
    return this.categoryService.delete(id);
  }
}
