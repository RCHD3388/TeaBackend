import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { AuthResolver } from './auth.resolver';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth_related/auth.strategy';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema}
    ]),
    JwtModule.register({
      secret: "random_jwt_secret",
      signOptions: {expiresIn: "2h"}
    })
  ],
  providers: [
    JwtStrategy, 
    AuthResolver, AuthService,
    UserResolver, UserService, 
  ],
  exports: [UserService, AuthService]
})
export class UsersModule {}
