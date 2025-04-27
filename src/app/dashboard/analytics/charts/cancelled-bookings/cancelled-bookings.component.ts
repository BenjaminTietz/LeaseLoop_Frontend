import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
} from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import { ThemeService } from '../../../../services/theme-service/theme.service';

@Component({
  selector: 'app-cancelled-bookings',
  standalone: true,

  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './cancelled-bookings.component.html',
  styleUrl: './cancelled-bookings.component.scss',
})
export class CancelledBookingsComponent {
  private analyticsService = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  rawData = computed(() => this.analyticsService.cancelledBookingsData());
  dark = computed(() => this.themeService.currentTheme() === 'dark');

  chartOptions = computed<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    colors: string[];
    stroke: ApexStroke;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    yaxis: ApexYAxis[];
    tooltip: ApexTooltip;
  } | null>(() => {
    const raw = this.rawData();
    if (!raw || !raw.series || raw.series.length < 3) return null;

    return {
      series: [
        {
          name: raw.series[0].name,
          type: 'column',
          data: raw.series[0].data,
        },
        {
          name: raw.series[1].name,
          type: 'column',
          data: raw.series[1].data,
        },
        {
          name: raw.series[2].name,
          type: 'line',
          data: raw.series[2].data,
        },
      ],
      chart: {
        type: 'line',
        height: 350,
        stacked: false,
        foreColor: this.dark() ? '#FFFFFF' : '#000000',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false
        },
      },
      xaxis: {
        categories: raw.categories,
        title: { text: 'Year' },
      },
      colors: ['#99C2A2', '#FF7979', '#66C7F4'],
      stroke: {
        width: [4, 4, 4],
      },
      plotOptions: {
        bar: {
          columnWidth: '30%',
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        labels: {
          colors: this.dark() ? ['white'] : ['black'],
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: this.dark()? 'dark' : 'light',
        marker: {
          fillColors: this.dark() ? ['#179E7F'] : ['#FFD006'],
        }
      },
      yaxis: [
        {
          title: {
            text: 'Bookings',
          },
          labels: {
            formatter: (val) => val.toFixed(0),
          },
        },
        {
          opposite: true,
          title: {
            text: 'Cancellation Rate (%)',
          },
          labels: {
            formatter: (val) => `${val.toFixed(1)}%`,
          },
          max: 100,
        },
      ],
    };
  });

  constructor() {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();
    this.analyticsService.getCancelledBookingsData(from, to, property, unit);
  }
}
