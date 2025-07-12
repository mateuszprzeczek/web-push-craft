import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ChartConfiguration, ChartType} from 'chart.js';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {MatCard, MatCardTitle} from "@angular/material/card";
import {MatToolbar} from "@angular/material/toolbar";

@Component({
  selector: 'app-web-push-dashboard',
  standalone: true,
  imports: [NgChartsModule, CommonModule, MatCard, MatCardTitle, MatToolbar],
  templateUrl: './web-push-dashboard.component.html',
  styleUrl: './web-push-dashboard.component.scss',
})
export class WebPushDashboardComponent implements OnInit {
  subscriberChartData: ChartConfiguration<'bar'>['data'] = {labels: [], datasets: []};
  messageChartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {legend: {display: true}},
  };

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/stats')
      .subscribe(data => {
        this.subscriberChartData = {
          labels: data.labels,
          datasets: [
            {data: data.subscribers, label: 'Subskrypcje', backgroundColor: 'rgba(0,123,255,0.5)'},
          ]
        };

        this.messageChartData = {
          labels: data.labels,
          datasets: [
            {data: data.sentMessages, label: 'Wysłane wiadomości', borderColor: 'rgba(40,167,69,1)', fill: false},
          ]
        };
      });
  }
}
