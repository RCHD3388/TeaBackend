// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { SeederService } from './seeder.service';
import { CustomLoggerModule } from '../custom_logger/custom-logger.module';
import { User, UserSchema } from '../../feature_module/user/schema/user.schema'
import databaseConfig from '../../common/configs/database.config';
import { Employee, EmployeeRole, EmployeeRoleSchema, EmployeeSchema, EmployeeSkill, EmployeeSkillSchema } from '../../feature_module/person/schema/employee.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [databaseConfig]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: DatabaseService.createMongooseOptions,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: EmployeeRole.name, schema: EmployeeRoleSchema},
      { name: EmployeeSkill.name, schema: EmployeeSkillSchema},
      { name: Employee.name, schema: EmployeeSchema},
      { name: User.name, schema: UserSchema}
    ]),
    CustomLoggerModule
  ],
  providers: [DatabaseService, SeederService],
  exports: [MongooseModule],
})

export class DatabaseModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) { }
  onModuleInit() {
    this.databaseService.checkConnection();
  }
}
