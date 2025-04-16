import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
} from 'ng-apexcharts';
@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './booking-chart.component.html',
  styleUrl: './booking-chart.component.scss',
})
export class BookingChartComponent implements OnInit {
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
    const from = '2025-01-01';
    const to = '2025-03-31';

    this.analyticsService.getBookingData(from, to);

    const data = this.analyticsService.bookingData();

    this.chartOptions.set({
      series: [
        {
          name: 'Bookings',
          data: data.map((d) => d.bookings),
        },
      ],
      chart: {
        type: 'line',
        height: 350,
      },
      title: {
        text: 'Daily Bookings',
      },
      xaxis: {
        categories: data.map((d) => d.date),
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
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
