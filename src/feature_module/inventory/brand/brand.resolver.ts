import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {BrandService} from './brand.service';
import {Brand} from './brand.schema';
import {CreateBrandInput} from './dto/create-brand.input';

@Resolver(() => Brand)
export class BrandResolver {
    constructor(private readonly brandService: BrandService) {}

    @Query(() => [Brand])    
    async brands(): Promise<Brand[]> {
        return await this.brandService.findAll();
    }

    @Mutation(() => Brand)
    async createBrand(@Args('brand') brand: CreateBrandInput): Promise<Brand> {
        return await this.brandService.create(brand);
    }
}