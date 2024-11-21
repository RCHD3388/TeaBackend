import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePersonInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  address: string;
}
