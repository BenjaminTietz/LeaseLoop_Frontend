import { Component, effect, inject, computed } from '@angular/core';
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
  public analyticsService = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  chartOptions = computed<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    fill: ApexFill;
    theme: { mode: 'light' | 'dark' };
  } | null>(() => {
    const data = this.analyticsService.revenueGroupedData();
    const dark = this.themeService.currentTheme() === 'dark';
    if (!data || data.length === 0) return null;
    return {
      series: [
        {
          name: 'Revenue',
          data: data.map((item) => parseFloat(item.revenue.toFixed(2))),
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
      },
      xaxis: {
        type: 'category',
        categories: data.map((item) => item.name),
        labels: {
          style: {
            colors: dark ? 'white' : 'black',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: dark ? 'white' : 'black',
          },
        },
      },
      title: {
        offsetX: 20,
        theme: dark ? 'dark' : 'light',
        text: 'Grouped Revenue',
        style: {
          color: dark ? 'white' : 'black',
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      fill: {
        colors: dark ? ['#179E7F'] : ['#FFD006'],
      },

      dataLabels: {
        enabled: true,
        theme: dark ? 'dark' : 'light',
        style: {
          colors: dark ? ['white'] : ['black'],
        },
        formatter: function (val: number) {
          return `${val.toFixed(0)} €`;
        },
      },
      grid: {
        strokeDashArray: 4,
      },
      tooltip: {
        theme: dark ? 'dark' : 'light',
        marker: {
          fillColors: dark ? ['#179E7F'] : ['#FFD006'],
        },
        y: {
          formatter: (val: number) => `${val.toFixed(2)} €`,
        },
      },
      theme: {
        mode: dark ? 'dark' : 'light',
      },
    };
  });

  /**
   * Calls getRevenueGroupedData when component is initialized.
   * getRevenueGroupedData fetches revenue grouped by date from backend and updates the component's state.
   */
  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    this.analyticsService.getRevenueGroupedData(from, to);
  }

  /**
   * Watches for changes in grouped revenue data and current theme.
   * Updates component's state with new categories and series data when grouped revenue data changes.
   * Updates component's theme when current theme changes.
   */
  constructor() {
    effect(
      () => {
        const isDark = this.themeService.currentTheme() === 'dark';
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
      },
      { allowSignalWrites: true }
    );
  }
}
