import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { LoginDto, LoginResponse } from "./types/auth.type";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(data: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findForAuth(data.username);
    if(!user || !(await bcrypt.compare(data.password, user.password))){
      throw new UnauthorizedException("Invalid Credentials");
    }

    const payload = { id: user._id, username: user.username }
    const access_token = this.jwtService.sign(payload);

    return {
      username: user.username,
      role: user.employee.role.name,
      access_token: access_token
    }
  }
}