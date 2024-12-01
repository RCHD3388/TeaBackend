import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateMaterialInput {
    @Field()
    @IsString()
    name: string;

    @Field()
    @IsString()
    description: string;

    @Field()
    brand: string;

    @Field()
    unit_measure: string;

    @Field()
    minimum_unit_measure : string;
    
    @Field()
    @IsString()
    item_category: string

    @Field()
    @IsNumber()
    conversion: number
}