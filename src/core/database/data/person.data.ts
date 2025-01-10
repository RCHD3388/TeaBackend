import { Employee, EmployeeRole, EmployeeSkill } from "../../../feature_module/person/schema/employee.schema";
import { User, UserStatus } from "../../../feature_module/user/schema/user.schema";

export const employeeRoleData: Partial<EmployeeRole>[] = [
  { name: "owner", description: "Pemilik Perusahaan" },
  { name: "admin", description: "Administrator perusahaan yang berperan penting dalam monitoring perusahaan" },
  { name: "mandor", description: "Pimpinan dari sebuah project yang akan mengelola data dari project yang sedang ditangani pada perusahaan" },
  { name: "staff_pembelian", description: "Staff yang akan membantu proses purchasing, untuk pengelolaan data pembelian dan transaksi perusahaan" },
  { name: "pegawai", description: "Pegawai pekerja biasa, seperti tukang, dan pembantu proses pembelian" }
]

export const employeeSkillData: Partial<EmployeeSkill>[] = [
  { name: "administrator", description: "Pemilik Perusahaan" },
]

export const getEmployeeData = ({ role, skill }): Partial<Employee>[] => {
  return [
    {
      person: { name: "Richard Rafer Guy", email: "richard@gmail.com", phone_number: "0812345678", address: "Jln Hehe, No 123" },
      hire_date: new Date("2010-01-12T00:00:00.000Z"),
      salary: 10000000,
      status: "Active",
      role: role,
      skill: [skill],
      project_history: [],
    }
  ]
}


export const getUserData = ({ employee }): Partial<User>[] => [
  {
    username: "richard",
    password: "password",
    status: UserStatus.ACTIVE,
    employee: employee
  }
]