import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSkill, EmployeeSkillSchema } from './employee-skill.schema';
import { EmployeeSkillResolver } from './employee-skill.resolver';
import { EmployeeSkillService } from './employee-skill.service';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeSkill.name, schema: EmployeeSkillSchema },
    ]),
  ],
  providers: [EmployeeSkillResolver, EmployeeSkillService],
})
export class EmployeeSkillModule {}
