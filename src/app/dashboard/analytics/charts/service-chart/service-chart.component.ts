import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
} from 'ng-apexcharts';

@Component({
  selector: 'app-service-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './service-chart.component.html',
  styleUrl: './service-chart.component.scss',
})
export class ServiceChartComponent implements OnInit {
  chartOptions = signal<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
  } | null>(null);

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    const from = '2025-01-01';
    const to = '2025-03-31';
    this.analyticsService.getServiceData(from, to);

    const data = this.analyticsService.serviceData();

    this.chartOptions.set({
      series: [
        {
          name: 'Revenue',
          data: data.map((s) => s.revenue),
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      title: {
        text: 'Top Services by Revenue',
      },
      xaxis: {
        categories: data.map((s) => s.service_name),
      },
      dataLabels: {
        enabled: true,
      },
    });
  }
}
