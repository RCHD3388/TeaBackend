import { InputType, Field } from '@nestjs/graphql';
import { CreatePersonInput } from '../../create-person.input';

@InputType()
export class UpdateEmployeeInput {
  @Field(() => String, { nullable: true }) // Allow optional ObjectId as a string
  person?: string | CreatePersonInput; // Explicitly define person type

  @Field(() => Date, { nullable: true })
  hire_date?: Date;

  @Field(() => Number, { nullable: true })
  salary?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  role?: string;

  @Field(() => [String], { nullable: true })
  skill?: string[];
}
