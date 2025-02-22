import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { ClicksService } from 'src/clicks/clicks.service';
import { CreateLinkDto } from './dto/create-link.dto';

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
  async redirect(@Param('code') shortCode: string, @Res() res, @Req() req, @Query('password') password: string) {
    
    try {
      const originalUrl = await this.linkService.getOriginalUrl(shortCode, password);

      if (!originalUrl) {
        return res.status(404).json({ message: 'Link not found' });
      }
  
      await this.clicksService.trackClick(shortCode, req.ip, req.headers['user-agent']);
  
      return res.redirect(originalUrl);
    } catch (error) {
      return res.status(400).json({message: error.message})
    }
  }
}
