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
import { RevenueStats } from '../../../../models/analytics.models';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
})
export class RevenueChartComponent {
  private analyticsService = inject(AnalyticsService);
}
