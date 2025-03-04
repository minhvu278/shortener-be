import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upgrade-to-pro')
  @UseGuards(JwtAuthGuard)
  async upgradeToPro(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      const updatedUser = await this.usersService.upgradeToPro(user.id);
      return res.json({ success: true, message: 'Nâng cấp lên gói Pro thành công.', user: updatedUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
