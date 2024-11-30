import { Employee } from "src/feature_module/person/schema/employee.schema";

export interface UserEmployeeDTO {
  _id: any,
  username: string, 
  password?: string,
  status: string,
  employee: Employee
}