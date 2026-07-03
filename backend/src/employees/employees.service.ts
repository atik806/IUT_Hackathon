import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Employee } from '../common/types';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      this.logger.error(`Failed to fetch employees: ${error.message}`);
      throw error;
    }

    return data || [];
  }
}
