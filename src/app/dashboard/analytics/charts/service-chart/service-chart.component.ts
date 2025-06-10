import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { ThemeService } from '../../../../services/theme-service/theme.service';

@Component({
  selector: 'app-service-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './service-chart.component.html',
  styleUrl: './service-chart.component.scss',
})
export class ServiceChartComponent implements OnInit {
  analyticsService = inject(AnalyticsService);
  themeService = inject(ThemeService);
  data = computed(() => this.analyticsService.serviceData());
  dark = computed(() => this.themeService.currentTheme() === 'dark');

  chartOptions = computed(
    () =>
      <
        {
          series: ApexAxisChartSeries;
          chart: ApexChart;
          xaxis: ApexXAxis;
          dataLabels: ApexDataLabels;
          yaxis: ApexYAxis;
          title: ApexTitleSubtitle;
          tooltip: ApexTooltip;
          fill: ApexFill;
        } | null
      >{
        series: [
          {
            name: 'Sales',
            data: this.data().map((s) => s.sales),
          },
        ],

        fill: {
          colors: this.dark() ? ['#179E7F'] : ['#FFD006'],
        },
        chart: {
          type: 'bar',
          height: 350,
          toolbar: { show: false },
        },
        title: {
          offsetX: 20,
          text: 'Top Services by Sales',
          style: {
            color: this.dark() ? '#fff' : '#000',
          },
        },
        xaxis: {
          categories: this.data().map((s) => s.name),
          labels: {
            style: {
              colors: this.dark() ? '#fff' : '#000',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: this.dark() ? '#fff' : '#000',
            },
          },
        },
        tooltip: {
          theme: this.dark() ? 'dark' : 'light',
          marker: {
            fillColors: this.dark() ? ['#179E7F'] : ['#FFD006'],
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: this.dark() ? ['white'] : ['black'],
          },
        },
      }
  );

  constructor() {}

  /**
   * Initializes the component by fetching service data for a specified date range.
   * Retrieves the 'from' and 'to' dates from the AnalyticsService and
   * uses them to request the service data, which is used for rendering the chart.
   */

  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    this.analyticsService.getServiceData(from, to);
  }
}
