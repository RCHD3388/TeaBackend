import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { LoginDto, LoginResponse } from "./types/auth.type";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Employee, EmployeeRole } from "../person/schema/employee.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(data: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findForAuth(data.username);
    if(!user || !(await bcrypt.compare(data.password, user.password))){
      throw new BadRequestException("Invalid Credentials");
    }
    if(user.status == "Inactive"){
      throw new BadRequestException("User aktif tidak ditemukan")
    }

    const payload = { id: user._id, username: user.username }
    const access_token = this.jwtService.sign(payload);
    let role = ((user.employee as Employee).role as EmployeeRole).name
    let name = (user.employee as Employee).person.name

    return {
      username: user.username,
      role: role,
      access_token: access_token,
      name: name
    }
  }
}