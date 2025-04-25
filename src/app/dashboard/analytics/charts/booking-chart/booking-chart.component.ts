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
import { ThemeService } from '../../../../services/theme-service/theme.service';
import { style } from '@angular/animations';
@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './booking-chart.component.html',
  styleUrl: './booking-chart.component.scss',
})
export class BookingChartComponent {
  private analyticsService = inject(AnalyticsService);
  themeService = inject(ThemeService);
  rawData = computed(() => this.analyticsService.bookingData() as any);
  data = computed(() => {
    const raw = this.rawData(); // ✅ call computed like a function
    return raw?.properties ?? {};
  });
  dark = computed(() => this.themeService.currentTheme() === 'dark');

  chartOptions = computed<{
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
    title: ApexTitleSubtitle;
  } | null>(() => {
    const properties = this.data();

    if (!properties || Object.keys(properties).length === 0) return null;

    const labels: string[] = [];
    const series: number[] = [];
    for (const propertyId in properties) {
      const property = properties[propertyId];
      const propertyName = property.name ?? `Property ${propertyId}`;
      const units = property.units;

      for (const unitId in units) {
        const unit = units[unitId];
        const unitName = unit.name ?? `Unit ${unitId}`;
        const stats = unit;
        const label = `${propertyName} - ${unitName}`;
        labels.push(label);
        series.push(stats.confirmed ?? stats.total ?? 0);
      }
    }

    return {
      series,
      chart: {
        type: 'pie',
        foreColor: this.dark() ? '#FFFFFF' : '#000000',
        width: 600,
      },
      labels,
      responsive: [
        {
          breakpoint: 700,
          options: {
            chart: {
              width: 600,
            },
            legend: {
              show: true,
              position: 'bottom',
              labels: {
                colors: this.dark() ? ['white'] : ['black'],
              },
            },
          },
        },
      ],
      title: {
        text: 'Bookings per Unit (Confirmed or Total)',
        style: {
          color: this.dark() ? 'white' : 'black',
        },
      },
      legend: {
        labels: {
          colors: this.dark() ? ['white'] : ['black'],
        },
        style: {
          width: '100%',
        },
      },
      tooltip: {
        style: {
          fontSize: '14px',
          color: this.dark() ? 'white' : 'black',
        },
      },
    };
  });

  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();
    this.analyticsService.getBookingData(from, to, property, unit);
  }

  constructor() {}
}
