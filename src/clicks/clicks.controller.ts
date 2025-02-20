import { Controller, Get, Param } from '@nestjs/common';
import { ClicksService } from './clicks.service';

@Controller('clicks')
export class ClicksController {
  constructor(private readonly clicksService: ClicksService) {}

  @Get(':shortCode')
  async getClicks(@Param('shortCode') shortCode: string) {
    return this.clicksService.getClickByShortCode(shortCode)
  }
}
