import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MaterialService } from './material.service';
import { Material } from './material.schema';
import { CreateMaterialInput } from './dto/create-material.input';

@Resolver(() => Material)
export class MaterialResolver {
    constructor(private readonly materialService: MaterialService) {}

    @Query(() => [Material], { name: 'materials' })
    findAll(): Promise<Material[]> {
        return this.materialService.findAll();
    }

    @Query(() => Material, { name: 'material' })
    findOne(@Args('id', { type: () => String }) id: string): Promise<Material> {
        return this.materialService.findById(id);
    }

    @Mutation(() => Material)
    createMaterial(@Args('data') data: CreateMaterialInput): Promise<Material> {
        return this.materialService.create(data);
    }
}