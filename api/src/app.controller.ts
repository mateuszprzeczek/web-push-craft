import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  @Post('subscribe')
  subscribe(@Body() body: any) {
    console.log('Subscription received:', body);
    return { success: true };
  }
}