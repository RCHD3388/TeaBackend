import { EmployeeProjectHistory, RoleSkillEmployee } from "../schema/employee.schema";
import { Person } from "../schema/person.schema";

export interface EmployeeDto {
  _id: string,
  id: string,
  person: Person,
  hire_date: Date,
  salary: number,
  status: string,
  role: RoleSkillEmployee,
  project_history: EmployeeProjectHistory,
  skill: RoleSkillEmployee
}