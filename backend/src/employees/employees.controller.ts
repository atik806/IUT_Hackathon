import { Controller, Get } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAllEmployees() {
    return this.employeesService.getAllEmployees();
  }
}
