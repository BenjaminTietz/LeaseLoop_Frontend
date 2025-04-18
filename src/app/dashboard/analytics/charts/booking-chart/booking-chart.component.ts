import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
export class BookingChartComponent {
  private analyticsService = inject(AnalyticsService);
  chartOptions = signal<{
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
    title: ApexTitleSubtitle;
  } | null>(null);

  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();

    console.log('📡 Triggering getBookingData:', { from, to, property, unit });
    this.analyticsService.getBookingData(from, to, property, unit);
  }

  constructor() {
    effect(
      () => {
        const rawData = this.analyticsService.bookingData() as any;
        const data = rawData?.properties ?? {};

        const labels: string[] = [];
        const series: number[] = [];

        for (const propertyId in data) {
          const units = data[propertyId].units;
          for (const unitId in units) {
            const stats = units[unitId];
            const label = `Property ${propertyId} - Unit ${unitId}`;
            labels.push(label);
            series.push(stats.confirmed ?? stats.total ?? 0);
          }
        }

        this.chartOptions.set({
          series,
          chart: {
            type: 'pie',
            width: 400,
          },
          labels,
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: { width: 300 },
                legend: { position: 'bottom' },
              },
            },
          ],
          title: { text: 'Bookings per Unit (Confirmed or Total)' },
        });
      },
      { allowSignalWrites: true }
    );
  }
}
