import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID hoặc PAYPAL_CLIENT_SECRET không được cấu hình trong .env');
    }

    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: number): Promise<string> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
        },
      ],
      application_context: {
        return_url: `${this.configService.get<string>('FRONTEND_URL')}/upgrade`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/upgrade`,
      },
    });

    const response = await this.client.execute(request);
    return response.result.id;
  }

  async captureOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }
}
