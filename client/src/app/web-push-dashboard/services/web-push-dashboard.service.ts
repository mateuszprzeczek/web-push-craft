import { effect, inject, Injectable, signal } from '@angular/core';
import { RestService } from './rest.service';
import { DashboardStats } from '../model/interfaces/dashboard-stats.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class WebPushDashboardService {
  private rest = inject(RestService);
  private translate = inject(TranslateService);
  readonly stats = signal<DashboardStats | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal<boolean>(false);

  async loadStats(uid: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const stats = await this.rest.fetchDashboardStats(uid);
      this.stats.set(stats ?? null);
    } catch (err) {
      console.error(this.translate.instant('webPushDashboard.errors.loadingStats'), err);
      this.stats.set(null);
      if (err instanceof Error) {
        this.error.set(err.message);
      } else {
        this.error.set(this.translate.instant('webPushDashboard.errors.loadingStats'));
      }
    } finally {
      this.loading.set(false);
    }
  }
}
