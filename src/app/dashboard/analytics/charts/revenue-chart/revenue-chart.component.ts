import { Component, OnInit, signal } from '@angular/core';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import { CommonModule } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ChartComponent,
  ChartType,
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
})
export class RevenueChartComponent implements OnInit {
  chartOptions = signal<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
    grid: ApexGrid;
  } | null>(null);

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    const fromDate = '2025-01-01';
    const toDate = '2025-03-31';

    this.analyticsService.getRevenueData(fromDate, toDate);

    const revenueSignal = this.analyticsService.revenueData;

    this.chartOptions.set({
      series: [
        {
          name: 'Revenue',
          data: revenueSignal().map((item) => item.revenue),
        },
      ],
      chart: {
        height: 350,
        type: 'bar' as ChartType,
      },
      title: {
        text: 'Monthly Revenue',
      },
      xaxis: {
        categories: revenueSignal().map((item) => item.month),
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
    });
  }
}
