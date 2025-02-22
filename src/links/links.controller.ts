import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { ClicksService } from 'src/clicks/clicks.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { RedirectLinkDto } from './dto/redirect-link.dto';

@Controller()
export class LinksController {
  constructor(
    private readonly linkService: LinksService,
    private readonly clicksService: ClicksService,
  ) {}

  @Post('links')
  async createShortLink(@Body() createLinkDto: CreateLinkDto) {
    return await this.linkService.createShortLink(createLinkDto);
  }

  @Get(':code')
  async redirect(@Param('code') shortCode: string, @Res() res, @Req() req, @Query() redirectLinkDto: RedirectLinkDto) {
    const originalUrl = await this.linkService.getOriginalUrl(shortCode, redirectLinkDto.password);

    if (!originalUrl) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await this.clicksService.trackClick(shortCode, req.ip, req.headers['user-agent']);

    return res.redirect(originalUrl);
  }
}
