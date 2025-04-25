import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  isSignal,
  computed,
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
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: dark ? 'white' : 'black',
          },
        },
      },
      title: {
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
      },
      grid: {
        strokeDashArray: 4,
      },
      tooltip: {
        theme: dark ? 'dark' : 'light',
        marker: {
          fillColors: dark ? ['#179E7F'] : ['#FFD006'],
        }
      },
      theme: {
        mode: dark ? 'dark' : 'light',
      },
    };
  });


  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();

    this.analyticsService.getRevenueGroupedData(from, to, property, unit);

  }

  constructor() {
    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      const groupedRevenue = this.analyticsService.revenueGroupedData();

      if (!groupedRevenue || !Array.isArray(groupedRevenue) || groupedRevenue.length === 0) {
        return;
      }

      const categories = groupedRevenue.map((item) => item.name);
      const seriesData = groupedRevenue.map((item) =>
        parseFloat(item.revenue.toFixed(2))
      );

    }, { allowSignalWrites: true });
  }
}
