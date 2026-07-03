import { Controller, Get } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getActiveAlerts() {
    return this.alertsService.getActiveAlerts();
  }
}
