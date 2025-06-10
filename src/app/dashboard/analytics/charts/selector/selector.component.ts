import { Component, inject, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties-service/properties.service';
import { UnitsService } from '../../../../services/units-service/units.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import { subDays, subWeeks, subMonths, subYears, format } from 'date-fns';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss',
})
export class SelectorComponent {
  propertyService = inject(PropertiesService);
  analyticsService = inject(AnalyticsService);
  UnitService = inject(UnitsService);
  constructor() {}

  /**
   * Called when the period select changes. Updates the selected period, from date and to date
   * based on the new period. Then calls updateAllAnalytics to update all the analytics.
   * @param period The new period
   */
  onPeriodChange(period: 'day' | 'week' | 'month' | 'year') {
    this.analyticsService.selectedPeriod.set(period);
    const today = new Date();
    let from: Date;
    switch (period) {
      case 'day':
        from = today;
        break;
      case 'week':
        from = subWeeks(today, 1);
        break;
      case 'month':
        from = subMonths(today, 1);
        break;
      case 'year':
        from = subYears(today, 1);
        break;
      default:
        from = subMonths(today, 1);
    }
    const formattedFrom = format(from, 'yyyy-MM-dd');
    const formattedTo = format(today, 'yyyy-MM-dd');
    this.analyticsService.dateFrom.set(formattedFrom);
    this.analyticsService.dateTo.set(formattedTo);
    this.analyticsService.updateAllAnalytics(formattedFrom, formattedTo);
  }

  /**
   * Updates the analytics data based on the new date range selected by the user
   * @param type - The type of date to update ('from' or 'to')
   * @param value - The new value of the date
   */
  onCustomDateChange(type: 'from' | 'to', value: string) {
    if (type === 'from') {
      this.analyticsService.dateFrom.set(value);
    } else {
      this.analyticsService.dateTo.set(value);
    }
    this.analyticsService.updateAllAnalytics(
      this.analyticsService.dateFrom(),
      this.analyticsService.dateTo()
    );
    this.analyticsService.selectedPeriod.set(null as any);
  }
}
