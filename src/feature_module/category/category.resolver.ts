import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryData } from './schema/category.schema';
import { CategoryFilter, CreateCategoryInput, UpdateCategoryInput } from './types/category.types';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

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
  @Roles("owner", "admin")
  async getCategories(
    @Args('categoryFilter', {nullable: true}) categoryFilter?: CategoryFilter
  ): Promise<CategoryData[]> {
    return this.categoryService.findAll(categoryFilter);
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
