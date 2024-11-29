import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UnitMeasureService } from './unit-measure.service';
import { UnitMeasure } from './unit-measure.schema';
import { CreateUnitMeasureInput } from './dto/create-unit-measure.input';
import { UpdateUnitMeasureInput } from './dto/update-unit-measure.input';

@Resolver(() => UnitMeasure)
export class UnitMeasureResolver {
    constructor(private readonly unitMeasureService: UnitMeasureService) {}

    @Query(() => [UnitMeasure], { name: 'unitMeasures' })
    findAll(): Promise<UnitMeasure[]> {
        return this.unitMeasureService.findAll();
    }

    @Query(() => UnitMeasure, { name: 'unitMeasure' })
    findOne(@Args('id', { type: () => String }) id: string): Promise<UnitMeasure> {
        return this.unitMeasureService.findById(id);
    }

    @Mutation(() => UnitMeasure)
    createUnitMeasure(@Args('data') data: CreateUnitMeasureInput): Promise<UnitMeasure> {
        return this.unitMeasureService.create(data);
    }

    @Mutation(() => UnitMeasure)
    updateUnitMeasure(@Args('id', { type: () => String }) id: string, @Args('data') data: UpdateUnitMeasureInput): Promise<UnitMeasure> {
        return this.unitMeasureService.update(id, data);
    }
}