import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { ClicksService } from 'src/clicks/clicks.service';

@Controller('links')
export class LinksController {
  constructor(
    private readonly linkService: LinksService,
    private readonly clicksService: ClicksService,
  ) {}

  @Post('links')
  async createShortLink(@Body('originalUrl') originalUrl: string) {
    return await this.linkService.createShortLink(originalUrl);
  }

  @Get(':code')
  async redirect(@Param('code') shortCode: string, @Res() res, @Req() req) {
    const originalUrl = await this.linkService.getOriginalUrl(shortCode);

    if (!originalUrl) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await this.clicksService.trackClick(shortCode, req.ip, req.headers['user-agent']);

    return res.redirect(originalUrl);
  }
}
