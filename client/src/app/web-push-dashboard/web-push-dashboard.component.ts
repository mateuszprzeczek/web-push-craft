import {Component, computed, effect, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {WebPushDashboardService} from "./services/web-push-dashboard.service";
import {RestService} from "./services/rest.service";
import {AuthService} from "../auth/services/auth.service";
import {EmptyStateComponent} from "../templates/components/empty-state/empty-state.component";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

@Component({
  selector: 'app-web-push-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, BaseChartDirective, TranslateModule, EmptyStateComponent],
  providers: [WebPushDashboardService, RestService, AuthService],
  templateUrl: './web-push-dashboard.component.html',
  styleUrl: './web-push-dashboard.component.scss'
})
export class WebPushDashboardComponent implements OnInit {
  dashboardService = inject(WebPushDashboardService);
  translate = inject(TranslateService);
  authService = inject(AuthService);

  chartLabels = () => this.dashboardService.stats()?.summary?.subscriptions?.labels ?? [];
  barChartOptions = {
    responsive: true,
    scales: {
      x: {
        ticks: {color: '#ccc'},
        grid: {color: '#444'}
      },
      y: {
        beginAtZero: true,
        ticks: {color: '#ccc'},
        grid: {color: '#444'}
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      }
    }
  };

  barChartLegend = true;

  ngOnInit() {
    const uid = this.authService.userUid();
    console.log('WebPushDashboardComponent - ngOnInit - User UID:', uid);

    if (uid) {
      console.log('WebPushDashboardComponent - Loading stats for UID:', uid);
      void this.dashboardService.loadStats(uid);
    } else {
      console.error('User not logged in or UUID not available');
    }
  }


  subscriptionChartData = () => ({
    labels: this.chartLabels(),
    datasets: [
      {
        data: this.dashboardService.stats()?.summary?.subscriptions?.data ?? [],
        label: this.translate.instant('webPushDashboard.subscriptions'),
        backgroundColor: '#42A5F5',
      }
    ]
  });

  clicksChartData = () => ({
    labels: this.chartLabels(),
    datasets: [
      {
        data: this.dashboardService.stats()?.summary?.clicks?.data ?? [],
        label: this.translate.instant('webPushDashboard.clicks'),
        backgroundColor: '#66BB6A',
      }
    ]
  });

  displaysChartData(): ChartData<'bar'> {
    return {
      labels: this.dashboardService.stats()?.summary?.displays?.labels ?? [],
      datasets: [
        {
          data: this.dashboardService.stats()?.summary?.displays?.data ?? [],
          label: this.translate.instant('webPushDashboard.displays'),
        }
      ]
    };
  }
}
