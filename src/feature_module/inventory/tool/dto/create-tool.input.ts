import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';
import { CategoryData } from '../../../category_data/category-data.schema';
import { StockKeepingUnit } from '../../stock_keeping_unit/stock-keeping-unit.schema';
@InputType()
export class CreateToolInput {
    @Field()
    @IsString()
    name: string;
    
    @Field()
    @IsString()
    @IsOptional()
    description?: string;

    @Field()
    @IsString()
    @IsOptional()
    waranty_number?: string;

    @Field()
    @IsDate()
    @IsOptional()
    waranty_expiration_date?: Date;

    @Field()
    @IsString()
    @IsOptional()
    status?: string;

    @Field()
    @IsNumber()
    price: number;

    @Field()
    item_category: CategoryData

    @Field()
    stock_keeping_unit: StockKeepingUnit
}