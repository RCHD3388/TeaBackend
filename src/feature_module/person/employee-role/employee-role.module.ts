import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeRole, EmployeeRoleSchema } from './employee-role.schema';
import { EmployeeRoleResolver } from './employee-role.resolver';
import { EmployeeRoleService } from './employee-role.service';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeRole.name, schema: EmployeeRoleSchema },
    ]),
    GraphQLModule.forRoot({
      typePaths: [join(process.cwd(), '../schema/employee-role.graphql')], // Load schema from .graphql file
    }),
  ],
  providers: [EmployeeRoleResolver, EmployeeRoleService],
})
export class EmployeeRoleModule {}
