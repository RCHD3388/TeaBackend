// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { SeederService } from './seeder.service';
import { CustomLoggerModule } from '../custom_logger/custom-logger.module';
import { User, UserSchema } from '../../feature_module/user/user.schema';
import databaseConfig from '../../common/configs/database.config';
import { Person, PersonSchema } from 'src/feature_module/person/person.schema';
import {
  Employee,
  EmployeeSchema,
} from 'src/feature_module/person/employee/employee.schema';
import {
  EmployeeRole,
  EmployeeRoleSchema,
} from 'src/feature_module/person/employee-role/employee-role.schema';
import {
  Supplier,
  SupplierSchema,
} from 'src/feature_module/person/supplier.schema';
import {
  Project,
  ProjectSchema,
} from 'src/feature_module/project/project.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [databaseConfig],
    }),
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: DatabaseService.createMongooseOptions,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: EmployeeRole.name, schema: EmployeeRoleSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    CustomLoggerModule,
  ],
  providers: [DatabaseService, SeederService],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  onModuleInit() {
    this.databaseService.checkConnection();
  }
}
