import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AnalyticsService } from '../../services/analytics-service/analytics.service';
import { BookingChartComponent } from './charts/booking-chart/booking-chart.component';
import { ServiceChartComponent } from './charts/service-chart/service-chart.component';
import { RevenueChartComponent } from './charts/revenue-chart/revenue-chart.component';
import { SelectorComponent } from './charts/selector/selector.component';
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    BookingChartComponent,
    ServiceChartComponent,
    RevenueChartComponent,
    SelectorComponent,
    SelectorComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  analyticsService = inject(AnalyticsService);

  constructor() {}

  ngOnInit(): void {}
}
