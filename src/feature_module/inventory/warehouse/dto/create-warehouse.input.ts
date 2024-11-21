import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsIn } from 'class-validator';

@InputType()
export class CreateWarehouseInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsString()
    description?: string;
    
    @Field()
    @IsString()
    @IsIn(['inventory', 'project'])
    type: string;

    @Field({ nullable: true })
    @IsString()
    project?: string;

    @Field({ nullable: false })
    @IsString()
    address?: string;
}