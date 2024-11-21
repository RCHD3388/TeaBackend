import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateProjectInput {
  @Field()
  name: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  target_date?: Date;

  @Field({ nullable: true })
  finished_at?: Date;

  @Field()
  priority: 'low' | 'medium' | 'high';

  @Field()
  status: 'ongoing' | 'completed' | 'closed';

  @Field({ nullable: true })
  project_leader?: string;

  @Field(() => [String], { nullable: true })
  worker?: string[];

  @Field(() => [String], { nullable: true })
  attendance?: string[];

  @Field({ nullable: true })
  project_closing?: string;
}
