import { Controller, Post, Body, Res } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { Response } from 'express';

@Controller('api/paypal')
export class PayPalController {
  constructor(private readonly payPalService: PayPalService) {}

  @Post('create-order')
  async createOrder(@Body('amount') amount: number, @Res() res: Response) {
    try {
      const orderId = await this.payPalService.createOrder(amount);
      return res.json({ id: orderId });
    } catch (error) {
      return res.status(500).json({ message: 'Không thể tạo order.' });
    }
  }

  @Post('capture-order')
  async captureOrder(@Body('orderID') orderId: string, @Res() res: Response) {
    try {
      const result = await this.payPalService.captureOrder(orderId);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Không thể xác nhận thanh toán.' });
    }
  }
}
