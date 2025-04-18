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

@Component({
  selector: 'app-service-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './service-chart.component.html',
  styleUrl: './service-chart.component.scss',
})
export class ServiceChartComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  chartOptions = signal<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
  } | null>(null);

  constructor() {
    effect(
      () => {
        const data = this.analyticsService.serviceData();

        this.chartOptions.set({
          series: [
            {
              name: 'Sales',
              data: data.map((s) => s.sales),
            },
          ],
          chart: {
            type: 'bar',
            height: 350,
          },
          title: {
            text: 'Top Services by Sales',
          },
          xaxis: {
            categories: data.map((s) => s.name),
          },
          dataLabels: {
            enabled: true,
          },
        });
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();

    this.analyticsService.getServiceData(from, to, property, unit);

    console.log(
      'Service Chart:',
      { from, to, property, unit },
      this.analyticsService.serviceData()
    );
  }
}
