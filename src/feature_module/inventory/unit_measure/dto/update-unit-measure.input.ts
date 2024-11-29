import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsIn } from 'class-validator';

@InputType()
export class UpdateUnitMeasureInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsString()
    description?: string;
}