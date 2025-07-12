import { Controller, Get } from '@nestjs/common';

@Controller('api/stats')
export class StatsController {
    @Get('dashboard')
    getDashboardStats() {
        return {
            summary: {
                totalSubscriptions: 5421,
                totalClicks: 1287
            },
            subscriptions: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [120, 180, 240, 300, 350, 400, 420]
            },
            clicks: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [30, 45, 60, 80, 90, 120, 130]
            }
        };
    }
}
