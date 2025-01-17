import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { LoginDto, LoginResponse } from "./types/auth.type";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Employee, EmployeeRole, EmployeeStatus } from "../person/schema/employee.schema";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from "src/core/mailer/mailer.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService
  ) { }

  async login(data: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findForAuth(data.username);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new BadRequestException("Password atau Username salah");
    }
    if (user.status == "Inactive") {
      throw new BadRequestException("User aktif tidak ditemukan")
    }

    const payload = { id: user._id, username: user.username }
    const access_token = this.jwtService.sign(payload);
    let role = ((user.employee as Employee).role as EmployeeRole).name
    let name = (user.employee as Employee).person.name

    return {
      _id: (user.employee as Employee)._id,
      username: user.username,
      role: role,
      access_token: access_token,
      name: name
    }
  }

  async resetPassword(currentPassword: string, newPassword: string, user: User): Promise<Boolean> {
    let currentUser = await this.userModel.findById(user._id).populate("employee");
    if (!currentUser || !(await bcrypt.compare(currentPassword, currentUser.password))) {
      throw new BadRequestException("Password user tidak sesuai");
    }
    if ((currentUser.employee as Employee).status == EmployeeStatus.INACTIVE) {
      throw new BadRequestException("User telah tidak aktif, tidak dapat mengubah password")
    }
    currentUser.password = newPassword
    await user.save();
    await this.mailerService.sendPasswordResetEmail((currentUser.employee as Employee).person.email, (currentUser.employee as Employee).person.name);
    return true
  }
}