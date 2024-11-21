import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsIn } from 'class-validator';

@InputType()
export class UpdateWarehouseInput {
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
    @IsIn(['active', 'inactive'])
    status?: string;

    @Field({ nullable: false })
    @IsString()
    address?: string;
}
