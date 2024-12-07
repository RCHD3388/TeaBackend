import { Employee } from "src/feature_module/person/schema/employee.schema";
import { EmployeeDto } from "src/feature_module/person/types/employee.types";

export interface UserEmployeeDTO {
  _id: any,
  username: string, 
  password?: string,
  status: string,
  employee: Employee
}