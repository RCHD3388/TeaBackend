import { InputType, Float, Field } from '@nestjs/graphql';

@InputType()
export class CreateTransactionInput {
  @Field(() => Float)
  amount: number;
}
