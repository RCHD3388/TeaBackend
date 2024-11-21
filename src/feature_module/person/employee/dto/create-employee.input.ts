import { InputType, Field } from '@nestjs/graphql';
import { CreatePersonInput } from '../../create-person.input';

@InputType()
export class CreateEmployeeInput {
  @Field(() => CreatePersonInput)
  person: CreatePersonInput;

  @Field(() => Date)
  hire_date: Date;

  @Field(() => Number)
  salary: number;

  @Field(() => String)
  status: string;

  @Field(() => String)
  role: string;

  @Field(() => [String], { nullable: true })
  skill?: string[];
}
