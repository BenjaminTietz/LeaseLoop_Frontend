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

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
})
export class RevenueChartComponent {
  private analyticsService = inject(AnalyticsService);
  chartOptions = signal<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
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
          chart: { type: 'bar', height: 350 },
          xaxis: { categories },
          title: { text: 'Revenue by Property/Unit' },
          stroke: { curve: 'smooth' },
          dataLabels: { enabled: false },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5,
            },
          },
        });
      },
      { allowSignalWrites: true }
    );
  }
}
