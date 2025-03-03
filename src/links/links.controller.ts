import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { LinksService } from './links.service';
import { ClicksService } from 'src/clicks/clicks.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller()
export class LinksController {
  constructor(
    private readonly linkService: LinksService,
    private readonly clicksService: ClicksService,
    private readonly configService: ConfigService,
  ) {}

  @Post('links')
  @UseGuards(JwtAuthGuard)
  async createShortLink(@Body() createLinkDto: CreateLinkDto, @Req() req, @Res() res) {
    const user = req.user;
    const result = await this.linkService.createShortLink(createLinkDto, user);
    return res.json(result);
  }

  @Post('qr-codes')
  @UseGuards(JwtAuthGuard)
  async createQrCode(@Body() createQrCodeDto: CreateQrCodeDto, @Req() req, @Res() res) {
    const user = req.user;
    const result = await this.linkService.createQrCode(createQrCodeDto, user);
    return res.json(result);
  }

  @Get('links')
  @UseGuards(JwtAuthGuard)
  async getAllLinks(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await this.linkService.getAllLinks(user, pageNum, limitNum);
    return res.json(result);
  }

  @Get('qr-codes')
  @UseGuards(JwtAuthGuard)
  async getAllQrCodes(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await this.linkService.getAllQrCodes(user, pageNum, limitNum);
    return res.json(result);
  }

  @Get('remaining-links')
  @UseGuards(JwtAuthGuard)
  async getRemainingLinks(@Req() req, @Res() res) {
    const user = req.user;
    const result = await this.linkService.getRemainingLinks(user);
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

    if (result.requiresPassword) {
      if (isAjaxRequest) {
        return res.json(result);
      } else {
        // Redirect trực tiếp cho trình duyệt
        return res.redirect(`${frontendUrl}/password/${shortCode}`);
      }
    }

    if (result.message) {
      return res.status(400).json({ message: result.message });
    }

    // Luôn trả về JSON cho AJAX, redirect cho trình duyệt
    await this.clicksService.trackClick(shortCode, req.ip, req.headers['user-agent']);
    if (isAjaxRequest) {
      return res.json({ originalUrl: result.originalUrl });
    } else {
      return res.redirect(result.originalUrl);
    }
  }
}
