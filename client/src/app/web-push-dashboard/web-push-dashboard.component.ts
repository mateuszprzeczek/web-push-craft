import {Component, computed, effect, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {WebPushDashboardService} from "./services/web-push-dashboard.service";
import {RestService} from "./services/rest.service";
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
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, BaseChartDirective, TranslateModule],
  providers: [WebPushDashboardService, RestService],
  templateUrl: './web-push-dashboard.component.html',
  styleUrl: './web-push-dashboard.component.scss'
})
export class WebPushDashboardComponent implements OnInit {
  dashboardService = inject(WebPushDashboardService);

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
    const isDemo = true; // TODO: podepnij faktyczne rozróżnienie konta
    const uid = isDemo ? 'demo' : 'actual-uid-from-auth';

    void this.dashboardService.loadStats(uid);
  }


  subscriptionChartData = () => ({
    labels: this.chartLabels(),
    datasets: [
      {
        data: this.dashboardService.stats()?.summary?.subscriptions?.data ?? [],
        label: 'Subscriptions',
        backgroundColor: '#42A5F5',
      }
    ]
  });

  clicksChartData = () => ({
    labels: this.chartLabels(),
    datasets: [
      {
        data: this.dashboardService.stats()?.summary?.clicks?.data ?? [],
        label: 'Clicks',
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
          label: 'Displays',
        }
      ]
    };
  }
}
