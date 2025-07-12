import {Controller, Post, Body, Get} from '@nestjs/common';

@Controller()
export class AppController {
  @Post('subscribe')
  subscribe(@Body() body: any) {
    console.log('Subscription received:', body);
    return { success: true };
  }

  @Get('stats')
  getStats() {
    return {
      labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień'],
      subscribers: [120, 190, 30, 50],
      sentMessages: [80, 140, 20, 35]
    };
  }
}