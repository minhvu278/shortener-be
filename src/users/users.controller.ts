import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { PlanType } from './entities/user.entity';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upgrade-plan')
  @UseGuards(JwtAuthGuard)
  async upgradeToPro(@Req() req, @Body('plan') plan: PlanType, @Res() res: Response) {
    try {
      const user = req.user;
      const updatedUser = await this.usersService.upgradePlan(user.id, plan);
      return res.json({ success: true, message: 'Nâng cấp lên gói ${plan} thành công.', user: updatedUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
