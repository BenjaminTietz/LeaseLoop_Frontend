import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  isSignal,
} from '@angular/core';
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
  ChartType,
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

import { ThemeService } from '../../../../services/theme-service/theme.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
})
export class RevenueChartComponent {
  private analyticsService = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  chartOptions = signal<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    theme: { mode: 'light' | 'dark' };
  } | null>(null);

  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();

    this.analyticsService.getRevenueGroupedData(from, to, property, unit);
  }

  constructor() {
    effect(
      () => {
        const groupedRevenue = this.analyticsService.revenueGroupedData();
        const isDark = this.themeService.getCurrentTheme() === 'dark';
        console.log('isdark', isDark);

        if (
          !groupedRevenue ||
          !Array.isArray(groupedRevenue) ||
          groupedRevenue.length === 0
        ) {
          return;
        }

        const categories = groupedRevenue.map((item) => item.name);
        const seriesData = groupedRevenue.map((item) =>
          parseFloat(item.revenue.toFixed(2))
        );

        this.chartOptions.set({
          series: [{ name: 'Revenue', data: seriesData }],
          chart: { type: 'bar', height: 350, background: 'transparent' },
          theme: { mode: isDark ? 'dark' : 'light' },
          xaxis: {
            categories,
            labels: {
              style: {
                colors: isDark ? '#fff' : '#000',
              },
            },
          },
          title: {
            text: 'Revenue by Property/Unit',
            style: {
              color: isDark ? '#fff' : '#000',
            },
          },
          stroke: { curve: 'smooth' },
          dataLabels: { enabled: false },
          grid: {
            borderColor: isDark ? '#444' : '#ccc',
            row: {
              colors: [isDark ? '#333' : '#f3f3f3', 'transparent'],
              opacity: 1,
            },
          },
        });
      },
      { allowSignalWrites: true }
    );
  }
}
