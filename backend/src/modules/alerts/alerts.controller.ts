import { Controller, Get, Post, Param, Patch } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('active')
  getActiveAlerts() {
    return this.alertsService.getActiveAlerts();
  }

  @Post('scan-now')
  triggerScanNow() {
    return this.alertsService.evaluateAllRules();
  }

  @Patch(':id/acknowledge')
  acknowledgeAlert(@Param('id') id: string) {
    return this.alertsService.acknowledgeAlert(id);
  }
}
