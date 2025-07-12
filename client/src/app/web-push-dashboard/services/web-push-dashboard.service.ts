import { effect, inject, Injectable, signal } from '@angular/core';
import { RestService } from './rest.service';
import { DashboardStats } from '../model/interfaces/dashboard-stats.interface';

@Injectable()
export class WebPushDashboardService {
  private rest = inject(RestService);
  readonly stats = signal<DashboardStats | null>(null);

  async loadStats(uid: string) {
    try {
      const stats = await this.rest.fetchDashboardStats(uid);
      this.stats.set(stats ?? null);
    } catch (err) {
      console.error('Error loading dashboard stats', err);
      this.stats.set(null);
    }
  }
}
