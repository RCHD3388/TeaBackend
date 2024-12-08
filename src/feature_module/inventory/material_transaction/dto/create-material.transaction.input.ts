import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';

@InputType()
export class CreateMaterialTransactionInput {
    @Field(()=> String)
    @IsString()
    material: string
    
    @Field(()=> Number)
    @IsNumber()
    in: number

    @Field(()=> Number)
    @IsNumber()
    out: number

    @Field(()=> String)
    @IsString()
    warehouse: string

    @Field(()=> Date)
    @IsDate()
    transaction_date: Date

    @Field(()=> Number)
    @IsNumber()
    price: Number


    @Field(()=> String)
    @IsString()
    transaction_category: string
}