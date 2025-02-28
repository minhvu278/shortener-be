import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { ClicksService } from 'src/clicks/clicks.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class LinksController {
  constructor(
    private readonly linkService: LinksService,
    private readonly clicksService: ClicksService,
    private readonly configService: ConfigService,
  ) {}

  @Post('links')
  async createShortLink(@Body() createLinkDto: CreateLinkDto) {
    return await this.linkService.createShortLink(createLinkDto);
  }

  @Get('links')
  async getAllLinks(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await this.linkService.getAllLinks(pageNum, limitNum);
    return res.json(result);
  }

  @Get(':code')
  async redirect(
    @Param('code') shortCode: string,
    @Req() req,
    @Res() res,
    @Query('password') password?: string,
  ) {
    const result = await this.linkService.getOriginalUrl(shortCode, password);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const isAjaxRequest = req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isAjaxRequest) {
      return res.json(result);
    }

    if (result.requiresPassword) {
      return res.send(`
        <html>
          <head><meta http-equiv="refresh" content="0;url=${frontendUrl}/password/${shortCode}" /></head>
          <body>Redirecting...</body>
        </html>
      `);
    }

    if (result.message) {
      return res.status(400).send(result.message);
    }

    await this.clicksService.trackClick(shortCode, req.ip, req.headers['user-agent']);
    return res.redirect(result.originalUrl);
  }
}