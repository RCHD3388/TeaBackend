import { Employee, EmployeeRole, EmployeeSkill } from "src/feature_module/person/schema/employee.schema";
import { User, UserStatus } from "../../../feature_module/user/schema/user.schema";
import { Person } from "src/feature_module/person/schema/person.schema";

export const employeeRoleData: Partial<EmployeeRole>[] = [
  { id: "ER1", name: "owner", description: "Pemilik Perusahaan"},
  { id: "ER2", name: "admin", description: "Administrator perusahaan yang berperan penting dalam monitoring perusahaan"},
  { id: "ER3", name: "mandor", description: "Pimpinan dari sebuah project yang akan mengelola data dari project yang sedang ditangani pada perusahaan"},
  { id: "ER4", name: "staff_pembelian", description: "Staff yang akan membantu proses purchasing, untuk pengelolaan data pembelian dan transaksi perusahaan"}
]

export const employeeSkillData: Partial<EmployeeSkill>[] = [
  { id: "ES1", name: "administrator", description: "Pemilik Perusahaan"},
]

export const employeeData: Partial<Employee>[] = [
  {
    id: "EM1",
    person: { name: "Richard Rafer Guy", email: "richard@gmail.com", phone_number: "0812345678", address: "Jln Hehe, No 123"}, 
    hire_date: new Date("2010-01-12T00:00:00.000Z"),
    salary: 10000000,
    status: "Active",
    role: "ER1",
    project_history: [],
    skill: ["ES1"]
  }
]

export const userData: Partial<User>[] = [
  { username: "richard", password: "password", status: UserStatus.ACTIVE, employee: "EM1" }
]