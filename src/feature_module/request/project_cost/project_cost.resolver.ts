import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectCostService } from './project_cost.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectCostResolver {
  constructor(
    private readonly projectCostService: ProjectCostService
  ) { }

  // @Mutation(() => CategoryData)
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin")
  // async createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput): Promise<CategoryData> {
  //   return this.categoryService.create(createCategoryInput);
  // }

  // @Query(() => [CategoryData], { name: 'getCategories' })
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin", "mandor", "staff_pembelian")
  // async getCategories(
  //   @Args('categoryFilter', {nullable: true}) categoryFilter?: CategoryFilter
  // ): Promise<CategoryData[]> {
  //   return this.categoryService.findAll(categoryFilter);
  // }

  // @Mutation(() => CategoryData, { name: 'updateCategory' })
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin")
  // async updateCategory(
  //   @Args('id') id: string,
  //   @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  // ): Promise<CategoryData> {
  //   return this.categoryService.update(id, updateCategoryInput);
  // }

  // @Mutation(() => CategoryData)
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin")
  // async deleteCategory(@Args('id') id: string): Promise<CategoryData> {
  //   return this.categoryService.delete(id);
  // }
}
