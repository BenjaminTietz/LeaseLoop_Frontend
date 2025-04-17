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
import type { BookingStats } from '../../../../models/analytics.models';
@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './booking-chart.component.html',
  styleUrl: './booking-chart.component.scss',
})
export class BookingChartComponent {
  private analyticsService = inject(AnalyticsService);
}
