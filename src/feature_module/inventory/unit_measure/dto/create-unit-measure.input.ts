import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsIn } from 'class-validator';

@InputType()
export class CreateUnitMeasureInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsString()
    description?: string;
}