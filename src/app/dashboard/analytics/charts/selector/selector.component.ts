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
  }
}
